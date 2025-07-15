#!/usr/bin/env node

const { exec } = require('child_process');
require('colors');

console.log('🚀 Abriendo Vercel Dashboard...'.cyan.bold);

const vercelUrl = 'https://vercel.com/dashboard';

// Detectar el sistema operativo y abrir el navegador
const platform = process.platform;
let command;

switch (platform) {
  case 'win32':
    command = `start ${vercelUrl}`;
    break;
  case 'darwin':
    command = `open ${vercelUrl}`;
    break;
  case 'linux':
    command = `xdg-open ${vercelUrl}`;
    break;
  default:
    console.log('❌ Sistema operativo no soportado para abrir automáticamente el navegador'.red);
    console.log(`🔗 Abre manualmente: ${vercelUrl}`.yellow);
    process.exit(1);
}

exec(command, (error) => {
  if (error) {
    console.log('❌ Error al abrir el navegador automáticamente'.red);
    console.log(`🔗 Abre manualmente: ${vercelUrl}`.yellow);
  } else {
    console.log('✅ Vercel Dashboard abierto en el navegador'.green);
    console.log('\n📋 Próximos pasos en Vercel:'.cyan);
    console.log('   1. Haz clic en "New Project"');
    console.log('   2. Conecta tu repositorio GitHub');
    console.log('   3. Selecciona el repositorio G-stro');
    console.log('   4. Configura el directorio raíz como "frontend"');
    console.log('   5. Agrega las variables de entorno');
    console.log('   6. Haz clic en "Deploy"');
  }
});
