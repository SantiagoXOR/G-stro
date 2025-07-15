#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const colors = require('colors')

console.log('🔧 Verificando solución al error crítico de webpack...'.yellow.bold)
console.log('=' * 60)

let allChecksPass = true
let passedChecks = 0
let totalChecks = 0

// Verificar archivos clave
const filesToCheck = [
  {
    path: 'next.config.mjs',
    description: 'Configuración de Next.js mejorada',
    checks: [
      { pattern: /webpack:.*config.*isServer.*dev/, description: 'Configuración de webpack robusta' },
      { pattern: /resolve\.fallback/, description: 'Fallbacks de módulos configurados' },
      { pattern: /resolve\.alias/, description: 'Alias de React configurados' },
      { pattern: /babel-loader/, description: 'Configuración de Babel loader' }
    ]
  },
  {
    path: 'components/webpack-compatibility-wrapper.tsx',
    description: 'Wrapper de compatibilidad de webpack',
    checks: [
      { pattern: /class WebpackCompatibilityWrapper/, description: 'Clase WebpackCompatibilityWrapper' },
      { pattern: /getDerivedStateFromError/, description: 'Método getDerivedStateFromError' },
      { pattern: /useWebpackErrorDetection/, description: 'Hook de detección de errores' },
      { pattern: /WebpackModuleWrapper/, description: 'Componente WebpackModuleWrapper' }
    ]
  },
  {
    path: 'app/layout.tsx',
    description: 'Layout principal actualizado',
    checks: [
      { pattern: /WebpackCompatibilityWrapper/, description: 'Uso de WebpackCompatibilityWrapper' },
      { pattern: /WebpackModuleWrapper/, description: 'Uso de WebpackModuleWrapper' },
      { pattern: /suppressHydrationWarning/, description: 'Supresión de warnings de hidratación' }
    ]
  },
  {
    path: '.babelrc.js',
    description: 'Configuración de Babel',
    checks: [
      { pattern: /@babel\/preset-env/, description: 'Preset de entorno configurado' },
      { pattern: /@babel\/preset-react/, description: 'Preset de React configurado' },
      { pattern: /plugin-transform-runtime/, description: 'Plugin de runtime configurado' }
    ]
  }
]

filesToCheck.forEach(file => {
  console.log(`\n📁 Verificando ${file.description}...`.cyan)
  
  const filePath = path.join(__dirname, '..', file.path)
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ Archivo no encontrado: ${file.path}`.red)
    allChecksPass = false
    totalChecks++
    return
  }
  
  const content = fs.readFileSync(filePath, 'utf8')
  
  file.checks.forEach(check => {
    totalChecks++
    if (check.pattern.test(content)) {
      console.log(`   ✅ ${check.description}`.green)
      passedChecks++
    } else {
      console.log(`   ❌ ${check.description}`.red)
      allChecksPass = false
    }
  })
})

// Verificar package.json para dependencias de Babel
console.log('\n📦 Verificando dependencias de Babel...'.cyan)

const packageJsonPath = path.join(__dirname, '..', 'package.json')
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const devDeps = packageJson.devDependencies || {}
  
  const requiredBabelDeps = [
    '@babel/core',
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
    'babel-loader'
  ]
  
  requiredBabelDeps.forEach(dep => {
    totalChecks++
    if (devDeps[dep]) {
      console.log(`   ✅ ${dep} instalado`.green)
      passedChecks++
    } else {
      console.log(`   ❌ ${dep} faltante`.red)
      allChecksPass = false
    }
  })
} else {
  console.log('   ❌ package.json no encontrado'.red)
  allChecksPass = false
  totalChecks++
}

// Verificar que no hay importaciones problemáticas
console.log('\n🔍 Verificando importaciones problemáticas...'.cyan)

const layoutContent = fs.readFileSync(path.join(__dirname, '..', 'app/layout.tsx'), 'utf8')
if (layoutContent.includes('from "@/components/error-boundary"') && 
    !layoutContent.includes('WebpackCompatibilityWrapper')) {
  console.log('   ❌ Aún se usa el ErrorBoundary original sin wrapper de webpack'.red)
  allChecksPass = false
} else {
  console.log('   ✅ Importaciones correctas detectadas'.green)
  passedChecks++
}
totalChecks++

// Verificar configuración de TypeScript
console.log('\n📝 Verificando configuración de TypeScript...'.cyan)

const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json')
if (fs.existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))
  
  totalChecks++
  if (tsconfig.compilerOptions && tsconfig.compilerOptions.target) {
    console.log(`   ✅ Target de TypeScript: ${tsconfig.compilerOptions.target}`.green)
    passedChecks++
  } else {
    console.log('   ❌ Target de TypeScript no configurado'.red)
    allChecksPass = false
  }
} else {
  console.log('   ❌ tsconfig.json no encontrado'.red)
  allChecksPass = false
  totalChecks++
}

// Resumen
console.log('\n' + '='.repeat(60))
console.log(`📊 Resumen de verificación:`.bold)
console.log(`   Total de verificaciones: ${totalChecks}`)
console.log(`   Verificaciones exitosas: ${passedChecks}`.green)
console.log(`   Verificaciones fallidas: ${totalChecks - passedChecks}`.red)

if (allChecksPass) {
  console.log('\n🎉 ¡ÉXITO! Todas las verificaciones pasaron.'.green.bold)
  console.log('✅ La solución al error crítico de webpack ha sido implementada.'.green)
  console.log('\n📋 Cambios implementados:'.cyan)
  console.log('   • Configuración robusta de webpack en next.config.mjs'.white)
  console.log('   • WebpackCompatibilityWrapper para manejo de errores específicos'.white)
  console.log('   • Configuración de Babel para mejor compatibilidad'.white)
  console.log('   • Fallbacks de módulos y alias de React configurados'.white)
  console.log('   • Detección automática de errores de webpack'.white)
  console.log('\n🚀 Próximos pasos:'.yellow)
  console.log('   1. Ejecutar: npm install (para instalar dependencias de Babel)'.white)
  console.log('   2. Ejecutar: npm run dev (para probar la aplicación)'.white)
  console.log('   3. Verificar que no aparezcan errores de webpack en la consola'.white)
} else {
  console.log('\n❌ FALLÓ: Algunas verificaciones no pasaron.'.red.bold)
  console.log('⚠️  Es posible que el error de webpack aún persista.'.yellow)
  console.log('\n🔧 Acciones recomendadas:'.cyan)
  console.log('   1. Revisar los archivos marcados como fallidos'.white)
  console.log('   2. Ejecutar: npm install (para instalar dependencias faltantes)'.white)
  console.log('   3. Verificar la configuración de webpack en next.config.mjs'.white)
  console.log('   4. Revisar los logs de la consola para errores específicos'.white)
}

console.log('\n' + '='.repeat(60))
process.exit(allChecksPass ? 0 : 1)
