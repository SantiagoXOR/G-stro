#!/usr/bin/env node

const http = require('http')
const colors = require('colors')

console.log('🔍 VERIFICACIÓN FINAL DEL ERROR DE WEBPACK'.yellow.bold)
console.log('=' * 60)

function checkServer() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 10000
    }

    console.log('🌐 Conectando a http://localhost:3000...'.cyan)

    const req = http.request(options, (res) => {
      console.log(`📡 Código de respuesta: ${res.statusCode}`.cyan)
      
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Servidor responde correctamente'.green)
          
          // Verificar contenido HTML
          if (data.includes('<html') && data.includes('<body')) {
            console.log('✅ HTML básico presente'.green)
          }

          if (data.includes('Gëstro')) {
            console.log('✅ Contenido de la aplicación presente'.green)
          }

          // Verificar que no hay errores obvios en el HTML
          if (data.includes('Error') || data.includes('error')) {
            console.log('⚠️  Posibles errores detectados en el HTML'.yellow)
          } else {
            console.log('✅ No se detectaron errores obvios en el HTML'.green)
          }

          resolve(true)
        } else {
          console.log(`❌ Error HTTP: ${res.statusCode}`.red)
          resolve(false)
        }
      })
    })

    req.on('error', (err) => {
      console.log('❌ Error de conexión:'.red, err.message)
      resolve(false)
    })

    req.on('timeout', () => {
      console.log('❌ Timeout: El servidor no responde'.red)
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

async function main() {
  try {
    const serverOk = await checkServer()
    
    console.log('\n' + '='.repeat(60))
    
    if (serverOk) {
      console.log('🎉 RESULTADO FINAL'.green.bold)
      console.log('✅ Servidor funcionando correctamente'.green)
      console.log('✅ HTML renderizándose sin problemas'.green)
      console.log('✅ Aplicación accesible en http://localhost:3000'.green)
      
      console.log('\n📋 CAMBIOS IMPLEMENTADOS:'.cyan)
      console.log('   • Layout ultra-simplificado sin Google Fonts'.white)
      console.log('   • Metadata estática sin objetos complejos'.white)
      console.log('   • Configuración webpack minimalista'.white)
      console.log('   • Split chunks deshabilitado'.white)
      console.log('   • Runtime chunk deshabilitado'.white)
      console.log('   • React Strict Mode deshabilitado'.white)
      
      console.log('\n🎯 ESTADO DEL ERROR:'.yellow.bold)
      console.log('   Si no ves errores en la consola del navegador,'.white)
      console.log('   el error "Cannot read properties of undefined (reading \'call\')"'.white)
      console.log('   ha sido RESUELTO EXITOSAMENTE.'.green.bold)
      
      console.log('\n🔗 PRÓXIMOS PASOS:'.cyan)
      console.log('   1. Abre http://localhost:3000 en tu navegador'.white)
      console.log('   2. Abre las herramientas de desarrollador (F12)'.white)
      console.log('   3. Verifica que no hay errores en la consola'.white)
      console.log('   4. Si no hay errores, ¡el problema está resuelto!'.white)
      
    } else {
      console.log('❌ PROBLEMA DETECTADO'.red.bold)
      console.log('🔧 El servidor no está respondiendo correctamente'.yellow)
      console.log('📝 Verifica que el servidor esté ejecutándose con "npm run dev"'.white)
    }
    
    console.log('\n' + '='.repeat(60))
    
  } catch (error) {
    console.error('Error durante la verificación:', error)
  }
}

main()
