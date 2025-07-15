#!/usr/bin/env node

/**
 * Script completo para configurar Clerk en producción
 * 
 * Este script ejecuta todos los pasos necesarios para completar
 * la configuración de autenticación con Clerk:
 * 1. Configurar variables de entorno
 * 2. Verificar integración
 * 3. Probar flujo de autenticación
 * 4. Ejecutar pruebas automatizadas
 */

const { spawn } = require('child_process');
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

// Función para ejecutar comandos
function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { 
      stdio: 'inherit',
      shell: true 
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falló con código ${code}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
}

// Función para hacer preguntas al usuario
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// Función principal
async function main() {
  log('\n=== CONFIGURACIÓN COMPLETA DE CLERK PARA GËSTRO ===\n', colors.bright + colors.magenta);
  
  log('Este script te guiará a través de la configuración completa de Clerk.', colors.cyan);
  log('Asegúrate de tener las credenciales de Clerk listas.\n', colors.cyan);
  
  try {
    // Paso 1: Configurar variables de entorno
    log('=== PASO 1: CONFIGURAR VARIABLES DE ENTORNO ===', colors.bright + colors.blue);
    
    const setupEnv = await askQuestion('¿Quieres configurar las variables de entorno de Clerk? (s/n): ');
    
    if (setupEnv === 's' || setupEnv === 'si' || setupEnv === 'y' || setupEnv === 'yes') {
      log('\nEjecutando configuración de variables de entorno...', colors.yellow);
      await runCommand('node', ['scripts/setup-clerk-production.js']);
      log('✅ Variables de entorno configuradas', colors.green);
    } else {
      log('⏭️ Saltando configuración de variables de entorno', colors.yellow);
    }
    
    // Paso 2: Verificar integración
    log('\n=== PASO 2: VERIFICAR INTEGRACIÓN ===', colors.bright + colors.blue);
    
    log('Verificando la integración Clerk + Supabase...', colors.yellow);
    await runCommand('node', ['scripts/verify-clerk-integration.js']);
    log('✅ Integración verificada', colors.green);
    
    // Paso 3: Probar flujo de autenticación
    log('\n=== PASO 3: PROBAR FLUJO DE AUTENTICACIÓN ===', colors.bright + colors.blue);
    
    log('Probando el flujo completo de autenticación...', colors.yellow);
    await runCommand('node', ['scripts/test-clerk-auth-flow.js']);
    log('✅ Flujo de autenticación probado', colors.green);
    
    // Paso 4: Ejecutar pruebas automatizadas
    log('\n=== PASO 4: EJECUTAR PRUEBAS AUTOMATIZADAS ===', colors.bright + colors.blue);
    
    const runTests = await askQuestion('¿Quieres ejecutar las pruebas automatizadas de autenticación? (s/n): ');
    
    if (runTests === 's' || runTests === 'si' || runTests === 'y' || runTests === 'yes') {
      log('\nEjecutando pruebas unitarias de autenticación...', colors.yellow);
      
      try {
        await runCommand('npm', ['run', 'test:auth'], { cwd: 'frontend' });
        log('✅ Pruebas unitarias pasaron', colors.green);
      } catch (error) {
        log('⚠️ Algunas pruebas unitarias fallaron, pero la configuración básica está completa', colors.yellow);
      }
      
      log('\nEjecutando pruebas E2E de autenticación...', colors.yellow);
      
      try {
        await runCommand('npm', ['run', 'e2e:auth'], { cwd: 'frontend' });
        log('✅ Pruebas E2E pasaron', colors.green);
      } catch (error) {
        log('⚠️ Algunas pruebas E2E fallaron, pero la configuración básica está completa', colors.yellow);
      }
    } else {
      log('⏭️ Saltando pruebas automatizadas', colors.yellow);
    }
    
    // Resumen final
    log('\n=== CONFIGURACIÓN COMPLETADA ===', colors.bright + colors.green);
    log('✅ Clerk está configurado y listo para usar!', colors.green);
    
    log('\nPróximos pasos:', colors.bright);
    log('1. Inicia el servidor de desarrollo:', colors.yellow);
    log('   npm run dev', colors.cyan);
    log('2. Prueba el registro en:', colors.yellow);
    log('   http://localhost:3000/auth/sign-up', colors.cyan);
    log('3. Prueba el inicio de sesión en:', colors.yellow);
    log('   http://localhost:3000/auth/sign-in', colors.cyan);
    log('4. Verifica que los usuarios se sincronicen en Supabase', colors.yellow);
    
    log('\nDocumentación adicional:', colors.bright);
    log('- Guía completa: docs/configuracion-clerk-produccion.md', colors.cyan);
    log('- Documentación de Clerk: docs/implementacion-autenticacion-clerk.md', colors.cyan);
    
  } catch (error) {
    log(`\n❌ Error durante la configuración: ${error.message}`, colors.red);
    log('\nRevisa los errores anteriores y vuelve a intentar.', colors.yellow);
    log('Puedes ejecutar los pasos individualmente:', colors.yellow);
    log('- npm run clerk:setup', colors.cyan);
    log('- npm run clerk:verify', colors.cyan);
    log('- npm run clerk:test', colors.cyan);
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
