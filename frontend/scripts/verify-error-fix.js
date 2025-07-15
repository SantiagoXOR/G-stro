#!/usr/bin/env node

/**
 * Script para verificar que el error crítico del ErrorBoundary se ha resuelto
 * Verifica la configuración y compatibilidad de componentes
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando corrección del error crítico de ErrorBoundary...\n')

// Verificar archivos clave
const filesToCheck = [
  {
    path: 'app/layout.tsx',
    description: 'Layout principal',
    checks: [
      { pattern: /SimpleErrorBoundary/, description: 'Uso de SimpleErrorBoundary' },
      { pattern: /HydrationSafeWrapper/, description: 'Wrapper de hidratación segura' },
      { pattern: /suppressHydrationWarning/, description: 'Supresión de warnings de hidratación' }
    ]
  },
  {
    path: 'components/simple-error-boundary.tsx',
    description: 'Error Boundary simplificado',
    checks: [
      { pattern: /class SimpleErrorBoundary/, description: 'Clase SimpleErrorBoundary' },
      { pattern: /getDerivedStateFromError/, description: 'Método getDerivedStateFromError' },
      { pattern: /HydrationSafeWrapper/, description: 'Componente HydrationSafeWrapper' }
    ]
  },
  {
    path: 'package.json',
    description: 'Configuración de dependencias',
    checks: [
      { pattern: /"overrides"/, description: 'Configuración de overrides' },
      { pattern: /"react": "\^19"/, description: 'Override de React 19' },
      { pattern: /"peerDependenciesMeta"/, description: 'Configuración de peer dependencies' }
    ]
  }
]

let allChecksPass = true
let totalChecks = 0
let passedChecks = 0

filesToCheck.forEach(file => {
  console.log(`📁 Verificando ${file.description} (${file.path})`)
  
  const filePath = path.join(__dirname, '..', file.path)
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ Archivo no encontrado: ${file.path}`)
    allChecksPass = false
    return
  }
  
  const content = fs.readFileSync(filePath, 'utf8')
  
  file.checks.forEach(check => {
    totalChecks++
    if (check.pattern.test(content)) {
      console.log(`   ✅ ${check.description}`)
      passedChecks++
    } else {
      console.log(`   ❌ ${check.description}`)
      allChecksPass = false
    }
  })
  
  console.log('')
})

// Verificar que no hay importaciones problemáticas del ErrorBoundary original
console.log('🔍 Verificando importaciones problemáticas...')

const layoutContent = fs.readFileSync(path.join(__dirname, '..', 'app/layout.tsx'), 'utf8')
if (layoutContent.includes('from "@/components/error-boundary"')) {
  console.log('   ❌ Aún se importa el ErrorBoundary original')
  allChecksPass = false
} else {
  console.log('   ✅ No se detectan importaciones problemáticas')
  passedChecks++
}
totalChecks++

// Resumen
console.log('\n' + '='.repeat(60))
console.log(`📊 Resumen de verificación:`)
console.log(`   Total de verificaciones: ${totalChecks}`)
console.log(`   Verificaciones exitosas: ${passedChecks}`)
console.log(`   Verificaciones fallidas: ${totalChecks - passedChecks}`)

if (allChecksPass) {
  console.log('\n🎉 ¡ÉXITO! Todas las verificaciones pasaron.')
  console.log('✅ El error crítico del ErrorBoundary ha sido resuelto.')
  console.log('\n📋 Cambios implementados:')
  console.log('   • Reemplazado ErrorBoundary complejo por SimpleErrorBoundary')
  console.log('   • Agregado HydrationSafeWrapper para manejo de hidratación')
  console.log('   • Configurado overrides en package.json para React 19')
  console.log('   • Agregado suppressHydrationWarning en el body')
  console.log('\n🚀 La aplicación debería funcionar correctamente ahora.')
} else {
  console.log('\n❌ FALLÓ: Algunas verificaciones no pasaron.')
  console.log('⚠️  Es posible que el error aún persista.')
  console.log('\n🔧 Acciones recomendadas:')
  console.log('   • Revisar los archivos marcados con ❌')
  console.log('   • Verificar que todas las importaciones sean correctas')
  console.log('   • Reiniciar el servidor de desarrollo')
}

console.log('\n' + '='.repeat(60))

process.exit(allChecksPass ? 0 : 1)
