#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🖼️  Verificando configuración de imágenes de Next.js...\n')

// Verificar que next.config.mjs existe
const configPath = path.join(__dirname, '../next.config.mjs')
if (!fs.existsSync(configPath)) {
  console.log('❌ next.config.mjs no encontrado')
  process.exit(1)
}

console.log('✅ next.config.mjs encontrado')

// Leer y verificar configuración
try {
  const configContent = fs.readFileSync(configPath, 'utf8')
  
  // Dominios que deben estar configurados
  const requiredDomains = [
    'img.clerk.com',
    'images.clerk.dev',
    'clerk.com',
    'lh3.googleusercontent.com',
    'googleusercontent.com',
    'avatars.githubusercontent.com',
    'www.gravatar.com',
    'gravatar.com'
  ]
  
  console.log('\n🔍 Verificando dominios de imágenes configurados:')
  
  const configuredDomains = []
  const missingDomains = []
  
  requiredDomains.forEach(domain => {
    if (configContent.includes(`hostname: '${domain}'`)) {
      configuredDomains.push(domain)
      console.log(`✅ ${domain}`)
    } else {
      missingDomains.push(domain)
      console.log(`❌ ${domain}`)
    }
  })
  
  // Verificar configuración de remotePatterns
  if (configContent.includes('remotePatterns:')) {
    console.log('\n✅ Configuración remotePatterns encontrada')
  } else {
    console.log('\n❌ Configuración remotePatterns no encontrada')
  }
  
  // Verificar configuración de optimización
  const optimizationFeatures = [
    'formats:',
    'deviceSizes:',
    'imageSizes:',
    'minimumCacheTTL:'
  ]
  
  console.log('\n🚀 Verificando configuración de optimización:')
  optimizationFeatures.forEach(feature => {
    if (configContent.includes(feature)) {
      console.log(`✅ ${feature.replace(':', '')}`)
    } else {
      console.log(`⚠️  ${feature.replace(':', '')} - No configurado`)
    }
  })
  
  // Resumen
  console.log('\n📋 Resumen:')
  console.log(`Dominios configurados: ${configuredDomains.length}/${requiredDomains.length}`)
  
  if (missingDomains.length > 0) {
    console.log('\n❌ Dominios faltantes:')
    missingDomains.forEach(domain => {
      console.log(`  - ${domain}`)
    })
  } else {
    console.log('\n✅ Todos los dominios necesarios están configurados')
  }
  
  // Verificar estructura del archivo
  console.log('\n🔧 Verificando estructura del archivo:')
  
  if (configContent.includes('/** @type {import(\'next\').NextConfig} */')) {
    console.log('✅ Tipo TypeScript configurado')
  } else {
    console.log('⚠️  Tipo TypeScript no configurado')
  }
  
  if (configContent.includes('export default nextConfig')) {
    console.log('✅ Exportación ES6 configurada')
  } else {
    console.log('❌ Exportación ES6 no configurada')
  }
  
  // Instrucciones para probar
  console.log('\n🧪 Para probar la configuración:')
  console.log('1. Reinicia el servidor de desarrollo: npm run dev')
  console.log('2. Navega a: http://localhost:3000/profile')
  console.log('3. Inicia sesión con Google')
  console.log('4. Verifica que la imagen de perfil se carga sin errores')
  console.log('5. Revisa la consola del navegador para confirmar que no hay errores de imágenes')
  
  console.log('\n💡 Dominios configurados para imágenes:')
  console.log('- Clerk: img.clerk.com, images.clerk.dev, clerk.com')
  console.log('- Google: lh3.googleusercontent.com, googleusercontent.com')
  console.log('- GitHub: avatars.githubusercontent.com')
  console.log('- Gravatar: www.gravatar.com, gravatar.com')
  console.log('- Unsplash: images.unsplash.com, source.unsplash.com')
  console.log('- Otros: via.placeholder.com, picsum.photos')
  
} catch (error) {
  console.log('❌ Error al leer next.config.mjs:', error.message)
  process.exit(1)
}

console.log('\n✅ Verificación completada')
