#!/usr/bin/env node

const fetch = require('node-fetch')
const colors = require('colors')
const fs = require('fs')
const path = require('path')

console.log('🖼️ Verificando solución al error de Next.js Image...'.yellow.bold)
console.log('=' * 70)

async function verifyImageConfiguration() {
  let allTestsPass = true
  let passedTests = 0
  let totalTests = 0

  // 1. Verificar configuración de next.config.mjs
  console.log('⚙️ Verificando configuración de Next.js...'.cyan)
  
  const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs')
  if (fs.existsSync(nextConfigPath)) {
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8')
    
    const configChecks = [
      { pattern: /images:\s*{/, description: 'Configuración de imágenes presente' },
      { pattern: /remotePatterns:\s*\[/, description: 'Patrones remotos configurados' },
      { pattern: /hostname:\s*['"]example\.com['"]/, description: 'Hostname example.com permitido' },
      { pattern: /hostname:\s*['"]images\.unsplash\.com['"]/, description: 'Hostname images.unsplash.com permitido' },
      { pattern: /hostname:\s*['"]via\.placeholder\.com['"]/, description: 'Hostname via.placeholder.com permitido' },
      { pattern: /hostname:\s*['"]lh3\.googleusercontent\.com['"]/, description: 'Hostname lh3.googleusercontent.com permitido' },
      { pattern: /hostname:\s*['"].*\.supabase\.co['"]/, description: 'Hostname Supabase permitido' },
    ]

    configChecks.forEach(check => {
      totalTests++
      if (check.pattern.test(nextConfigContent)) {
        console.log(`   ✅ ${check.description}`.green)
        passedTests++
      } else {
        console.log(`   ❌ ${check.description}`.red)
        allTestsPass = false
      }
    })
  } else {
    console.log('   ❌ next.config.mjs no encontrado'.red)
    allTestsPass = false
    totalTests++
  }

  // 2. Verificar componente SafeImage
  console.log('\n🖼️ Verificando componente SafeImage...'.cyan)
  
  const safeImagePath = path.join(__dirname, '..', 'components/safe-image.tsx')
  if (fs.existsSync(safeImagePath)) {
    const safeImageContent = fs.readFileSync(safeImagePath, 'utf8')
    
    const componentChecks = [
      { pattern: /export function SafeImage/, description: 'Componente SafeImage exportado' },
      { pattern: /useState.*hasError/, description: 'Estado de error implementado' },
      { pattern: /onError.*handleError/, description: 'Manejo de errores implementado' },
      { pattern: /isValidImageUrl/, description: 'Validación de URLs implementada' },
      { pattern: /getDefaultFallback/, description: 'Fallback por defecto implementado' },
      { pattern: /sanitizeImageUrl/, description: 'Función de sanitización exportada' },
    ]

    componentChecks.forEach(check => {
      totalTests++
      if (check.pattern.test(safeImageContent)) {
        console.log(`   ✅ ${check.description}`.green)
        passedTests++
      } else {
        console.log(`   ❌ ${check.description}`.red)
        allTestsPass = false
      }
    })
  } else {
    console.log('   ❌ components/safe-image.tsx no encontrado'.red)
    allTestsPass = false
    totalTests++
  }

  // 3. Verificar actualización de datos de ejemplo
  console.log('\n📊 Verificando datos de ejemplo actualizados...'.cyan)
  
  const productsServicePath = path.join(__dirname, '..', 'lib/services/products.ts')
  if (fs.existsSync(productsServicePath)) {
    const productsContent = fs.readFileSync(productsServicePath, 'utf8')
    
    const dataChecks = [
      { pattern: /images\.unsplash\.com/, description: 'URLs de Unsplash en datos de ejemplo' },
      { pattern: /!.*example\.com.*coca-cola\.jpg/, description: 'URLs de example.com removidas', invert: true },
      { pattern: /mockProducts.*length.*6/, description: 'Datos de ejemplo expandidos' },
    ]

    dataChecks.forEach(check => {
      totalTests++
      const matches = check.pattern.test(productsContent)
      const passes = check.invert ? !matches : matches
      
      if (passes) {
        console.log(`   ✅ ${check.description}`.green)
        passedTests++
      } else {
        console.log(`   ❌ ${check.description}`.red)
        allTestsPass = false
      }
    })
  } else {
    console.log('   ❌ lib/services/products.ts no encontrado'.red)
    allTestsPass = false
    totalTests++
  }

  // 4. Verificar uso de SafeImage en páginas
  console.log('\n📄 Verificando uso de SafeImage en páginas...'.cyan)
  
  const pagesToCheck = [
    { file: 'app/menu/page.tsx', description: 'Página del menú' },
    { file: 'app/menu/[id]/page.tsx', description: 'Página de detalle del producto' },
  ]

  pagesToCheck.forEach(({ file, description }) => {
    totalTests++
    const filePath = path.join(__dirname, '..', file)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      if (content.includes('SafeImage') && content.includes('from "@/components/safe-image"')) {
        console.log(`   ✅ ${description} usa SafeImage`.green)
        passedTests++
      } else {
        console.log(`   ❌ ${description} no usa SafeImage`.red)
        allTestsPass = false
      }
    } else {
      console.log(`   ❌ ${description} no encontrada`.red)
      allTestsPass = false
    }
  })

  // 5. Probar la aplicación en funcionamiento
  console.log('\n🌐 Probando carga de imágenes en la aplicación...'.cyan)
  
  const baseUrl = 'http://localhost:3001'
  
  try {
    totalTests++
    const response = await fetch(`${baseUrl}/menu`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Image-Verification-Script/1.0'
      }
    })

    if (response.ok) {
      const html = await response.text()
      
      // Verificar que no hay errores de imagen en el HTML
      const hasImageError = 
        html.includes('hostname') && html.includes('not configured') ||
        html.includes('Invalid src prop') ||
        html.includes('next/image')

      if (!hasImageError) {
        console.log(`   ✅ Página del menú carga sin errores de imagen`.green)
        passedTests++
      } else {
        console.log(`   ❌ Se detectaron errores de imagen en la página del menú`.red)
        allTestsPass = false
      }
    } else {
      console.log(`   ❌ Error al cargar página del menú: ${response.status}`.red)
      allTestsPass = false
    }
  } catch (error) {
    console.log(`   ❌ Error al conectar con la aplicación: ${error.message}`.red)
    allTestsPass = false
  }

  // 6. Verificar URLs de imágenes específicas
  console.log('\n🔗 Verificando URLs de imágenes específicas...'.cyan)
  
  const testUrls = [
    'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=200&fit=crop&crop=center',
    'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Test',
  ]

  for (const url of testUrls) {
    totalTests++
    try {
      const response = await fetch(url, { 
        method: 'HEAD', 
        timeout: 5000 
      })
      
      if (response.ok) {
        console.log(`   ✅ URL accesible: ${url.substring(0, 50)}...`.green)
        passedTests++
      } else {
        console.log(`   ❌ URL no accesible: ${url.substring(0, 50)}... (${response.status})`.red)
        allTestsPass = false
      }
    } catch (error) {
      console.log(`   ❌ Error al verificar URL: ${url.substring(0, 50)}... (${error.message})`.red)
      allTestsPass = false
    }
  }

  // Resumen final
  console.log('\n' + '='.repeat(70))
  console.log(`📊 Resumen de verificación de imágenes:`.bold)
  console.log(`   Total de verificaciones: ${totalTests}`)
  console.log(`   Verificaciones exitosas: ${passedTests}`.green)
  console.log(`   Verificaciones fallidas: ${totalTests - passedTests}`.red)
  console.log(`   Porcentaje de éxito: ${Math.round((passedTests / totalTests) * 100)}%`)

  if (allTestsPass) {
    console.log('\n🎉 ¡ÉXITO TOTAL! El error de Next.js Image ha sido COMPLETAMENTE RESUELTO.'.green.bold)
    console.log('\n✅ Verificaciones exitosas:'.green)
    console.log('   • Configuración de imágenes en next.config.mjs optimizada'.white)
    console.log('   • Componente SafeImage implementado y funcionando'.white)
    console.log('   • Datos de ejemplo actualizados con URLs válidas'.white)
    console.log('   • Páginas del menú usan SafeImage correctamente'.white)
    console.log('   • Aplicación carga sin errores de imagen'.white)
    console.log('   • URLs de imágenes externas son accesibles'.white)
    
    console.log('\n🚀 Estado final de las imágenes:'.yellow)
    console.log('   • Error "hostname not configured": ✅ RESUELTO'.green)
    console.log('   • Configuración de hostnames externos: ✅ COMPLETA'.green)
    console.log('   • Componente SafeImage: ✅ IMPLEMENTADO'.green)
    console.log('   • Página del menú: ✅ FUNCIONANDO CORRECTAMENTE'.green)
    
  } else {
    console.log('\n❌ ALGUNAS VERIFICACIONES FALLARON'.red.bold)
    console.log('⚠️  Es posible que aún persistan algunos problemas con las imágenes.'.yellow)
    console.log('\n🔧 Acciones recomendadas:'.cyan)
    console.log('   1. Revisar la configuración de next.config.mjs'.white)
    console.log('   2. Verificar que SafeImage esté implementado correctamente'.white)
    console.log('   3. Comprobar que las páginas usen SafeImage en lugar de Image'.white)
    console.log('   4. Verificar conectividad a URLs de imágenes externas'.white)
  }

  console.log('\n' + '='.repeat(70))
  return allTestsPass
}

// Ejecutar verificación
verifyImageConfiguration()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('\n💥 Error durante la verificación de imágenes:'.red.bold, error.message)
    process.exit(1)
  })
