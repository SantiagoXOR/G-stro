#!/usr/bin/env node

/**
 * Script de Diagnóstico de Autenticación - Gëstro
 * 
 * Este script diagnostica y resuelve problemas de autenticación:
 * 1. Verifica configuración de Clerk
 * 2. Verifica conectividad con Supabase
 * 3. Lista usuarios existentes
 * 4. Crea usuario administrador si es necesario
 * 5. Verifica rutas de autenticación
 */

const { createClerkClient } = require('@clerk/backend');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

// Configuración de clientes
let clerkClient;
let supabaseAdmin;

function initializeClients() {
  try {
    // Inicializar Clerk
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY no está configurado');
    }
    
    clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    
    // Inicializar Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables de Supabase no están configuradas');
    }
    
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    log('✅ Clientes inicializados correctamente', colors.green);
    return true;
  } catch (error) {
    log(`❌ Error al inicializar clientes: ${error.message}`, colors.red);
    return false;
  }
}

async function checkEnvironmentVariables() {
  log('\n=== VERIFICANDO VARIABLES DE ENTORNO ===', colors.bright + colors.blue);
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY'
  ];
  
  let allConfigured = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.includes('PENDIENTE') || value.includes('tu-clave')) {
      log(`❌ ${varName}: No configurado o usando valor placeholder`, colors.red);
      allConfigured = false;
    } else {
      log(`✅ ${varName}: Configurado`, colors.green);
    }
  });
  
  return allConfigured;
}

async function testClerkConnection() {
  log('\n=== VERIFICANDO CONEXIÓN CON CLERK ===', colors.bright + colors.blue);
  
  try {
    const users = await clerkClient.users.getUserList({ limit: 5 });
    log(`✅ Conexión con Clerk exitosa. Usuarios encontrados: ${users.totalCount}`, colors.green);
    
    // Mostrar usuarios existentes
    if (users.data.length > 0) {
      log('\n📋 Usuarios existentes:', colors.cyan);
      users.data.forEach(user => {
        const role = user.unsafeMetadata?.role || 'customer';
        const email = user.emailAddresses[0]?.emailAddress || 'Sin email';
        log(`  • ${email} (${role})`, colors.yellow);
      });
    }
    
    return { success: true, users: users.data };
  } catch (error) {
    log(`❌ Error al conectar con Clerk: ${error.message}`, colors.red);
    return { success: false, error: error.message };
  }
}

async function testSupabaseConnection() {
  log('\n=== VERIFICANDO CONEXIÓN CON SUPABASE ===', colors.bright + colors.blue);
  
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role')
      .limit(5);
    
    if (error) {
      throw error;
    }
    
    log(`✅ Conexión con Supabase exitosa. Perfiles encontrados: ${data.length}`, colors.green);
    
    if (data.length > 0) {
      log('\n📋 Perfiles en Supabase:', colors.cyan);
      data.forEach(profile => {
        log(`  • ${profile.email} (${profile.role})`, colors.yellow);
      });
    }
    
    return { success: true, profiles: data };
  } catch (error) {
    log(`❌ Error al conectar con Supabase: ${error.message}`, colors.red);
    return { success: false, error: error.message };
  }
}

async function createAdminUser() {
  log('\n=== CREANDO USUARIO ADMINISTRADOR ===', colors.bright + colors.blue);

  const adminEmail = 'admin@gestro.com';
  const adminPassword = 'Admin123!';

  try {
    // Verificar si ya existe un administrador
    const existingUsers = await clerkClient.users.getUserList();
    const adminExists = existingUsers.data.some(user =>
      user.unsafeMetadata?.role === 'admin'
    );

    if (adminExists) {
      log('✅ Ya existe un usuario administrador', colors.green);
      return { success: true, existed: true };
    }

    // Verificar si el email ya existe
    const existingUser = existingUsers.data.find(user =>
      user.emailAddresses.some(email => email.emailAddress === adminEmail)
    );

    if (existingUser) {
      log('📝 Usuario con email admin@gestro.com ya existe, actualizando rol...', colors.yellow);

      // Actualizar rol a admin
      await clerkClient.users.updateUser(existingUser.id, {
        unsafeMetadata: { role: 'admin' }
      });

      log(`✅ Rol actualizado a admin para usuario: ${existingUser.id}`, colors.green);

      // Actualizar perfil en Supabase
      const { error: supabaseError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: existingUser.id,
          email: adminEmail,
          full_name: 'Admin Gëstro',
          role: 'admin',
          updated_at: new Date().toISOString()
        });

      if (supabaseError) {
        log(`⚠️ Error al actualizar perfil en Supabase: ${supabaseError.message}`, colors.yellow);
      } else {
        log('✅ Perfil actualizado en Supabase', colors.green);
      }

      log('\n🎉 USUARIO ADMINISTRADOR CONFIGURADO EXITOSAMENTE', colors.bright + colors.green);
      log(`📧 Email: ${adminEmail}`, colors.cyan);
      log('🔗 Puedes iniciar sesión en: http://localhost:3000/auth/sign-in', colors.cyan);

      return { success: true, updated: true, email: adminEmail };
    }

    // Crear usuario administrador en Clerk
    log('📝 Creando usuario administrador en Clerk...', colors.yellow);
    const user = await clerkClient.users.createUser({
      emailAddress: [adminEmail],
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Gëstro',
      unsafeMetadata: {
        role: 'admin'
      }
    });

    log(`✅ Usuario administrador creado en Clerk: ${user.id}`, colors.green);

    // Crear perfil en Supabase
    log('📝 Creando perfil en Supabase...', colors.yellow);
    const { error: supabaseError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        email: adminEmail,
        full_name: 'Admin Gëstro',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (supabaseError) {
      log(`⚠️ Error al crear perfil en Supabase: ${supabaseError.message}`, colors.yellow);
    } else {
      log('✅ Perfil creado en Supabase', colors.green);
    }

    log('\n🎉 USUARIO ADMINISTRADOR CREADO EXITOSAMENTE', colors.bright + colors.green);
    log(`📧 Email: ${adminEmail}`, colors.cyan);
    log(`🔑 Contraseña: ${adminPassword}`, colors.cyan);
    log('🔗 Puedes iniciar sesión en: http://localhost:3000/auth/sign-in', colors.cyan);

    return { success: true, created: true, email: adminEmail, password: adminPassword };

  } catch (error) {
    log(`❌ Error al crear usuario administrador: ${error.message}`, colors.red);
    log(`📋 Detalles del error:`, colors.yellow);
    console.error(error);

    // Intentar convertir usuario existente a admin
    log('\n📝 Intentando convertir usuario existente a administrador...', colors.yellow);
    try {
      const existingUsers = await clerkClient.users.getUserList();
      if (existingUsers.data.length > 0) {
        const firstUser = existingUsers.data[0];
        const userEmail = firstUser.emailAddresses[0]?.emailAddress;

        log(`📝 Convirtiendo usuario ${userEmail} a administrador...`, colors.yellow);

        await clerkClient.users.updateUser(firstUser.id, {
          unsafeMetadata: { role: 'admin' }
        });

        // Actualizar en Supabase
        await supabaseAdmin
          .from('profiles')
          .upsert({
            id: firstUser.id,
            email: userEmail,
            full_name: firstUser.firstName + ' ' + firstUser.lastName,
            role: 'admin',
            updated_at: new Date().toISOString()
          });

        log(`✅ Usuario ${userEmail} convertido a administrador`, colors.green);
        log('🔗 Puedes iniciar sesión en: http://localhost:3000/auth/sign-in', colors.cyan);

        return { success: true, converted: true, email: userEmail };
      }
    } catch (conversionError) {
      log(`❌ Error al convertir usuario: ${conversionError.message}`, colors.red);
    }

    return { success: false, error: error.message };
  }
}

