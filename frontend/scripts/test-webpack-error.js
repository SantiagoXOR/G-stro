#!/usr/bin/env node

const puppeteer = require('puppeteer')
const colors = require('colors')

async function testWebpackError() {
  console.log('🔍 Probando si el error de webpack ha sido resuelto...'.yellow.bold)
  console.log('=' * 60)

  let browser
  let success = false
  let errorDetails = null

  try {
    // Lanzar navegador
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    // Capturar errores de consola
    const consoleErrors = []
    const jsErrors = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        consoleErrors.push(text)
        
        // Detectar el error específico de webpack
        if (text.includes('Cannot read properties of undefined (reading \'call\')')) {
          jsErrors.push({
            type: 'webpack_call_error',
            message: text,
            timestamp: new Date().toISOString()
          })
        }
      }
    })

    page.on('pageerror', error => {
      jsErrors.push({
        type: 'page_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    })

    console.log('🌐 Navegando a http://localhost:3001...'.cyan)

    // Navegar a la aplicación
    const response = await page.goto('http://localhost:3001', {
      waitUntil: 'networkidle0',
      timeout: 30000
    })

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`)
    }

    console.log('✅ Página cargada exitosamente'.green)

    // Esperar un poco para que se ejecuten todos los scripts
    await page.waitForTimeout(3000)

    // Verificar si hay errores específicos de webpack
    const webpackErrors = jsErrors.filter(error => 
      error.message.includes('Cannot read properties of undefined (reading \'call\')') ||
      error.message.includes('webpack') ||
      error.message.includes('react-server-dom-webpack')
    )

    if (webpackErrors.length === 0) {
      console.log('🎉 ¡ÉXITO! No se detectaron errores de webpack.'.green.bold)
      success = true
    } else {
      console.log('❌ Se detectaron errores de webpack:'.red.bold)
      webpackErrors.forEach((error, index) => {
        console.log(`\n   Error ${index + 1}:`.red)
        console.log(`   Tipo: ${error.type}`.yellow)
        console.log(`   Mensaje: ${error.message}`.white)
        if (error.stack) {
          console.log(`   Stack: ${error.stack.substring(0, 200)}...`.gray)
        }
      })
      errorDetails = webpackErrors
    }

    // Verificar si la aplicación es funcional
    console.log('\n🔍 Verificando funcionalidad básica...'.cyan)
    
    try {
      // Verificar que el DOM se haya renderizado correctamente
      const bodyContent = await page.evaluate(() => document.body.innerHTML)
      
      if (bodyContent && bodyContent.length > 100) {
        console.log('✅ DOM renderizado correctamente'.green)
      } else {
        console.log('⚠️  DOM parece estar vacío o incompleto'.yellow)
      }

      // Verificar que no hay errores críticos en la consola
      const criticalErrors = consoleErrors.filter(error => 
        error.includes('TypeError') || 
        error.includes('ReferenceError') ||
        error.includes('Cannot read properties')
      )

      if (criticalErrors.length === 0) {
        console.log('✅ No hay errores críticos en la consola'.green)
      } else {
        console.log('⚠️  Se encontraron errores críticos:'.yellow)
        criticalErrors.forEach(error => {
          console.log(`   - ${error}`.white)
        })
      }

    } catch (funcError) {
      console.log('❌ Error al verificar funcionalidad:'.red, funcError.message)
    }

  } catch (error) {
    console.log('❌ Error durante la prueba:'.red.bold)
    console.log(`   ${error.message}`.white)
    errorDetails = { testError: error.message }
  } finally {
    if (browser) {
      await browser.close()
    }
  }

  // Resumen final
  console.log('\n' + '='.repeat(60))
  
  if (success) {
    console.log('🎉 RESULTADO: ERROR DE WEBPACK RESUELTO'.green.bold)
    console.log('✅ La aplicación se ejecuta sin errores "Cannot read properties of undefined (reading \'call\')"'.green)
    console.log('✅ El sistema de módulos de webpack funciona correctamente'.green)
    console.log('✅ React Server Components se cargan sin problemas'.green)
  } else {
    console.log('❌ RESULTADO: ERROR DE WEBPACK AÚN PERSISTE'.red.bold)
    console.log('⚠️  Se requieren ajustes adicionales en la configuración'.yellow)
    
    if (errorDetails) {
      console.log('\n📋 Detalles para debugging:'.cyan)
      console.log(JSON.stringify(errorDetails, null, 2).gray)
    }
  }

  console.log('\n🔗 URL de prueba: http://localhost:3001'.cyan)
  console.log('=' * 60)

  return success
}

// Ejecutar la prueba
if (require.main === module) {
  testWebpackError()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('Error fatal en la prueba:', error)
      process.exit(1)
    })
}

module.exports = testWebpackError
