#!/usr/bin/env node

/**
 * Script para encontrar todas las importaciones de Supabase en el proyecto
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Buscando todas las importaciones de Supabase...\n');

// Función para buscar archivos recursivamente
function findFiles(dir, extensions, exclude = []) {
  let results = [];
  
  try {
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat && stat.isDirectory()) {
        // Excluir directorios específicos
        if (!exclude.includes(file)) {
          results = results.concat(findFiles(filePath, extensions, exclude));
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    });
  } catch (error) {
    console.warn(`⚠️ No se pudo leer el directorio ${dir}: ${error.message}`);
  }
  
  return results;
}

// Buscar archivos TypeScript y JavaScript
const sourceFiles = findFiles(
  path.join(__dirname, '..'), 
  ['.ts', '.tsx', '.js', '.jsx'], 
  ['node_modules', '.next', 'dist', 'build', 'scripts', 'docs', '__tests__']
);

console.log(`📁 Analizando ${sourceFiles.length} archivos...\n`);

let foundIssues = false;

// Patrones a buscar
const patterns = [
  {
    name: 'Importación directa de supabase',
    regex: /import.*supabase.*from.*['"]@\/lib\/supabase['"]/,
    severity: 'ERROR'
  },
  {
    name: 'Importación desde backend',
    regex: /import.*from.*['"].*\/backend\/lib\/supabase['"]/,
    severity: 'ERROR'
  },
  {
    name: 'Uso directo de supabase.channel',
    regex: /supabase\.channel\s*\(/,
    severity: 'ERROR'
  },
  {
    name: 'Importación correcta de supabase-client',
    regex: /import.*from.*['"]@\/lib\/supabase-client['"]/,
    severity: 'INFO'
  },
  {
    name: 'Uso de getSupabaseClient',
    regex: /getSupabaseClient\s*\(/,
    severity: 'INFO'
  }
];

// Verificar cada archivo
sourceFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  
  let fileHasIssues = false;
  
  patterns.forEach(pattern => {
    const matches = content.match(new RegExp(pattern.regex, 'g'));
    
    if (matches) {
      if (pattern.severity === 'ERROR') {
        console.log(`❌ ${relativePath} - ${pattern.name}`);
        matches.forEach((match, index) => {
          const lines = content.substring(0, content.indexOf(match)).split('\n');
          const lineNumber = lines.length;
          console.log(`   Línea ${lineNumber}: ${match.trim()}`);
        });
        foundIssues = true;
        fileHasIssues = true;
      } else if (pattern.severity === 'INFO') {
        console.log(`✅ ${relativePath} - ${pattern.name} (${matches.length} ocurrencias)`);
      }
    }
  });
  
  // Buscar líneas específicas que contengan "supabase.channel"
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('supabase.channel') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
      console.log(`🔍 ${relativePath}:${index + 1} - Uso de supabase.channel:`);
      console.log(`   ${line.trim()}`);
      foundIssues = true;
    }
  });
});

console.log('\n' + '='.repeat(60));

if (foundIssues) {
  console.log('❌ SE ENCONTRARON PROBLEMAS');
  console.log('🚨 Hay archivos que aún usan importaciones o patrones problemáticos');
} else {
  console.log('✅ NO SE ENCONTRARON PROBLEMAS');
  console.log('🎉 Todas las importaciones parecen estar correctas');
}

console.log('\n📋 Resumen:');
console.log('- ❌ = Problemas que necesitan corrección');
console.log('- ✅ = Importaciones correctas');
console.log('- 🔍 = Usos específicos de supabase.channel encontrados');
