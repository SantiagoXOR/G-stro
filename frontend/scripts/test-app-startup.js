#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');
require('colors');

console.log('🚀 Probando el inicio de la aplicación...'.cyan);
console.log('=' .repeat(60));

let serverProcess;
let testPassed = false;

// Función para verificar si el servidor está respondiendo
function checkServer(port, callback) {
  const options = {
    hostname: 'localhost',
    port: port,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Servidor respondiendo en puerto ${port} con status: ${res.statusCode}`.green);
    callback(true);
  });

  req.on('error', (err) => {
    console.log(`❌ Error conectando al puerto ${port}: ${err.message}`.red);
    callback(false);
  });

  req.on('timeout', () => {
    console.log(`⏰ Timeout conectando al puerto ${port}`.yellow);
    req.destroy();
    callback(false);
  });

  req.end();
}

// Función para probar múltiples puertos
function testPorts(ports, index = 0) {
  if (index >= ports.length) {
    console.log('\n❌ No se pudo conectar a ningún puerto'.red);
    process.exit(1);
    return;
  }

  const port = ports[index];
  console.log(`🔍 Probando puerto ${port}...`.cyan);
  
  checkServer(port, (success) => {
    if (success) {
      console.log(`\n🎉 ¡Aplicación funcionando correctamente en puerto ${port}!`.green.bold);
      console.log(`🌐 URL: http://localhost:${port}`.blue);
      testPassed = true;
      process.exit(0);
    } else {
      testPorts(ports, index + 1);
    }
  });
}

// Función para iniciar el servidor
function startServer() {
  console.log('🔧 Iniciando servidor de desarrollo...'.cyan);
  
  serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
  });

  let serverReady = false;
  let serverPort = null;

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('📝 Server output:', output.trim());
    
    // Buscar el puerto en la salida
    const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
    if (portMatch) {
      serverPort = parseInt(portMatch[1]);
      console.log(`🔍 Detectado puerto: ${serverPort}`.blue);
    }
    
    // Verificar si el servidor está listo
    if (output.includes('Ready in') || output.includes('✓ Ready')) {
      serverReady = true;
      console.log('✅ Servidor listo!'.green);
      
      // Esperar un poco y luego probar la conexión
      setTimeout(() => {
        if (serverPort) {
          testPorts([serverPort]);
        } else {
          testPorts([3000, 3001, 3002, 3003]);
        }
      }, 2000);
    }
  });

  serverProcess.stderr.on('data', (data) => {
    const error = data.toString();
    console.log('❌ Server error:', error.trim().red);
    
    // Si hay un error crítico, terminar
    if (error.includes('EPERM') || error.includes('Cannot read properties of undefined')) {
      console.log('\n🚨 Error crítico detectado!'.red.bold);
      process.exit(1);
    }
  });

  serverProcess.on('close', (code) => {
    console.log(`\n🔚 Servidor terminado con código: ${code}`.yellow);
    if (!testPassed) {
      process.exit(code);
    }
  });

  // Timeout de seguridad
  setTimeout(() => {
    if (!serverReady) {
      console.log('\n⏰ Timeout: El servidor no se inició en 30 segundos'.yellow);
      if (serverProcess) {
        serverProcess.kill();
      }
      // Intentar probar puertos comunes de todas formas
      testPorts([3000, 3001, 3002, 3003]);
    }
  }, 30000);
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Terminando prueba...'.yellow);
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminando prueba...'.yellow);
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});

// Primero probar si ya hay un servidor ejecutándose
console.log('🔍 Verificando si ya hay un servidor ejecutándose...'.cyan);
testPorts([3000, 3001, 3002, 3003]);

// Si no hay servidor, iniciar uno nuevo
setTimeout(() => {
  if (!testPassed) {
    startServer();
  }
}, 3000);
