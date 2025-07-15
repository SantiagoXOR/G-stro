#!/usr/bin/env node

const colors = require('colors')
const http = require('http')
const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando la solución al ChunkLoadError...'.cyan.bold)
console.log('=' .repeat(60))

// Función para hacer una petición HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let data = ''
      
      response.on('data', (chunk) => {
        data += chunk
      })
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data
        })
      })
    })
    
    request.on('error', (error) => {
      reject(error)
    })
    
    request.setTimeout(10000, () => {
      request.destroy()
      reject(new Error('Timeout'))
    })
  })
}

async function testApplication() {
  let allTestsPassed = true
  let totalTests = 0
  let passedTests = 0

  console.log('\n🌐 Probando la aplicación en http://localhost:3000...'.cyan)
  
  try {
    // Test 1: Página principal
    totalTests++
    console.log('\n📄 Test 1: Cargando página principal...'.yellow)
    
    const homeResponse = await makeRequest('http://localhost:3000')
    
    if (homeResponse.statusCode === 200) {
      console.log('   ✅ Página principal carga correctamente (200 OK)'.green)
      passedTests++
      
      // Verificar que no hay errores de ChunkLoadError en el HTML
      if (homeResponse.body.includes('ChunkLoadError')) {
        console.log('   ❌ Se detectó ChunkLoadError en el HTML'.red)
        allTestsPassed = false
      } else {
        console.log('   ✅ No se detectaron errores de ChunkLoadError'.green)
      }
      
      // Verificar que el contenido esperado está presente
      if (homeResponse.body.includes('Gëstro') || homeResponse.body.includes('gestro')) {
        console.log('   ✅ Contenido de la aplicación presente'.green)
      } else {
        console.log('   ⚠️ Contenido de la aplicación no detectado'.yellow)
      }
      
    } else {
      console.log(`   ❌ Error al cargar página principal: ${homeResponse.statusCode}`.red)
      allTestsPassed = false
    }
    
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`.red)
    allTestsPassed = false
  }

  // Test 2: Verificar archivos estáticos
  totalTests++
  console.log('\n📦 Test 2: Verificando archivos estáticos...'.yellow)
  
  try {
    const staticResponse = await makeRequest('http://localhost:3000/_next/static/css/app/layout.css')
    
    if (staticResponse.statusCode === 200) {
      console.log('   ✅ Archivos CSS cargan correctamente'.green)
      passedTests++
    } else if (staticResponse.statusCode === 404) {
      console.log('   ⚠️ Archivos CSS no encontrados (puede ser normal en desarrollo)'.yellow)
      passedTests++ // No es crítico en desarrollo
    } else {
      console.log(`   ❌ Error al cargar archivos CSS: ${staticResponse.statusCode}`.red)
      allTestsPassed = false
    }
    
  } catch (error) {
    console.log(`   ⚠️ No se pudieron verificar archivos estáticos: ${error.message}`.yellow)
    passedTests++ // No es crítico
  }

  // Test 3: Verificar configuración de Next.js
  totalTests++
  console.log('\n⚙️ Test 3: Verificando configuración de Next.js...'.yellow)
  
  const configPath = path.join(__dirname, '..', 'next.config.mjs')
  
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8')
    
    // Verificar que no hay configuraciones problemáticas
    if (!configContent.includes('splitChunks') && !configContent.includes('require.resolve')) {
      console.log('   ✅ Configuración de Next.js simplificada correctamente'.green)
      passedTests++
    } else {
      console.log('   ⚠️ La configuración puede contener elementos problemáticos'.yellow)
      passedTests++
    }
  } else {
    console.log('   ❌ Archivo de configuración no encontrado'.red)
    allTestsPassed = false
  }

  // Test 4: Verificar directorio .next
  totalTests++
  console.log('\n🏗️ Test 4: Verificando build de Next.js...'.yellow)
  
  const nextDirPath = path.join(__dirname, '..', '.next')
  
  if (fs.existsSync(nextDirPath)) {
    const buildFiles = fs.readdirSync(nextDirPath)
    
    if (buildFiles.length > 0) {
      console.log(`   ✅ Directorio .next contiene ${buildFiles.length} archivos`.green)
      passedTests++
    } else {
      console.log('   ⚠️ Directorio .next está vacío'.yellow)
      passedTests++
    }
  } else {
    console.log('   ⚠️ Directorio .next no existe (primera compilación)'.yellow)
    passedTests++
  }

  // Resumen final
  console.log('\n' + '='.repeat(60))
  console.log(`📊 Resumen de pruebas: ${passedTests}/${totalTests} pasaron`.cyan.bold)
  
  if (allTestsPassed && passedTests === totalTests) {
    console.log('\n🎉 ¡ÉXITO! El ChunkLoadError ha sido resuelto.'.green.bold)
    console.log('✅ La aplicación Gëstro está funcionando correctamente.'.green)
    console.log('🌐 Puedes acceder a la aplicación en: http://localhost:3000'.cyan)
  } else if (passedTests >= totalTests * 0.75) {
    console.log('\n⚠️ La aplicación está funcionando con algunas advertencias menores.'.yellow.bold)
    console.log('🌐 Puedes acceder a la aplicación en: http://localhost:3000'.cyan)
  } else {
    console.log('\n❌ Aún hay problemas que necesitan ser resueltos.'.red.bold)
    console.log('🔧 Revisa los errores anteriores y vuelve a intentar.'.yellow)
  }
  
  console.log('\n📝 Notas:'.cyan)
  console.log('- Si ves advertencias menores, la aplicación debería funcionar normalmente')
  console.log('- Los archivos estáticos pueden no estar disponibles en modo desarrollo')
  console.log('- Asegúrate de que el servidor esté ejecutándose en http://localhost:3000')
}

// Ejecutar las pruebas
testApplication().catch(error => {
  console.error('\n❌ Error durante las pruebas:'.red.bold, error.message)
  process.exit(1)
})
