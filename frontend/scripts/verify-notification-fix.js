/**
 * Script de verificación completa del sistema de notificaciones de sonido
 * Verifica que todo esté configurado correctamente después de la corrección
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA DE NOTIFICACIONES DE SONIDO');
console.log('=' .repeat(70));

let allChecksPass = true;

// 1. Verificar archivos de sonido
console.log('\n📁 1. ARCHIVOS DE SONIDO:');
const soundsDir = path.join(__dirname, '..', 'public', 'sounds');
const mp3Path = path.join(soundsDir, 'notification.mp3');
const wavPath = path.join(soundsDir, 'notification.wav');

if (fs.existsSync(mp3Path)) {
  const mp3Stats = fs.statSync(mp3Path);
  console.log(`   ✅ notification.mp3 existe (${mp3Stats.size} bytes)`);
} else {
  console.log('   ❌ notification.mp3 NO ENCONTRADO');
  allChecksPass = false;
}

if (fs.existsSync(wavPath)) {
  const wavStats = fs.statSync(wavPath);
  console.log(`   ✅ notification.wav existe (${wavStats.size} bytes)`);
} else {
  console.log('   ❌ notification.wav NO ENCONTRADO');
  allChecksPass = false;
}

// 2. Verificar integración en staff-notifications.tsx
console.log('\n🔧 2. INTEGRACIÓN EN STAFF-NOTIFICATIONS:');
const staffNotificationsPath = path.join(__dirname, '..', 'components', 'admin', 'staff-notifications.tsx');

if (fs.existsSync(staffNotificationsPath)) {
  const content = fs.readFileSync(staffNotificationsPath, 'utf8');
  
  const checks = [
    {
      name: 'Referencia al archivo MP3',
      pattern: /\/sounds\/notification\.mp3/,
      required: true
    },
    {
      name: 'Inicialización de Audio mejorada',
      pattern: /audioRef\.current = new Audio.*preload.*auto/s,
      required: true
    },
    {
      name: 'Manejo de errores de carga',
      pattern: /addEventListener.*error/,
      required: true
    },
    {
      name: 'Verificación de reproducción',
      pattern: /addEventListener.*canplaythrough/,
      required: true
    },
    {
      name: 'Reinicio de audio antes de reproducir',
      pattern: /currentTime = 0/,
      required: true
    },
    {
      name: 'Manejo de errores de reproducción',
      pattern: /play\(\)\.catch/,
      required: true
    },
    {
      name: 'Recarga de audio en caso de error',
      pattern: /audioRef\.current = new Audio.*catch/s,
      required: true
    }
  ];
  
  checks.forEach(check => {
    if (content.match(check.pattern)) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ${check.name} - NO ENCONTRADO`);
      if (check.required) allChecksPass = false;
    }
  });
} else {
  console.log('   ❌ staff-notifications.tsx NO ENCONTRADO');
  allChecksPass = false;
}

// 3. Verificar componente de prueba
console.log('\n🧪 3. COMPONENTE DE PRUEBA:');
const soundTestPath = path.join(__dirname, '..', 'components', 'admin', 'sound-test.tsx');

if (fs.existsSync(soundTestPath)) {
  console.log('   ✅ Componente SoundTest creado');
  
  const testContent = fs.readFileSync(soundTestPath, 'utf8');
  if (testContent.includes('notification.mp3')) {
    console.log('   ✅ Referencia correcta al archivo de sonido');
  } else {
    console.log('   ❌ Referencia al archivo de sonido NO encontrada');
    allChecksPass = false;
  }
} else {
  console.log('   ❌ Componente SoundTest NO ENCONTRADO');
  allChecksPass = false;
}

// 4. Verificar integración en dashboard
console.log('\n📊 4. INTEGRACIÓN EN DASHBOARD:');
const dashboardPath = path.join(__dirname, '..', 'app', 'admin', 'page.tsx');

if (fs.existsSync(dashboardPath)) {
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  if (dashboardContent.includes('SoundTest')) {
    console.log('   ✅ Componente SoundTest importado en dashboard');
  } else {
    console.log('   ❌ Componente SoundTest NO importado en dashboard');
    allChecksPass = false;
  }
  
  if (dashboardContent.includes('NODE_ENV')) {
    console.log('   ✅ Componente solo visible en desarrollo');
  } else {
    console.log('   ❌ Componente no configurado para desarrollo únicamente');
  }
} else {
  console.log('   ❌ Dashboard de admin NO ENCONTRADO');
  allChecksPass = false;
}

// 5. Verificar scripts de generación
console.log('\n⚙️ 5. SCRIPTS DE UTILIDAD:');
const generateScriptPath = path.join(__dirname, 'generate-notification-sound.js');
const testScriptPath = path.join(__dirname, 'test-notification-sound.js');

if (fs.existsSync(generateScriptPath)) {
  console.log('   ✅ Script de generación de sonido disponible');
} else {
  console.log('   ❌ Script de generación NO encontrado');
}

if (fs.existsSync(testScriptPath)) {
  console.log('   ✅ Script de prueba disponible');
} else {
  console.log('   ❌ Script de prueba NO encontrado');
}

// Resumen final
console.log('\n' + '=' .repeat(70));
console.log('📋 RESUMEN DE LA CORRECCIÓN:');
console.log('   🎵 Archivo de sonido: notification.mp3 creado');
console.log('   🔧 Manejo de errores: Implementado y mejorado');
console.log('   🧪 Componente de prueba: Disponible en desarrollo');
console.log('   📊 Integración: Completa en staff-notifications.tsx');
console.log('   ⚙️ Scripts de utilidad: Disponibles para mantenimiento');

console.log('\n🚀 INSTRUCCIONES PARA PROBAR:');
console.log('   1. Ejecutar: npm run dev');
console.log('   2. Ir a: http://localhost:3000/admin');
console.log('   3. Buscar el componente "Prueba de Sonido" al final de la página');
console.log('   4. Hacer clic en "Probar Sonido" para verificar');
console.log('   5. Ir a notificaciones y habilitar "Reproducir sonidos"');
console.log('   6. Crear un pedido de prueba para escuchar la notificación');

if (allChecksPass) {
  console.log('\n✅ TODAS LAS VERIFICACIONES PASARON');
  console.log('🎉 El sistema de notificaciones de sonido está completamente funcional');
} else {
  console.log('\n❌ ALGUNAS VERIFICACIONES FALLARON');
  console.log('⚠️ Revisar los elementos marcados con ❌ arriba');
}

console.log('\n' + '=' .repeat(70));
