#!/usr/bin/env node

/**
 * Script para diagnosticar errores de Clerk
 * 
 * Este script verifica:
 * 1. Variables de entorno de Clerk
 * 2. Formato de claves
 * 3. Configuración del ClerkProvider
 * 4. Estado del middleware
 */

const fs = require('fs');
const path = require('path');

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

// Función para validar clave pública de Clerk
function validatePublishableKey(key) {
  if (!key) return { valid: false, reason: 'Clave no definida' };
  if (key.includes('XXXXXXXXXXXXXXXXXXXXXXXX')) return { valid: false, reason: 'Clave placeholder' };
  if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) {
    return { valid: false, reason: 'Formato inválido (debe comenzar con pk_test_ o pk_live_)' };
  }
  return { valid: true, reason: 'Válida' };
}

// Función para validar clave secreta de Clerk
function validateSecretKey(key) {
  if (!key) return { valid: false, reason: 'Clave no definida' };
  if (key.includes('XXXXXXXXXXXXXXXXXXXXXXXX')) return { valid: false, reason: 'Clave placeholder' };
  if (!key.startsWith('sk_test_') && !key.startsWith('sk_live_')) {
    return { valid: false, reason: 'Formato inválido (debe comenzar con sk_test_ o sk_live_)' };
  }
  return { valid: true, reason: 'Válida' };
}

// Función para leer variables de entorno desde archivo
function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        vars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return vars;
}

// Función principal de diagnóstico
function diagnoseClerkConfiguration() {
  log('\n=== DIAGNÓSTICO DE CONFIGURACIÓN DE CLERK ===\n', colors.bright + colors.blue);
  
  let hasErrors = false;
  
  // 1. Verificar archivos de variables de entorno
  log('1. VERIFICANDO ARCHIVOS DE VARIABLES DE ENTORNO', colors.bright + colors.cyan);
  
  const envFiles = [
    { path: '.env', name: 'Archivo .env principal' },
    { path: 'frontend/.env.local', name: 'Archivo .env.local del frontend' }
  ];
  
  const allEnvVars = {};
  
  envFiles.forEach(({ path: filePath, name }) => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      log(`   ✅ ${name} existe`, colors.green);
      const vars = readEnvFile(fullPath);
      Object.assign(allEnvVars, vars);
    } else {
      log(`   ❌ ${name} no encontrado`, colors.red);
      hasErrors = true;
    }
  });
  
  // 2. Verificar variables de Clerk
  log('\n2. VERIFICANDO VARIABLES DE CLERK', colors.bright + colors.cyan);
  
  const clerkVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'CLERK_WEBHOOK_SECRET'
  ];
  
  clerkVars.forEach(varName => {
    const value = allEnvVars[varName] || process.env[varName];
    
    if (!value) {
      log(`   ❌ ${varName}: No definida`, colors.red);
      hasErrors = true;
    } else if (varName === 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY') {
      const validation = validatePublishableKey(value);
      if (validation.valid) {
        log(`   ✅ ${varName}: ${validation.reason}`, colors.green);
      } else {
        log(`   ❌ ${varName}: ${validation.reason}`, colors.red);
        hasErrors = true;
      }
    } else if (varName === 'CLERK_SECRET_KEY') {
      const validation = validateSecretKey(value);
      if (validation.valid) {
        log(`   ✅ ${varName}: ${validation.reason}`, colors.green);
      } else {
        log(`   ❌ ${varName}: ${validation.reason}`, colors.red);
        hasErrors = true;
      }
    } else {
      if (value.includes('PENDIENTE') || value.includes('XXXXXXXXXXXXXXXXXXXXXXXX')) {
        log(`   ⚠️ ${varName}: Valor placeholder`, colors.yellow);
      } else {
        log(`   ✅ ${varName}: Configurado`, colors.green);
      }
    }
  });
  
  // 3. Verificar ClerkProvider
  log('\n3. VERIFICANDO CONFIGURACIÓN DEL CLERKPROVIDER', colors.bright + colors.cyan);
  
  const clerkProviderPath = path.join(process.cwd(), 'frontend/components/clerk-provider.tsx');
  if (fs.existsSync(clerkProviderPath)) {
    log('   ✅ ClerkProvider existe', colors.green);
    
    const content = fs.readFileSync(clerkProviderPath, 'utf8');
    if (content.includes('validateClerkKey')) {
      log('   ✅ ClerkProvider tiene validación de claves', colors.green);
    } else {
      log('   ⚠️ ClerkProvider sin validación de claves', colors.yellow);
    }
  } else {
    log('   ❌ ClerkProvider no encontrado', colors.red);
    hasErrors = true;
  }
  
  // 4. Verificar layout principal
  log('\n4. VERIFICANDO LAYOUT PRINCIPAL', colors.bright + colors.cyan);
  
  const layoutPath = path.join(process.cwd(), 'frontend/app/layout.tsx');
  if (fs.existsSync(layoutPath)) {
    const content = fs.readFileSync(layoutPath, 'utf8');
    
    if (content.includes('ClerkProvider')) {
      log('   ✅ Layout usa ClerkProvider', colors.green);
    } else {
      log('   ❌ Layout no usa ClerkProvider', colors.red);
      hasErrors = true;
    }
  } else {
    log('   ❌ Layout principal no encontrado', colors.red);
    hasErrors = true;
  }
  
  // 5. Verificar middleware
  log('\n5. VERIFICANDO MIDDLEWARE', colors.bright + colors.cyan);
  
  const middlewarePath = path.join(process.cwd(), 'frontend/middleware.ts');
  if (fs.existsSync(middlewarePath)) {
    const content = fs.readFileSync(middlewarePath, 'utf8');
    
    if (content.includes('validateClerkKey')) {
      log('   ✅ Middleware tiene validación condicional', colors.green);
    } else {
      log('   ⚠️ Middleware sin validación condicional', colors.yellow);
    }
  } else {
    log('   ❌ Middleware no encontrado', colors.red);
    hasErrors = true;
  }
  
  // Resumen
  log('\n=== RESUMEN ===', colors.bright + colors.blue);
  
  if (hasErrors) {
    log('❌ Se encontraron errores en la configuración de Clerk', colors.red);
    log('\nSoluciones recomendadas:', colors.yellow);
    log('1. Ejecutar: npm run clerk:setup', colors.cyan);
    log('2. Verificar: npm run clerk:verify', colors.cyan);
    log('3. Probar: npm run dev', colors.cyan);
  } else {
    log('✅ Configuración de Clerk parece correcta', colors.green);
    log('\nPuedes intentar ejecutar la aplicación:', colors.cyan);
    log('npm run dev', colors.bright);
  }
}

// Ejecutar diagnóstico
if (require.main === module) {
  diagnoseClerkConfiguration();
}

module.exports = { diagnoseClerkConfiguration };
