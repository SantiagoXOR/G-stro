#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('colors');

console.log('🔧 Verificando la corrección del error de vaul...'.cyan);
console.log('=' .repeat(60));

let allChecksPass = true;
let passedChecks = 0;
let totalChecks = 0;

// Verificar que vaul fue removido del package.json
console.log('\n📦 Verificando package.json...'.cyan);
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

totalChecks++;
if (packageJson.dependencies.vaul) {
  console.log('   ❌ vaul aún está en dependencies'.red);
  allChecksPass = false;
} else {
  console.log('   ✅ vaul removido de dependencies'.green);
  passedChecks++;
}

totalChecks++;
if (packageJson.overrides && packageJson.overrides.vaul) {
  console.log('   ❌ vaul aún está en overrides'.red);
  allChecksPass = false;
} else {
  console.log('   ✅ vaul removido de overrides'.green);
  passedChecks++;
}

// Verificar que el drawer.tsx usa Radix en lugar de vaul
console.log('\n🎨 Verificando drawer.tsx...'.cyan);
const drawerPath = path.join(__dirname, '..', 'components/ui/drawer.tsx');
const drawerContent = fs.readFileSync(drawerPath, 'utf8');

totalChecks++;
if (drawerContent.includes('from "vaul"')) {
  console.log('   ❌ Aún importa desde vaul'.red);
  allChecksPass = false;
} else {
  console.log('   ✅ No importa desde vaul'.green);
  passedChecks++;
}

totalChecks++;
if (drawerContent.includes('@radix-ui/react-dialog')) {
  console.log('   ✅ Usa Radix Dialog como alternativa'.green);
  passedChecks++;
} else {
  console.log('   ❌ No usa Radix Dialog'.red);
  allChecksPass = false;
}

// Verificar que no hay node_modules de vaul
console.log('\n📁 Verificando node_modules...'.cyan);
const vaulModulePath = path.join(__dirname, '..', 'node_modules', 'vaul');

totalChecks++;
if (fs.existsSync(vaulModulePath)) {
  console.log('   ❌ vaul aún está en node_modules'.red);
  allChecksPass = false;
} else {
  console.log('   ✅ vaul removido de node_modules'.green);
  passedChecks++;
}

// Verificar que no hay importaciones de vaul en otros archivos
console.log('\n🔍 Buscando importaciones de vaul...'.cyan);
const sourceFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'components/client-layout.tsx',
  'components/ai-assistant.tsx'
];

let foundVaulImports = false;
sourceFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('vaul') || content.includes('from "vaul"')) {
      console.log(`   ❌ ${filePath} - Importa vaul`.red);
      foundVaulImports = true;
    }
  }
});

totalChecks++;
if (foundVaulImports) {
  allChecksPass = false;
} else {
  console.log('   ✅ No se encontraron importaciones de vaul'.green);
  passedChecks++;
}

// Verificar que el error específico no está presente
console.log('\n🚨 Verificando errores específicos...'.cyan);
const problematicPatterns = [
  'Cannot read properties of undefined (reading \'call\')',
  'vaul',
  'DrawerPrimitive'
];

let foundProblematicCode = false;
sourceFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    problematicPatterns.forEach(pattern => {
      if (content.includes(pattern) && filePath !== 'components/ui/drawer.tsx') {
        console.log(`   ⚠️ ${filePath} - Contiene: ${pattern}`.yellow);
        foundProblematicCode = true;
      }
    });
  }
});

totalChecks++;
if (foundProblematicCode) {
  console.log('   ⚠️ Se encontraron patrones potencialmente problemáticos'.yellow);
} else {
  console.log('   ✅ No se encontraron patrones problemáticos'.green);
  passedChecks++;
}

// Resumen
console.log('\n' + '='.repeat(60));
console.log(`📊 Resumen de verificación:`.cyan);
console.log(`   Total de verificaciones: ${totalChecks}`);
console.log(`   Verificaciones exitosas: ${passedChecks}`.green);
console.log(`   Verificaciones fallidas: ${totalChecks - passedChecks}`.red);

if (allChecksPass) {
  console.log('\n🎉 ¡CORRECCIÓN EXITOSA!'.green.bold);
  console.log('✅ El error de vaul ha sido resuelto correctamente'.green);
  console.log('✅ La aplicación debería funcionar sin errores de runtime'.green);
} else {
  console.log('\n⚠️ CORRECCIÓN PARCIAL'.yellow.bold);
  console.log('🔧 Algunas verificaciones fallaron, revisa los detalles arriba'.yellow);
}

console.log('\n📋 Próximos pasos:'.cyan);
console.log('1. Verificar que la aplicación carga sin errores en el navegador');
console.log('2. Probar funcionalidades que usen drawers/modales');
console.log('3. Verificar que no hay errores en la consola del navegador');
console.log('4. Ejecutar tests para asegurar que todo funciona correctamente');

process.exit(allChecksPass ? 0 : 1);