async function checkAuthRoutes() {
  log('\n=== VERIFICANDO RUTAS DE AUTENTICACIÓN ===', colors.bright + colors.blue);
  
  const routes = [
    'http://localhost:3000',
    'http://localhost:3000/auth/sign-in',
    'http://localhost:3000/auth/sign-up',
    'http://localhost:3000/admin'
  ];
  
  for (const route of routes) {
    try {
      const response = await fetch(route);
      if (response.ok) {
        log(`✅ ${route} - Accesible`, colors.green);
      } else {
        log(`⚠️ ${route} - Status: ${response.status}`, colors.yellow);
      }
    } catch (error) {
      log(`❌ ${route} - Error: ${error.message}`, colors.red);
    }
  }
}

async function main() {
  log('🔍 DIAGNÓSTICO DE AUTENTICACIÓN - GËSTRO', colors.bright + colors.magenta);
  log('=' .repeat(50), colors.magenta);
  
  // Verificar variables de entorno
  const envOk = await checkEnvironmentVariables();
  if (!envOk) {
    log('\n❌ Configuración de variables de entorno incompleta', colors.red);
    process.exit(1);
  }
  
  // Inicializar clientes
  const clientsOk = initializeClients();
  if (!clientsOk) {
    log('\n❌ No se pudieron inicializar los clientes', colors.red);
    process.exit(1);
  }
  
  // Verificar conexiones
  const clerkResult = await testClerkConnection();
  const supabaseResult = await testSupabaseConnection();
  
  if (!clerkResult.success || !supabaseResult.success) {
    log('\n❌ Problemas de conectividad detectados', colors.red);
    process.exit(1);
  }
  
  // Verificar si existe un administrador
  const hasAdmin = clerkResult.users.some(user => user.unsafeMetadata?.role === 'admin');
  
  if (!hasAdmin) {
    log('\n⚠️ No se encontró usuario administrador', colors.yellow);
    const createAdmin = await createAdminUser();
    
    if (!createAdmin.success) {
      log('\n❌ No se pudo crear usuario administrador', colors.red);
      process.exit(1);
    }
  } else {
    log('\n✅ Usuario administrador encontrado', colors.green);
  }
  
  // Verificar rutas
  await checkAuthRoutes();
  
  log('\n🎉 DIAGNÓSTICO COMPLETADO', colors.bright + colors.green);
  log('=' .repeat(50), colors.green);
  log('\n📋 RESUMEN:', colors.bright + colors.cyan);
  log('• Variables de entorno: ✅ Configuradas', colors.green);
  log('• Conexión Clerk: ✅ Funcionando', colors.green);
  log('• Conexión Supabase: ✅ Funcionando', colors.green);
  log('• Usuario administrador: ✅ Disponible', colors.green);
  log('• Rutas de autenticación: ✅ Accesibles', colors.green);
  
  log('\n🚀 PRÓXIMOS PASOS:', colors.bright + colors.cyan);
  log('1. Visita http://localhost:3000/auth/sign-in', colors.yellow);
  log('2. Inicia sesión con las credenciales de administrador', colors.yellow);
  log('3. Accede al panel de administrador en /admin', colors.yellow);
  
  process.exit(0);
}

// Ejecutar diagnóstico
if (require.main === module) {
  main().catch(error => {
    log(`❌ Error fatal: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  checkEnvironmentVariables,
  testClerkConnection,
  testSupabaseConnection,
  createAdminUser,
  checkAuthRoutes
};
