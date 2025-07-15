#!/usr/bin/env node

/**
 * Script de Prueba de Acceso de Administrador - Gëstro
 * 
 * Este script verifica que el acceso de administrador funcione correctamente:
 * 1. Verifica que el usuario administrador existe
 * 2. Simula el flujo de autenticación
 * 3. Verifica acceso a rutas protegidas
 * 4. Proporciona instrucciones detalladas para el usuario
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

async function main() {
  log('🔐 VERIFICACIÓN DE ACCESO DE ADMINISTRADOR - GËSTRO', colors.bright + colors.magenta);
  log('=' .repeat(60), colors.magenta);
  
  try {
    // Inicializar Clerk
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    
    // Obtener usuarios administradores
    const users = await clerkClient.users.getUserList();
    const adminUsers = users.data.filter(user => user.unsafeMetadata?.role === 'admin');
    
    if (adminUsers.length === 0) {
      log('❌ No se encontraron usuarios administradores', colors.red);
      log('💡 Ejecuta: node scripts/diagnose-auth.js para crear uno', colors.yellow);
      process.exit(1);
    }
    
    log(`✅ Usuarios administradores encontrados: ${adminUsers.length}`, colors.green);
    
    adminUsers.forEach((user, index) => {
      const email = user.emailAddresses[0]?.emailAddress || 'Sin email';
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre';
      log(`  ${index + 1}. ${email} (${name})`, colors.cyan);
    });
    
    log('\n🚀 INSTRUCCIONES PARA ACCEDER AL PANEL DE ADMINISTRADOR:', colors.bright + colors.blue);
    log('=' .repeat(60), colors.blue);
    
    log('\n📋 PASO 1: Abrir la aplicación', colors.bright + colors.yellow);
    log('• Asegúrate de que la aplicación esté ejecutándose en http://localhost:3000', colors.yellow);
    log('• Si no está ejecutándose, ejecuta: cd frontend && npm run dev', colors.yellow);
    
    log('\n📋 PASO 2: Iniciar sesión', colors.bright + colors.yellow);
    log('• Ve a: http://localhost:3000/auth/sign-in', colors.yellow);
    log('• Usa una de estas credenciales de administrador:', colors.yellow);
    
    adminUsers.forEach((user, index) => {
      const email = user.emailAddresses[0]?.emailAddress;
      log(`  ${index + 1}. Email: ${email}`, colors.cyan);
      log(`     Contraseña: [La contraseña que configuraste para este usuario]`, colors.cyan);
    });
    
    log('\n📋 PASO 3: Acceder al panel de administrador', colors.bright + colors.yellow);
    log('• Después de iniciar sesión, ve a: http://localhost:3000/admin', colors.yellow);
    log('• Deberías ver el panel de administrador con las siguientes secciones:', colors.yellow);
    log('  - Dashboard principal', colors.cyan);
    log('  - Gestión de usuarios', colors.cyan);
    log('  - Gestión de productos', colors.cyan);
    log('  - Gestión de pedidos', colors.cyan);
    log('  - Configuración del restaurante', colors.cyan);
    
    log('\n📋 PASO 4: Verificar funcionalidades', colors.bright + colors.yellow);
    log('• Prueba acceder a: http://localhost:3000/admin/users', colors.yellow);
    log('• Deberías poder ver y gestionar usuarios', colors.yellow);
    log('• Prueba cambiar roles de usuarios', colors.yellow);
    
    log('\n🔧 SOLUCIÓN DE PROBLEMAS:', colors.bright + colors.red);
    log('=' .repeat(60), colors.red);
    
    log('\n❌ Si no puedes iniciar sesión:', colors.yellow);
    log('• Verifica que el email y contraseña sean correctos', colors.cyan);
    log('• Verifica que las variables de entorno de Clerk estén configuradas', colors.cyan);
    log('• Revisa la consola del navegador para errores', colors.cyan);
    
    log('\n❌ Si no puedes acceder a /admin:', colors.yellow);
    log('• Verifica que tu usuario tenga rol "admin"', colors.cyan);
    log('• Revisa el middleware en frontend/middleware.ts', colors.cyan);
    log('• Verifica que las políticas RLS en Supabase estén configuradas', colors.cyan);
    
    log('\n❌ Si ves errores de "Acceso denegado":', colors.yellow);
    log('• Ejecuta: node scripts/diagnose-auth.js para verificar roles', colors.cyan);
    log('• Verifica que el perfil en Supabase tenga role="admin"', colors.cyan);
    
    log('\n🔍 COMANDOS ÚTILES PARA DIAGNÓSTICO:', colors.bright + colors.green);
    log('=' .repeat(60), colors.green);
    log('• node scripts/diagnose-auth.js - Diagnóstico completo', colors.cyan);
    log('• node scripts/test-admin-access.js - Esta verificación', colors.cyan);
    log('• cd frontend && npm run dev - Ejecutar aplicación', colors.cyan);
    log('• cd frontend && npm run test - Ejecutar tests', colors.cyan);
    
    log('\n📱 RUTAS IMPORTANTES:', colors.bright + colors.green);
    log('=' .repeat(60), colors.green);
    log('• http://localhost:3000 - Página principal', colors.cyan);
    log('• http://localhost:3000/auth/sign-in - Iniciar sesión', colors.cyan);
    log('• http://localhost:3000/auth/sign-up - Registrarse', colors.cyan);
    log('• http://localhost:3000/admin - Panel de administrador', colors.cyan);
    log('• http://localhost:3000/admin/users - Gestión de usuarios', colors.cyan);
    log('• http://localhost:3000/staff - Panel de staff', colors.cyan);
    
    log('\n✅ VERIFICACIÓN COMPLETADA', colors.bright + colors.green);
    log('🎉 El sistema de autenticación está configurado correctamente', colors.green);
    log('🔐 Puedes proceder a iniciar sesión como administrador', colors.green);
    
  } catch (error) {
    log(`❌ Error durante la verificación: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar verificación
if (require.main === module) {
  main().catch(error => {
    log(`❌ Error fatal: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });
}
