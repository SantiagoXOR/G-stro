#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando configuración de Clerk...\n')

// Verificar variables de entorno
const envPath = path.join(__dirname, '../../.env')
let envContent = ''

try {
  envContent = fs.readFileSync(envPath, 'utf8')
  console.log('✅ Archivo .env encontrado')
} catch (error) {
  console.log('❌ Archivo .env no encontrado')
  process.exit(1)
}

// Verificar variables específicas de Clerk
const requiredVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL'
]

const missingVars = []
const configuredVars = []

requiredVars.forEach(varName => {
  if (envContent.includes(varName)) {
    const line = envContent.split('\n').find(line => line.startsWith(varName))
    if (line && line.includes('=') && line.split('=')[1].trim()) {
      configuredVars.push(varName)
      console.log(`✅ ${varName}: Configurada`)
    } else {
      missingVars.push(varName)
      console.log(`❌ ${varName}: Vacía o mal configurada`)
    }
  } else {
    missingVars.push(varName)
    console.log(`❌ ${varName}: No encontrada`)
  }
})

// Verificar ClerkProvider
const clerkProviderPath = path.join(__dirname, '../components/clerk-provider.tsx')
try {
  const clerkProviderContent = fs.readFileSync(clerkProviderPath, 'utf8')
  console.log('\n✅ ClerkProvider encontrado')
  
  // Verificar configuración de localización
  if (clerkProviderContent.includes('customLocalization')) {
    console.log('✅ Configuración de localización personalizada encontrada')
  } else {
    console.log('⚠️  Configuración de localización personalizada no encontrada')
  }
  
  // Verificar configuración de tema
  if (clerkProviderContent.includes('colorPrimary')) {
    console.log('✅ Configuración de tema personalizado encontrada')
  } else {
    console.log('⚠️  Configuración de tema personalizado no encontrada')
  }
  
} catch (error) {
  console.log('❌ ClerkProvider no encontrado')
}

// Verificar package.json
const packageJsonPath = path.join(__dirname, '../package.json')
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  console.log('\n📦 Dependencias de Clerk:')
  
  const clerkDeps = Object.keys(packageJson.dependencies || {})
    .filter(dep => dep.startsWith('@clerk/'))
  
  clerkDeps.forEach(dep => {
    console.log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`)
  })
  
} catch (error) {
  console.log('❌ package.json no encontrado')
}

// Resumen
console.log('\n📋 Resumen de Configuración:')
console.log(`Variables configuradas: ${configuredVars.length}/${requiredVars.length}`)

if (missingVars.length > 0) {
  console.log('\n❌ Variables faltantes o mal configuradas:')
  missingVars.forEach(varName => {
    console.log(`  - ${varName}`)
  })
  console.log('\n💡 Asegúrate de configurar todas las variables de entorno necesarias.')
} else {
  console.log('\n✅ Todas las variables de entorno están configuradas correctamente.')
}

// Verificar si el servidor está corriendo
console.log('\n🚀 Para probar la configuración:')
console.log('1. Ejecuta: npm run dev')
console.log('2. Visita: http://localhost:3000/test-auth')
console.log('3. Prueba la autenticación con Google')

console.log('\n🔧 Si encuentras el error "Cannot create property \'google\' on string":')
console.log('1. Verifica que las dependencias de Clerk estén actualizadas')
console.log('2. Revisa la configuración de localización en ClerkProvider')
console.log('3. Asegúrate de que las credenciales de Clerk sean válidas')
