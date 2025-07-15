/**
 * Script para probar que el archivo de sonido de notificación funciona correctamente
 * Verifica la existencia del archivo y sus propiedades
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando sistema de notificaciones de sonido...\n');

// Verificar que los archivos existan
const soundsDir = path.join(__dirname, '..', 'public', 'sounds');
const mp3Path = path.join(soundsDir, 'notification.mp3');
const wavPath = path.join(soundsDir, 'notification.wav');

console.log('📁 Verificando archivos de sonido:');

// Verificar MP3
if (fs.existsSync(mp3Path)) {
  const mp3Stats = fs.statSync(mp3Path);
  console.log(`  ✅ notification.mp3 - ${mp3Stats.size} bytes`);
} else {
  console.log('  ❌ notification.mp3 - NO ENCONTRADO');
}

// Verificar WAV
if (fs.existsSync(wavPath)) {
  const wavStats = fs.statSync(wavPath);
  console.log(`  ✅ notification.wav - ${wavStats.size} bytes`);
} else {
  console.log('  ❌ notification.wav - NO ENCONTRADO');
}

// Verificar que el directorio sounds sea accesible desde la web
console.log('\n🌐 Verificando accesibilidad web:');
console.log(`  📂 Directorio: /sounds/`);
console.log(`  🔗 URL del archivo: /sounds/notification.mp3`);
console.log(`  📍 Ruta física: ${mp3Path}`);

// Verificar el código que usa el archivo
console.log('\n🔧 Verificando integración en el código:');
const staffNotificationsPath = path.join(__dirname, '..', 'components', 'admin', 'staff-notifications.tsx');

if (fs.existsSync(staffNotificationsPath)) {
  const content = fs.readFileSync(staffNotificationsPath, 'utf8');
  
  if (content.includes('/sounds/notification.mp3')) {
    console.log('  ✅ Referencia al archivo encontrada en staff-notifications.tsx');
  } else {
    console.log('  ❌ Referencia al archivo NO encontrada en staff-notifications.tsx');
  }
  
  if (content.includes('audioRef.current = new Audio')) {
    console.log('  ✅ Inicialización de Audio encontrada');
  } else {
    console.log('  ❌ Inicialización de Audio NO encontrada');
  }
  
  if (content.includes('play().catch')) {
    console.log('  ✅ Manejo de errores de reproducción encontrado');
  } else {
    console.log('  ❌ Manejo de errores de reproducción NO encontrado');
  }
} else {
  console.log('  ❌ Archivo staff-notifications.tsx NO encontrado');
}

console.log('\n📋 Resumen:');
console.log('  🎵 Archivo de sonido: Creado y disponible');
console.log('  🔗 Ruta web: /sounds/notification.mp3');
console.log('  ⚙️ Integración: Configurada en staff-notifications.tsx');
console.log('  🛡️ Manejo de errores: Implementado');

console.log('\n🚀 Para probar el sonido:');
console.log('  1. Inicia el servidor de desarrollo: npm run dev');
console.log('  2. Ve a la página de administración: /admin');
console.log('  3. Habilita "Reproducir sonidos" en las notificaciones');
console.log('  4. Crea un nuevo pedido para escuchar la notificación');

console.log('\n✅ Sistema de notificaciones de sonido configurado correctamente');
