#!/usr/bin/env node

/**
 * Script para detectar errores de Fast Refresh en tiempo real
 * Analiza el código fuente para encontrar patrones problemáticos
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Detectando errores de Fast Refresh...\n');

// Patrones problemáticos que causan errores de Fast Refresh
const problematicPatterns = [
  {
    name: 'Dependencias circulares en useCallback',
    regex: /useCallback\([^,]+,\s*\[[^\]]*\bsignOut\b[^\]]*\]/g,
    severity: 'ERROR',
    description: 'useCallback con dependencia circular (signOut)'
  },
  {
    name: 'Objetos completos en dependencias',
    regex: /useEffect\([^,]+,\s*\[[^\]]*\buser\b(?!\?\.)[^\]]*\]/g,
    severity: 'WARNING',
    description: 'useEffect depende del objeto user completo en lugar de user?.id'
  },
  {
    name: 'Funciones no memoizadas en dependencias',
    regex: /useEffect\([^,]+,\s*\[[^\]]*\b\w+\(\)[^\]]*\]/g,
    severity: 'WARNING',
    description: 'Función no memoizada en dependencias de useEffect'
  },
  {
    name: 'useState en render sin useCallback',
    regex: /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[^}]*setState[^}]*}/g,
    severity: 'WARNING',
    description: 'Función que modifica estado sin useCallback'
  },
  {
    name: 'Dependencias de useEffect mal formateadas',
    regex: /useEffect\([^,]+,\s*\[\s*\]/g,
    severity: 'INFO',
    description: 'useEffect con array de dependencias vacío'
  }
];

// Archivos a analizar
const filesToAnalyze = [
  'components/auth-provider.tsx',
  'components/pwa-manager.tsx',
  'components/pwa-wrapper.tsx',
  'hooks/use-push-notifications.ts',
  'hooks/use-realtime-metrics.ts',
  'app/layout.tsx',
  'app/page.tsx',
  'app/auth/sign-in/page.tsx',
  'app/auth/sign-up/page.tsx',
  'app/menu/page.tsx'
];

let totalIssues = 0;
let criticalIssues = 0;

console.log('📋 Analizando archivos...\n');

filesToAnalyze.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file} - Archivo no encontrado`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let fileHasIssues = false;

  console.log(`🔍 ${file}:`);

  problematicPatterns.forEach(pattern => {
    const matches = content.match(pattern.regex);
    
    if (matches) {
      matches.forEach(match => {
        const lines = content.substring(0, content.indexOf(match)).split('\n');
        const lineNumber = lines.length;
        
        const icon = pattern.severity === 'ERROR' ? '❌' : 
                    pattern.severity === 'WARNING' ? '⚠️' : 'ℹ️';
        
        console.log(`  ${icon} Línea ${lineNumber}: ${pattern.name}`);
        console.log(`     ${pattern.description}`);
        console.log(`     Código: ${match.substring(0, 80)}...`);
        
        totalIssues++;
        if (pattern.severity === 'ERROR') {
          criticalIssues++;
        }
        fileHasIssues = true;
      });
    }
  });

  if (!fileHasIssues) {
    console.log(`  ✅ Sin problemas detectados`);
  }
  
  console.log('');
});

console.log('='.repeat(60));
console.log(`📊 Resumen de análisis:`);
console.log(`   Total de problemas: ${totalIssues}`);
console.log(`   Problemas críticos: ${criticalIssues}`);
console.log(`   Problemas menores: ${totalIssues - criticalIssues}`);

if (criticalIssues > 0) {
  console.log('\n🚨 ACCIÓN REQUERIDA:');
  console.log('   Se encontraron problemas críticos que causan errores de Fast Refresh');
  console.log('   Ejecuta: node scripts/fix-fast-refresh-errors.js');
} else if (totalIssues > 0) {
  console.log('\n⚠️  MEJORAS RECOMENDADAS:');
  console.log('   Se encontraron problemas menores que pueden optimizarse');
} else {
  console.log('\n✅ EXCELENTE:');
  console.log('   No se encontraron problemas de Fast Refresh');
}

console.log('\n💡 Recomendaciones generales:');
console.log('   📝 Usar useCallback para funciones en dependencias');
console.log('   📝 Depender solo de propiedades específicas (user?.id vs user)');
console.log('   📝 Evitar dependencias circulares en hooks');
console.log('   📝 Memoizar funciones que se pasan como props');
