#!/usr/bin/env node

/**
 * Script para verificar que el error de Supabase Realtime se ha resuelto
 * Este script verifica que no hay importaciones del cliente simulado
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando corrección del error de Supabase Realtime...\n');

// Función para buscar archivos recursivamente
function findFiles(dir, extension, exclude = []) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Excluir directorios específicos
      if (!exclude.includes(file)) {
        results = results.concat(findFiles(filePath, extension, exclude));
      }
    } else if (file.endsWith(extension)) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Buscar archivos TypeScript y JavaScript
const sourceFiles = [
  ...findFiles(path.join(__dirname, '..', 'app'), '.tsx', ['node_modules', '.next']),
  ...findFiles(path.join(__dirname, '..', 'app'), '.ts', ['node_modules', '.next']),
  ...findFiles(path.join(__dirname, '..', 'components'), '.tsx', ['node_modules', '.next']),
  ...findFiles(path.join(__dirname, '..', 'components'), '.ts', ['node_modules', '.next']),
  ...findFiles(path.join(__dirname, '..', 'lib'), '.tsx', ['node_modules', '.next']),
  ...findFiles(path.join(__dirname, '..', 'lib'), '.ts', ['node_modules', '.next']),
  ...findFiles(path.join(__dirname, '..', '__tests__'), '.tsx', ['node_modules', '.next']),
  ...findFiles(path.join(__dirname, '..', '__tests__'), '.ts', ['node_modules', '.next'])
];

console.log(`📁 Analizando ${sourceFiles.length} archivos...\n`);

let hasErrors = false;
let fixedFiles = 0;

// Verificar cada archivo
sourceFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  
  // Buscar importaciones problemáticas
  const problematicImports = [
    /import.*from.*['"]@\/lib\/supabase['"]/,
    /import.*supabase.*from.*['"]@\/lib\/supabase['"]/,
  ];
  
  const hasProblematicImport = problematicImports.some(pattern => pattern.test(content));
  
  if (hasProblematicImport) {
    console.log(`❌ ${relativePath} - Importación problemática encontrada`);
    hasErrors = true;
  } else if (content.includes('@/lib/supabase-client')) {
    console.log(`✅ ${relativePath} - Usando cliente real`);
    fixedFiles++;
  }
});

console.log('\n' + '='.repeat(60));

// Verificar archivos específicos críticos
const criticalFiles = [
  'lib/services/push-notification-service.ts',
  'lib/supabase-client.ts',
  'lib/supabase-config.ts'
];

console.log('\n🔧 Verificando archivos críticos:');
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - FALTA`);
    hasErrors = true;
  }
});

// Verificar que el archivo simulado fue eliminado
const simulatedFile = path.join(__dirname, '..', 'lib', 'supabase.ts');
if (fs.existsSync(simulatedFile)) {
  console.log('\n❌ El archivo simulado lib/supabase.ts aún existe y debe ser eliminado');
  hasErrors = true;
} else {
  console.log('\n✅ El archivo simulado lib/supabase.ts fue eliminado correctamente');
}

// Verificar configuración de Realtime
const configFile = path.join(__dirname, '..', 'lib', 'supabase-config.ts');
if (fs.existsSync(configFile)) {
  const configContent = fs.readFileSync(configFile, 'utf8');
  if (configContent.includes('realtime:') && configContent.includes('eventsPerSecond')) {
    console.log('✅ Configuración de Realtime presente');
  } else {
    console.log('⚠️ Configuración de Realtime podría estar incompleta');
  }
}

// Resultado final
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ VERIFICACIÓN FALLIDA');
  console.log('🚨 Se encontraron problemas que necesitan ser corregidos');
  process.exit(1);
} else {
  console.log('✅ VERIFICACIÓN EXITOSA');
  console.log(`🎉 Error de Supabase Realtime corregido - ${fixedFiles} archivos actualizados`);
  console.log('\n📋 Próximos pasos:');
  console.log('  1. La aplicación debería ejecutarse sin errores');
  console.log('  2. Verificar en la consola del navegador que no aparece el error:');
  console.log('     "TypeError: _lib_supabase__WEBPACK_IMPORTED_MODULE_0__.supabase.channel is not a function"');
  console.log('  3. Comprobar que las notificaciones en tiempo real funcionan correctamente');
}
