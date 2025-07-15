#!/usr/bin/env node

/**
 * Script para diagnosticar errores de runtime en Gëstro
 */

const fs = require('fs');
const path = require('path');
const colors = require('colors');

console.log('🔍 Diagnosticando errores de runtime...\n'.cyan.bold);

// Verificar archivos críticos
const criticalFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css',
  'next.config.js',
  'package.json',
  'tsconfig.json'
];

console.log('📁 Verificando archivos críticos...'.cyan);
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`.green);
  } else {
    console.log(`   ❌ ${file} - NO ENCONTRADO`.red);
  }
});

// Verificar configuración de Next.js
console.log('\n⚙️ Verificando configuración de Next.js...'.cyan);
const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  console.log('   ✅ next.config.js encontrado'.green);
  
  // Verificar configuraciones problemáticas
  if (nextConfig.includes('experimental')) {
    console.log('   ⚠️ Configuraciones experimentales detectadas'.yellow);
  }
  if (nextConfig.includes('swcMinify')) {
    console.log('   ⚠️ swcMinify configurado'.yellow);
  }
} else {
  console.log('   ❌ next.config.js no encontrado'.red);
}

// Verificar package.json
console.log('\n📦 Verificando dependencias...'.cyan);
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Verificar versiones críticas
  const criticalDeps = {
    'next': packageJson.dependencies?.next || packageJson.devDependencies?.next,
    'react': packageJson.dependencies?.react || packageJson.devDependencies?.react,
    'react-dom': packageJson.dependencies?.['react-dom'] || packageJson.devDependencies?.['react-dom']
  };
  
  Object.entries(criticalDeps).forEach(([dep, version]) => {
    if (version) {
      console.log(`   ✅ ${dep}: ${version}`.green);
    } else {
      console.log(`   ❌ ${dep}: NO ENCONTRADO`.red);
    }
  });
  
  // Verificar overrides
  if (packageJson.overrides) {
    console.log('   ✅ Overrides configurados'.green);
  } else {
    console.log('   ⚠️ No hay overrides configurados'.yellow);
  }
}

// Verificar archivos de configuración TypeScript
console.log('\n🔧 Verificando configuración TypeScript...'.cyan);
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  console.log('   ✅ tsconfig.json encontrado'.green);
  
  if (tsconfig.compilerOptions?.strict) {
    console.log('   ✅ Modo strict habilitado'.green);
  }
  
  if (tsconfig.compilerOptions?.skipLibCheck) {
    console.log('   ✅ skipLibCheck habilitado'.green);
  }
}

// Verificar archivos de estilo
console.log('\n🎨 Verificando archivos de estilo...'.cyan);
const globalsCssPath = path.join(__dirname, '..', 'app/globals.css');
if (fs.existsSync(globalsCssPath)) {
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');
  console.log('   ✅ globals.css encontrado'.green);
  
  if (globalsCss.includes('@tailwind')) {
    console.log('   ✅ Tailwind CSS configurado'.green);
  }
}

// Verificar directorio .next
console.log('\n🏗️ Verificando build...'.cyan);
const nextDirPath = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextDirPath)) {
  console.log('   ✅ Directorio .next existe'.green);
  
  // Verificar si hay archivos de build
  const buildFiles = fs.readdirSync(nextDirPath);
  if (buildFiles.length > 0) {
    console.log(`   ✅ ${buildFiles.length} archivos de build encontrados`.green);
  }
} else {
  console.log('   ⚠️ Directorio .next no existe (primera compilación)'.yellow);
}

// Buscar patrones problemáticos en archivos
console.log('\n🔍 Buscando patrones problemáticos...'.cyan);
const sourceFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'components/client-layout-wrapper.tsx'
];

const problematicPatterns = [
  {
    pattern: /document\./,
    description: 'Uso directo de document (puede causar SSR issues)',
    severity: 'warning'
  },
  {
    pattern: /window\./,
    description: 'Uso directo de window (puede causar SSR issues)',
    severity: 'warning'
  },
  {
    pattern: /\.call\(/,
    description: 'Uso de .call() que puede estar relacionado con el error',
    severity: 'error'
  },
  {
    pattern: /dangerouslySetInnerHTML/,
    description: 'Uso de dangerouslySetInnerHTML',
    severity: 'info'
  }
];

sourceFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    problematicPatterns.forEach(pattern => {
      const matches = content.match(new RegExp(pattern.pattern, 'g'));
      if (matches) {
        const color = pattern.severity === 'error' ? 'red' : 
                     pattern.severity === 'warning' ? 'yellow' : 'blue';
        console.log(`   ${pattern.severity === 'error' ? '❌' : pattern.severity === 'warning' ? '⚠️' : 'ℹ️'} ${filePath}: ${pattern.description} (${matches.length} ocurrencias)`[color]);
      }
    });
  }
});

console.log('\n' + '='.repeat(60));
console.log('📋 Recomendaciones:'.cyan.bold);
console.log('1. Verificar la consola del navegador para errores específicos'.yellow);
console.log('2. Revisar el Network tab para requests fallidos'.yellow);
console.log('3. Verificar que no hay conflictos de dependencias'.yellow);
console.log('4. Considerar limpiar node_modules y reinstalar'.yellow);
console.log('5. Verificar variables de entorno'.yellow);
console.log('\n' + '='.repeat(60));
