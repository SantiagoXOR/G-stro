/**
 * Script para ejecutar todas las pruebas del proyecto
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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

// Función para imprimir mensajes con formato
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Función para ejecutar un comando y manejar errores
function runCommand(command, errorMessage) {
  try {
    log(`\n${colors.bright}${colors.cyan}Ejecutando: ${command}${colors.reset}\n`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`\n${colors.bright}${colors.red}${errorMessage}${colors.reset}\n`);
    log(`Error: ${error.message}`, colors.red);
    return false;
  }
}

// Verificar que estamos en la carpeta correcta
const frontendDir = path.join(process.cwd(), 'frontend');
if (!fs.existsSync(frontendDir)) {
  log('Este script debe ejecutarse desde la raíz del proyecto.', colors.red);
  process.exit(1);
}

// Función principal
async function main() {
  log('\n=== EJECUTANDO PRUEBAS DEL PROYECTO ===\n', colors.bright + colors.blue);
  
  // Verificar dependencias
  log('Verificando dependencias...', colors.cyan);
  if (!runCommand('cd frontend && npm list jest cypress --depth=0', 'Faltan dependencias. Asegúrate de haber instalado jest y cypress.')) {
    log('Instalando dependencias faltantes...', colors.yellow);
    runCommand('cd frontend && npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom cypress start-server-and-test', 'Error al instalar dependencias.');
  }
  
  // Ejecutar pruebas unitarias
  log('\n=== PRUEBAS UNITARIAS ===\n', colors.bright + colors.magenta);
  const unitTestsSuccess = runCommand('cd frontend && npm test', 'Las pruebas unitarias han fallado.');
  
  // Ejecutar pruebas de integración (headless)
  log('\n=== PRUEBAS DE INTEGRACIÓN (HEADLESS) ===\n', colors.bright + colors.magenta);
  const integrationTestsSuccess = runCommand('cd frontend && npx cypress run', 'Las pruebas de integración han fallado.');
  
  // Resumen
  log('\n=== RESUMEN DE PRUEBAS ===\n', colors.bright + colors.blue);
  log(`Pruebas unitarias: ${unitTestsSuccess ? colors.green + 'PASARON' : colors.red + 'FALLARON'}`, colors.bright);
  log(`Pruebas de integración: ${integrationTestsSuccess ? colors.green + 'PASARON' : colors.red + 'FALLARON'}`, colors.bright);
  
  // Sugerencias
  if (!unitTestsSuccess || !integrationTestsSuccess) {
    log('\n=== SUGERENCIAS ===\n', colors.bright + colors.yellow);
    log('- Revisa los errores específicos en los logs de las pruebas', colors.yellow);
    log('- Para ver más detalles de las pruebas unitarias: cd frontend && npm run test:watch', colors.yellow);
    log('- Para ver más detalles de las pruebas de integración: cd frontend && npm run cypress', colors.yellow);
    process.exit(1);
  }
  
  log('\n¡Todas las pruebas han pasado correctamente!\n', colors.bright + colors.green);
}

// Ejecutar función principal
main().catch(error => {
  log(`Error inesperado: ${error.message}`, colors.red);
  process.exit(1);
});
