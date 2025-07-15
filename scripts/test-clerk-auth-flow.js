#!/usr/bin/env node

/**
 * Script para probar el flujo completo de autenticación con Clerk
 * 
 * Este script simula y verifica:
 * 1. Creación de usuario via webhook
 * 2. Sincronización con Supabase
 * 3. Verificación de políticas RLS
 * 4. Gestión de roles
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Función para mostrar mensajes con colores
function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

// Función para generar un ID de usuario de prueba
function generateTestUserId() {
  return `user_test_${crypto.randomBytes(8).toString('hex')}`;
}

// Función para simular la creación de un usuario via webhook
async function simulateUserCreation() {
  log('\n=== SIMULANDO CREACIÓN DE USUARIO ===', colors.bright + colors.blue);
  
  const testUserId = generateTestUserId();
  const testEmail = `test_${Date.now()}@example.com`;
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Simular la inserción que haría el webhook
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: testEmail,
        name: 'Usuario de Prueba',
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      log(`❌ Error al crear usuario de prueba: ${error.message}`, colors.red);
      return null;
    }
    
    log(`✅ Usuario de prueba creado: ${testUserId}`, colors.green);
    log(`   Email: ${testEmail}`, colors.cyan);
    
    return { userId: testUserId, email: testEmail, profile: data };
  } catch (error) {
    log(`❌ Error inesperado: ${error.message}`, colors.red);
    return null;
  }
}

// Función para verificar políticas RLS con el usuario de prueba
async function testRLSPolicies(userId) {
  log('\n=== PROBANDO POLÍTICAS RLS ===', colors.bright + colors.blue);
  
  try {
    // Crear cliente con clave anónima (simula cliente frontend)
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Intentar acceder al perfil sin autenticación (debería fallar o estar limitado)
    const { data: publicData, error: publicError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId);
    
    if (publicError) {
      log('✅ RLS funcionando: acceso público restringido', colors.green);
    } else if (publicData && publicData.length === 0) {
      log('✅ RLS funcionando: no se devolvieron datos sin autenticación', colors.green);
    } else {
      log('⚠️ RLS podría no estar funcionando correctamente', colors.yellow);
    }
    
    // Verificar con clave de servicio (debería funcionar)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId);
    
    if (adminError) {
      log(`❌ Error con clave de servicio: ${adminError.message}`, colors.red);
      return false;
    }
    
    if (adminData && adminData.length > 0) {
      log('✅ Acceso con clave de servicio funcionando', colors.green);
      return true;
    }
    
    return false;
  } catch (error) {
    log(`❌ Error inesperado: ${error.message}`, colors.red);
    return false;
  }
}

// Función para probar actualización de roles
async function testRoleUpdate(userId) {
  log('\n=== PROBANDO ACTUALIZACIÓN DE ROLES ===', colors.bright + colors.blue);
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Actualizar rol a staff
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'staff', updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      log(`❌ Error al actualizar rol: ${error.message}`, colors.red);
      return false;
    }
    
    if (data.role === 'staff') {
      log('✅ Rol actualizado correctamente a staff', colors.green);
      
      // Volver a customer
      await supabase
        .from('profiles')
        .update({ role: 'customer', updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      log('✅ Rol restaurado a customer', colors.green);
      return true;
    }
    
    return false;
  } catch (error) {
    log(`❌ Error inesperado: ${error.message}`, colors.red);
    return false;
  }
}

// Función para limpiar datos de prueba
async function cleanupTestData(userId) {
  log('\n=== LIMPIANDO DATOS DE PRUEBA ===', colors.bright + colors.blue);
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      log(`❌ Error al limpiar datos: ${error.message}`, colors.red);
      return false;
    }
    
    log('✅ Datos de prueba eliminados', colors.green);
    return true;
  } catch (error) {
    log(`❌ Error inesperado: ${error.message}`, colors.red);
    return false;
  }
}

// Función principal
async function main() {
  log('\n=== PRUEBAS DE FLUJO DE AUTENTICACIÓN CLERK ===\n', colors.bright + colors.magenta);
  
  // Verificar variables de entorno
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('❌ Variables de entorno de Supabase no configuradas', colors.red);
    process.exit(1);
  }
  
  let testUser = null;
  let allTestsPassed = true;
  
  try {
    // 1. Simular creación de usuario
    testUser = await simulateUserCreation();
    if (!testUser) {
      allTestsPassed = false;
    }
    
    if (testUser) {
      // 2. Probar políticas RLS
      const rlsResult = await testRLSPolicies(testUser.userId);
      if (!rlsResult) {
        allTestsPassed = false;
      }
      
      // 3. Probar actualización de roles
      const roleResult = await testRoleUpdate(testUser.userId);
      if (!roleResult) {
        allTestsPassed = false;
      }
    }
    
  } finally {
    // Limpiar datos de prueba
    if (testUser) {
      await cleanupTestData(testUser.userId);
    }
  }
  
  log('\n=== RESUMEN DE PRUEBAS ===', colors.bright + colors.blue);
  
  if (allTestsPassed) {
    log('✅ Todas las pruebas de autenticación pasaron!', colors.green);
    log('\nEl flujo de autenticación Clerk + Supabase está funcionando correctamente.', colors.cyan);
  } else {
    log('❌ Algunas pruebas fallaron.', colors.red);
    log('\nRevisa la configuración y las políticas RLS.', colors.yellow);
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
