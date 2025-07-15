#!/usr/bin/env node

const http = require('http')
const colors = require('colors')

function testServer() {
  console.log('🔍 Verificando si el servidor responde correctamente...'.yellow.bold)
  console.log('=' * 60)

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 10000
    }

    const req = http.request(options, (res) => {
      console.log(`📡 Código de respuesta: ${res.statusCode}`.cyan)
      
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Servidor responde correctamente'.green)
          
          // Verificar que el HTML contiene elementos básicos
          if (data.includes('<html') && data.includes('<body')) {
            console.log('✅ HTML básico presente'.green)
          } else {
            console.log('⚠️  HTML parece incompleto'.yellow)
          }

          // Verificar que no hay errores obvios en el HTML
          if (data.includes('Error') || data.includes('error')) {
            console.log('⚠️  Posibles errores detectados en el HTML'.yellow)
          } else {
            console.log('✅ No se detectaron errores obvios en el HTML'.green)
          }

          console.log('\n🎉 RESULTADO: SERVIDOR FUNCIONANDO CORRECTAMENTE'.green.bold)
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
    const success = await testServer()
    
    console.log('\n' + '='.repeat(60))
    
    if (success) {
      console.log('✅ VERIFICACIÓN EXITOSA'.green.bold)
      console.log('🚀 La aplicación está ejecutándose en http://localhost:3000'.cyan)
      console.log('📝 Para verificar errores de webpack, abre la consola del navegador'.yellow)
    } else {
      console.log('❌ VERIFICACIÓN FALLIDA'.red.bold)
      console.log('🔧 El servidor no está respondiendo correctamente'.yellow)
    }
    
    process.exit(success ? 0 : 1)
  } catch (error) {
    console.error('Error fatal:', error)
    process.exit(1)
  }
}

main()
