// Script para configurar Supabase: aplicar migraciones y generar tipos

const { spawn } = require('child_process');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Función para ejecutar un comando
function runCommand(command, errorMessage) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.cyan}Ejecutando: ${command}${colors.reset}`);
    
    const [cmd, ...args] = command.split(' ');
    const proc = spawn(cmd, args, { 
      shell: true,
      stdio: 'inherit'
    });
    
    proc.on('close', (code) => {
      if (code !== 0) {
        console.error(`${colors.red}${errorMessage || 'Error al ejecutar el comando'}${colors.reset}`);
        reject(new Error(`El comando falló con código de salida ${code}`));
      } else {
        resolve(true);
      }
    });
  });
}

// Función principal
async function setupSupabase() {
  try {
    console.log(`\n${colors.bright}${colors.blue}=== CONFIGURANDO SUPABASE ===\n${colors.reset}`);
    
    // Verificar la conexión a Supabase
    console.log(`\n${colors.bright}${colors.magenta}1. Verificando conexión a Supabase...${colors.reset}`);
    await runCommand('node scripts/check-supabase.js', 'Error al verificar la conexión a Supabase');
    
    // Aplicar migraciones
    console.log(`\n${colors.bright}${colors.magenta}2. Aplicando migraciones...${colors.reset}`);
    await runCommand('node scripts/apply-migrations.js', 'Error al aplicar las migraciones');
    
    // Generar tipos TypeScript
    console.log(`\n${colors.bright}${colors.magenta}3. Generando tipos TypeScript...${colors.reset}`);
    await runCommand('node scripts/generate-types.js', 'Error al generar los tipos TypeScript');
    
    // Verificar la seguridad
    console.log(`\n${colors.bright}${colors.magenta}4. Verificando la seguridad...${colors.reset}`);
    await runCommand('node scripts/check-supabase-security-simple.js', 'Error al verificar la seguridad');
    
    console.log(`\n${colors.bright}${colors.green}¡Configuración de Supabase completada con éxito!${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.bright}${colors.red}Error durante la configuración de Supabase: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Ejecutar la función principal
setupSupabase();
