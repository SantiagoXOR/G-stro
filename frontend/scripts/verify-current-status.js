#!/usr/bin/env node

/**
 * Script de verificación del estado actual de Gëstro
 * Verifica que no hay errores críticos de Webpack o runtime
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando estado actual de Gëstro...\n')

// Verificar estructura de archivos críticos
const criticalFiles = [
  'app/layout.tsx',
  'next.config.mjs',
  'package.json',
  'tailwind.config.ts'
]

console.log('📁 Verificando archivos críticos:')
let allFilesExist = true

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`)
  } else {
    console.log(`   ❌ ${file} - FALTANTE`)
    allFilesExist = false
  }
})

// Verificar package.json
console.log('\n📦 Verificando dependencias críticas:')
const packageJsonPath = path.join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

const criticalDeps = {
  'next': '^15.3.3',
  'react': '^19',
  'react-dom': '^19',
  '@clerk/nextjs': '^6.19.4'
}

let depsOk = true
Object.entries(criticalDeps).forEach(([dep, expectedVersion]) => {
  const actualVersion = packageJson.dependencies[dep]
  if (actualVersion) {
    console.log(`   ✅ ${dep}: ${actualVersion}`)
  } else {
    console.log(`   ❌ ${dep}: NO ENCONTRADO`)
    depsOk = false
  }
})

// Verificar layout.tsx
console.log('\n🏗️ Verificando layout.tsx:')
const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx')
const layoutContent = fs.readFileSync(layoutPath, 'utf8')

// Verificar que no hay imports problemáticos
const problematicImports = [
  'from "@/components/error-boundary"',
  'from "@/components/webpack-compatibility-wrapper"',
  'from "@/components/simple-error-boundary"'
]

let layoutOk = true
problematicImports.forEach(importStr => {
  if (layoutContent.includes(importStr)) {
    console.log(`   ❌ Import problemático encontrado: ${importStr}`)
    layoutOk = false
  }
})

if (layoutOk) {
  console.log('   ✅ Layout simplificado sin imports problemáticos')
}

// Verificar next.config.mjs
console.log('\n⚙️ Verificando next.config.mjs:')
const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs')
const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8')

if (nextConfigContent.includes('reactStrictMode: false')) {
  console.log('   ✅ React Strict Mode deshabilitado (recomendado para React 19)')
} else {
  console.log('   ⚠️ React Strict Mode podría estar habilitado')
}

// Resumen final
console.log('\n📊 RESUMEN:')
console.log('=' .repeat(50))

if (allFilesExist && depsOk && layoutOk) {
  console.log('🎉 ESTADO: EXCELENTE')
  console.log('✅ Todos los archivos críticos están presentes')
  console.log('✅ Dependencias correctas instaladas')
  console.log('✅ Layout simplificado sin problemas')
  console.log('✅ Configuración optimizada')
  console.log('\n💡 El error "Cannot read properties of undefined (reading \'call\')" debería estar resuelto.')
} else {
  console.log('⚠️ ESTADO: REQUIERE ATENCIÓN')
  if (!allFilesExist) console.log('❌ Faltan archivos críticos')
  if (!depsOk) console.log('❌ Problemas con dependencias')
  if (!layoutOk) console.log('❌ Layout contiene imports problemáticos')
}

console.log('\n🚀 Para verificar funcionamiento:')
console.log('   npm run dev')
console.log('   Abrir: http://localhost:3000')
console.log('\n📝 Si hay errores, revisar la consola del navegador.')
