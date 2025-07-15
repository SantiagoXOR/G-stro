#!/usr/bin/env node

/**
 * Script para configurar Clerk con credenciales de producción
 * 
 * Este script ayuda a configurar las variables de entorno de Clerk
 * con credenciales de producción reales.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Función para crear interfaz de readline
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Función para hacer preguntas al usuario
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Función para validar clave pública de Clerk
function validatePublishableKey(key) {
  return key.startsWith('pk_live_') || key.startsWith('pk_test_');
}

// Función para validar clave secreta de Clerk
function validateSecretKey(key) {
  return key.startsWith('sk_live_') || key.startsWith('sk_test_');
}

// Función para validar webhook secret
function validateWebhookSecret(secret) {
  return secret.startsWith('whsec_');
}

// Función principal
async function main() {
  log('\n=== CONFIGURACIÓN DE CLERK PARA PRODUCCIÓN ===\n', colors.bright + colors.blue);
  
  const rl = createReadlineInterface();
  
  try {
    log('Este script te ayudará a configurar Clerk con credenciales de producción.', colors.cyan);
    log('Necesitarás las siguientes credenciales de tu dashboard de Clerk:\n', colors.cyan);
    log('1. Publishable Key (pk_live_... o pk_test_...)', colors.yellow);
    log('2. Secret Key (sk_live_... o sk_test_...)', colors.yellow);
    log('3. Webhook Secret (whsec_...)', colors.yellow);
    log('');
    
    // Preguntar por las credenciales
    const publishableKey = await askQuestion(rl, 'Ingresa tu Clerk Publishable Key: ');
    if (!validatePublishableKey(publishableKey)) {
      log('❌ Clave pública inválida. Debe comenzar con pk_live_ o pk_test_', colors.red);
      process.exit(1);
    }
    
    const secretKey = await askQuestion(rl, 'Ingresa tu Clerk Secret Key: ');
    if (!validateSecretKey(secretKey)) {
      log('❌ Clave secreta inválida. Debe comenzar con sk_live_ o sk_test_', colors.red);
      process.exit(1);
    }
    
    const webhookSecret = await askQuestion(rl, 'Ingresa tu Clerk Webhook Secret: ');
    if (!validateWebhookSecret(webhookSecret)) {
      log('❌ Webhook secret inválido. Debe comenzar con whsec_', colors.red);
      process.exit(1);
    }
    
    // Leer el archivo .env actual
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Actualizar las variables de Clerk
    envContent = updateEnvVariable(envContent, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', publishableKey);
    envContent = updateEnvVariable(envContent, 'CLERK_SECRET_KEY', secretKey);
    envContent = updateEnvVariable(envContent, 'CLERK_WEBHOOK_SECRET', webhookSecret);
    
    // Escribir el archivo actualizado
    fs.writeFileSync(envPath, envContent);
    
    log('\n✅ Variables de entorno de Clerk actualizadas correctamente!', colors.green);
    log('\nPróximos pasos:', colors.bright);
    log('1. Configura el webhook en tu dashboard de Clerk:', colors.yellow);
    log(`   URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/clerk`, colors.cyan);
    log('2. Ejecuta las pruebas de autenticación:', colors.yellow);
    log('   npm run test:auth', colors.cyan);
    log('3. Verifica que el middleware esté funcionando:', colors.yellow);
    log('   npm run dev', colors.cyan);
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Función para actualizar una variable de entorno
function updateEnvVariable(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const newLine = `${key}=${value}`;
  
  if (regex.test(content)) {
    return content.replace(regex, newLine);
  } else {
    return content + `\n${newLine}`;
  }
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
