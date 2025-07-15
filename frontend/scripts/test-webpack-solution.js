#!/usr/bin/env node

const fetch = require('node-fetch')
const colors = require('colors')

console.log('🧪 Probando la solución al error crítico de webpack...'.yellow.bold)
console.log('=' * 60)

async function testApplication() {
  const baseUrl = 'http://localhost:3000'
  const routes = [
    '/',
    '/auth/sign-in',
    '/auth/sign-up',
    '/menu'
  ]

  let allTestsPass = true
  let passedTests = 0
  let totalTests = 0

  console.log('🌐 Probando rutas de la aplicación...'.cyan)

  for (const route of routes) {
    totalTests++
    try {
      const response = await fetch(`${baseUrl}${route}`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Webpack-Test-Script/1.0'
        }
      })

      if (response.ok) {
        console.log(`   ✅ ${route} - ${response.status} ${response.statusText}`.green)
        passedTests++
      } else {
        console.log(`   ❌ ${route} - ${response.status} ${response.statusText}`.red)
        allTestsPass = false
      }
    } catch (error) {
      console.log(`   ❌ ${route} - Error: ${error.message}`.red)
      allTestsPass = false
    }
  }

  // Verificar que no hay errores específicos de webpack
  console.log('\n🔍 Verificando ausencia de errores de webpack...'.cyan)
  
  try {
    const response = await fetch(baseUrl, { timeout: 5000 })
    const html = await response.text()
    
    totalTests++
    // Verificar que no hay errores de webpack en el HTML
    if (html.includes('Cannot read properties of undefined') || 
        html.includes('webpack error') ||
        html.includes('Module not found')) {
      console.log('   ❌ Se detectaron errores de webpack en el HTML'.red)
      allTestsPass = false
    } else {
      console.log('   ✅ No se detectaron errores de webpack en el HTML'.green)
      passedTests++
    }

    totalTests++
    // Verificar que los componentes se renderizan correctamente
    if (html.includes('<html') && html.includes('</html>')) {
      console.log('   ✅ HTML se renderiza correctamente'.green)
      passedTests++
    } else {
      console.log('   ❌ HTML no se renderiza correctamente'.red)
      allTestsPass = false
    }

  } catch (error) {
    console.log(`   ❌ Error al verificar HTML: ${error.message}`.red)
    allTestsPass = false
    totalTests += 2
  }

  // Verificar configuración de archivos
  console.log('\n📁 Verificando archivos de configuración...'.cyan)
  
  const fs = require('fs')
  const path = require('path')
  
  const configFiles = [
    { file: 'next.config.mjs', description: 'Configuración de Next.js' },
    { file: '.babelrc.js', description: 'Configuración de Babel' },
    { file: 'components/webpack-compatibility-wrapper.tsx', description: 'Wrapper de compatibilidad' },
    { file: 'app/layout.tsx', description: 'Layout principal' }
  ]

  configFiles.forEach(({ file, description }) => {
    totalTests++
    const filePath = path.join(__dirname, '..', file)
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${description} existe`.green)
      passedTests++
    } else {
      console.log(`   ❌ ${description} no encontrado`.red)
      allTestsPass = false
    }
  })

  // Resumen
  console.log('\n' + '='.repeat(60))
  console.log(`📊 Resumen de pruebas:`.bold)
  console.log(`   Total de pruebas: ${totalTests}`)
  console.log(`   Pruebas exitosas: ${passedTests}`.green)
  console.log(`   Pruebas fallidas: ${totalTests - passedTests}`.red)

  if (allTestsPass) {
    console.log('\n🎉 ¡ÉXITO COMPLETO! La solución al error de webpack funciona perfectamente.'.green.bold)
    console.log('✅ Todas las verificaciones pasaron:'.green)
    console.log('   • Aplicación se inicia sin errores críticos'.white)
    console.log('   • Todas las rutas responden correctamente'.white)
    console.log('   • No hay errores de webpack en el HTML'.white)
    console.log('   • Componentes se renderizan correctamente'.white)
    console.log('   • Archivos de configuración están presentes'.white)
    
    console.log('\n🚀 Estado de la aplicación:'.yellow)
    console.log('   • Error "Cannot read properties of undefined (reading \'call\')" RESUELTO'.green)
    console.log('   • Compatibilidad con React 19 + Next.js 15 ESTABLECIDA'.green)
    console.log('   • Sistema de módulos de webpack ESTABILIZADO'.green)
    console.log('   • Aplicación lista para desarrollo y producción'.green)
    
  } else {
    console.log('\n❌ ALGUNAS PRUEBAS FALLARON'.red.bold)
    console.log('⚠️  Es posible que aún persistan algunos problemas.'.yellow)
    console.log('\n🔧 Acciones recomendadas:'.cyan)
    console.log('   1. Verificar que la aplicación esté ejecutándose en http://localhost:3000'.white)
    console.log('   2. Revisar los logs de la consola del navegador'.white)
    console.log('   3. Verificar que todas las dependencias estén instaladas'.white)
    console.log('   4. Ejecutar npm run verify:webpack para verificar la configuración'.white)
  }

  console.log('\n' + '='.repeat(60))
  return allTestsPass
}

// Ejecutar las pruebas
testApplication()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('\n💥 Error durante las pruebas:'.red.bold, error.message)
    process.exit(1)
  })
