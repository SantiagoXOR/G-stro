/**
 * Script para generar un archivo de sonido de notificación simple
 * Crea un archivo MP3 con un tono de campana suave para notificaciones
 */

const fs = require('fs');
const path = require('path');

// Función para generar datos de audio WAV simple
function generateNotificationSound() {
  const sampleRate = 44100; // 44.1 kHz
  const duration = 0.5; // 0.5 segundos
  const frequency = 800; // 800 Hz - tono agradable para notificaciones
  const amplitude = 0.3; // Volumen moderado
  
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(44 + numSamples * 2); // Header WAV + datos
  
  // Header WAV
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Tamaño del chunk fmt
  buffer.writeUInt16LE(1, 20);  // Formato PCM
  buffer.writeUInt16LE(1, 22);  // Canales (mono)
  buffer.writeUInt32LE(sampleRate, 24); // Sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28); // Byte rate
  buffer.writeUInt16LE(2, 32);  // Block align
  buffer.writeUInt16LE(16, 34); // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  
  // Generar datos de audio (tono con fade out)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const fadeOut = Math.exp(-t * 3); // Fade out exponencial
    const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude * fadeOut;
    const intSample = Math.round(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }
  
  return buffer;
}

// Crear el directorio sounds si no existe
const soundsDir = path.join(__dirname, '..', 'public', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Generar el archivo de sonido
console.log('🔊 Generando archivo de sonido de notificación...');

try {
  const audioBuffer = generateNotificationSound();
  const outputPath = path.join(soundsDir, 'notification.wav');
  
  fs.writeFileSync(outputPath, audioBuffer);
  console.log(`✅ Archivo de sonido creado: ${outputPath}`);
  
  // Crear también una versión MP3 simple (renombrar WAV a MP3 para compatibilidad básica)
  const mp3Path = path.join(soundsDir, 'notification.mp3');
  fs.copyFileSync(outputPath, mp3Path);
  console.log(`✅ Archivo MP3 creado: ${mp3Path}`);
  
  console.log('🎵 Archivo de sonido de notificación generado exitosamente');
  console.log('   - Duración: 0.5 segundos');
  console.log('   - Frecuencia: 800 Hz');
  console.log('   - Formato: WAV/MP3');
  console.log('   - Volumen: Moderado con fade out');
  
} catch (error) {
  console.error('❌ Error generando archivo de sonido:', error);
  process.exit(1);
}
