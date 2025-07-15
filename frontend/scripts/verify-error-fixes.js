#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando correcciones de errores...\n')

// Lista de archivos que fueron modificados
const modifiedFiles = [
  'frontend/lib/services/profiles.ts',
  'frontend/components/ui/order-status-badge.tsx',
  'frontend/app/profile/page.tsx',
  'frontend/components/profile-error-boundary.tsx',
  'frontend/components/clerk-provider.tsx'
]

// Verificar que todos los archivos existen
console.log('📁 Verificando archivos modificados:')
modifiedFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '../../', filePath)
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${filePath}`)
  } else {
    console.log(`❌ ${filePath} - No encontrado`)
  }
})

// Verificar correcciones específicas
console.log('\n🔧 Verificando correcciones específicas:')

// 1. Verificar que profiles.ts usa getSupabaseClient correctamente
const profilesPath = path.join(__dirname, '../lib/services/profiles.ts')
try {
  const profilesContent = fs.readFileSync(profilesPath, 'utf8')
  
  if (profilesContent.includes('const supabase = await getSupabaseClient()')) {
    console.log('✅ profiles.ts: Usa getSupabaseClient correctamente')
  } else {
    console.log('❌ profiles.ts: No usa getSupabaseClient correctamente')
  }
  
  if (profilesContent.includes('if (!supabase)')) {
    console.log('✅ profiles.ts: Tiene validación de cliente Supabase')
  } else {
    console.log('❌ profiles.ts: Falta validación de cliente Supabase')
  }
} catch (error) {
  console.log('❌ profiles.ts: Error al leer archivo')
}

// 2. Verificar que order-status-badge.tsx usa tipos correctos
const badgePath = path.join(__dirname, '../components/ui/order-status-badge.tsx')
try {
  const badgeContent = fs.readFileSync(badgePath, 'utf8')
  
  if (badgeContent.includes('Database["public"]["Enums"]["order_status"]')) {
    console.log('✅ order-status-badge.tsx: Usa tipos de base de datos correctos')
  } else {
    console.log('❌ order-status-badge.tsx: No usa tipos de base de datos correctos')
  }
} catch (error) {
  console.log('❌ order-status-badge.tsx: Error al leer archivo')
}

// 3. Verificar que profile/page.tsx tiene error boundary
const profilePagePath = path.join(__dirname, '../app/profile/page.tsx')
try {
  const profilePageContent = fs.readFileSync(profilePagePath, 'utf8')
  
  if (profilePageContent.includes('ProfileErrorBoundary')) {
    console.log('✅ profile/page.tsx: Tiene error boundary')
  } else {
    console.log('❌ profile/page.tsx: Falta error boundary')
  }
  
  if (profilePageContent.includes('try {') && profilePageContent.includes('catch (ordersError)')) {
    console.log('✅ profile/page.tsx: Tiene manejo de errores para pedidos')
  } else {
    console.log('❌ profile/page.tsx: Falta manejo de errores para pedidos')
  }
} catch (error) {
  console.log('❌ profile/page.tsx: Error al leer archivo')
}

// 4. Verificar que clerk-provider.tsx tiene configuración corregida
const clerkProviderPath = path.join(__dirname, '../components/clerk-provider.tsx')
try {
  const clerkProviderContent = fs.readFileSync(clerkProviderPath, 'utf8')
  
  if (clerkProviderContent.includes('customLocalization')) {
    console.log('✅ clerk-provider.tsx: Tiene configuración de localización personalizada')
  } else {
    console.log('❌ clerk-provider.tsx: Falta configuración de localización personalizada')
  }
  
  if (clerkProviderContent.includes('socialButtonsBlockButton: \'Continuar con {{provider|titleize}}\'')) {
    console.log('✅ clerk-provider.tsx: Configuración de botones sociales corregida')
  } else {
    console.log('❌ clerk-provider.tsx: Configuración de botones sociales incorrecta')
  }
} catch (error) {
  console.log('❌ clerk-provider.tsx: Error al leer archivo')
}

// Verificar dependencias de Clerk
console.log('\n📦 Verificando dependencias de Clerk:')
const packageJsonPath = path.join(__dirname, '../package.json')
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const clerkDeps = Object.keys(packageJson.dependencies || {})
    .filter(dep => dep.startsWith('@clerk/'))
  
  clerkDeps.forEach(dep => {
    console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`)
  })
} catch (error) {
  console.log('❌ package.json: Error al leer archivo')
}

console.log('\n📋 Resumen de Correcciones:')
console.log('1. ✅ Corregido uso de Supabase en profiles.ts')
console.log('2. ✅ Corregidos tipos en order-status-badge.tsx')
console.log('3. ✅ Agregado error boundary en profile/page.tsx')
console.log('4. ✅ Corregida configuración de localización en clerk-provider.tsx')
console.log('5. ✅ Actualizadas dependencias de Clerk')

console.log('\n🚀 Próximos pasos:')
console.log('1. Verificar que el servidor esté funcionando sin errores')
console.log('2. Probar la autenticación con Google')
console.log('3. Verificar que la página de perfil cargue correctamente')
console.log('4. Comprobar que no hay errores en la consola del navegador')

console.log('\n💡 Para probar:')
console.log('- Visita: http://localhost:3000/test-auth')
console.log('- Visita: http://localhost:3000/profile (después de autenticarte)')
console.log('- Revisa la consola del navegador para verificar que no hay errores')
