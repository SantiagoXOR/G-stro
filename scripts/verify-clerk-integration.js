#!/usr/bin/env node

/**
 * Script para verificar la integración completa de Clerk con Supabase
 * 
 * Este script verifica:
 * 1. Variables de entorno configuradas
 * 2. Webhook funcionando
 * 3. Sincronización con Supabase
 * 4. Políticas RLS
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

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

// Función para verificar variables de entorno
function checkEnvironmentVariables() {
  log('\n=== VERIFICANDO VARIABLES DE ENTORNO ===', colors.bright + colors.blue);
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'CLERK_WEBHOOK_SECRET'
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

// Función para verificar conexión a Supabase
async function checkSupabaseConnection() {
  log('\n=== VERIFICANDO CONEXIÓN A SUPABASE ===', colors.bright + colors.blue);
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      log(`❌ Error de conexión: ${error.message}`, colors.red);
      return false;
    }
    
    log('✅ Conexión a Supabase exitosa', colors.green);
    return true;
  } catch (error) {
    log(`❌ Error inesperado: ${error.message}`, colors.red);
    return false;
  }
}

// Función para verificar estructura de la tabla profiles
async function checkProfilesTable() {
  log('\n=== VERIFICANDO TABLA PROFILES ===', colors.bright + colors.blue);
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Verificar que la tabla existe y tiene las columnas necesarias
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_at, updated_at')
      .limit(1);
    
    if (error) {
      log(`❌ Error al acceder a la tabla profiles: ${error.message}`, colors.red);
      return false;
    }
    
    log('✅ Tabla profiles accesible con estructura correcta', colors.green);
    return true;
  } catch (error) {
    log(`❌ Error inesperado: ${error.message}`, colors.red);
    return false;
  }
}

// Función para verificar el webhook de Clerk
async function checkClerkWebhook() {
  log('\n=== VERIFICANDO WEBHOOK DE CLERK ===', colors.bright + colors.blue);
  
  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/clerk`;
    
    // Intentar hacer una petición GET al webhook (debería devolver 405 Method Not Allowed)
    const response = await fetch(webhookUrl, { method: 'GET' });
    
    if (response.status === 405) {
      log('✅ Endpoint del webhook accesible', colors.green);
      log(`   URL: ${webhookUrl}`, colors.cyan);
      return true;
    } else {
      log(`❌ Respuesta inesperada del webhook: ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Error al verificar webhook: ${error.message}`, colors.red);
    return false;
  }
}

// Función para verificar políticas RLS
async function checkRLSPolicies() {
  log('\n=== VERIFICANDO POLÍTICAS RLS ===', colors.bright + colors.blue);
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Verificar que RLS está habilitado en la tabla profiles
    const { data, error } = await supabase
      .rpc('pgexec', {
        sql: `
          SELECT schemaname, tablename, rowsecurity 
          FROM pg_tables 
          WHERE tablename = 'profiles' AND schemaname = 'public'
        `
      });
    
    if (error) {
      log(`❌ Error al verificar RLS: ${error.message}`, colors.red);
      return false;
    }
    
    if (data && data.length > 0 && data[0].rowsecurity) {
      log('✅ RLS habilitado en la tabla profiles', colors.green);
      return true;
    } else {
      log('❌ RLS no está habilitado en la tabla profiles', colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Error inesperado: ${error.message}`, colors.red);
    return false;
  }
}

// Función principal
async function main() {
  log('\n=== VERIFICACIÓN DE INTEGRACIÓN CLERK + SUPABASE ===\n', colors.bright + colors.magenta);
  
  const checks = [
    { name: 'Variables de entorno', fn: checkEnvironmentVariables },
    { name: 'Conexión a Supabase', fn: checkSupabaseConnection },
    { name: 'Tabla profiles', fn: checkProfilesTable },
    { name: 'Webhook de Clerk', fn: checkClerkWebhook },
    { name: 'Políticas RLS', fn: checkRLSPolicies }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const result = await check.fn();
      if (!result) {
        allPassed = false;
      }
    } catch (error) {
      log(`❌ Error en verificación ${check.name}: ${error.message}`, colors.red);
      allPassed = false;
    }
  }
  
  log('\n=== RESUMEN ===', colors.bright + colors.blue);
  
  if (allPassed) {
    log('✅ Todas las verificaciones pasaron correctamente!', colors.green);
    log('\nLa integración Clerk + Supabase está lista para usar.', colors.cyan);
    log('\nPróximos pasos:', colors.bright);
    log('1. Ejecutar las pruebas de autenticación: npm run test:auth', colors.yellow);
    log('2. Probar el flujo completo en el navegador: npm run dev', colors.yellow);
  } else {
    log('❌ Algunas verificaciones fallaron.', colors.red);
    log('\nRevisa los errores anteriores y corrige la configuración.', colors.yellow);
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
