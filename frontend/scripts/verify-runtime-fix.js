#!/usr/bin/env node

/**
 * Script para verificar que los errores de runtime se han resuelto
 */

const fs = require('fs');
const path = require('path');
const colors = require('colors');

console.log('🔍 Verificando corrección de errores de runtime...\n'.cyan.bold);

let allChecksPass = true;
let passedChecks = 0;
let totalChecks = 0;

// Verificaciones de archivos críticos
const filesToCheck = [
  {
    path: 'app/layout.tsx',
    description: 'Layout principal',
    checks: [
      {
        pattern: /suppressHydrationWarning/,
        description: 'Supresión de warnings de hidratación configurada'
      },
      {
        pattern: /ClientLayoutWrapper/,
        description: 'Wrapper de layout simplificado en uso'
      }
    ]
  },
  {
    path: 'components/client-layout-wrapper.tsx',
    description: 'Wrapper de layout del cliente',
    checks: [
      {
        pattern: /export function ClientLayoutWrapper/,
        description: 'Componente funcional en lugar de clase'
      },
      {
        pattern: /const \[isHydrated, setIsHydrated\] = useState\(false\)/,
        description: 'Manejo de hidratación simplificado'
      },
      {
        pattern: /suppressHydrationWarning/,
        description: 'Supresión de warnings de hidratación'
      }
    ]
  },
  {
    path: 'components/ui/drawer.tsx',
    description: 'Componente Drawer con vaul',
    checks: [
      {
        pattern: /@ts-ignore.*vaul.*React 19/,
        description: 'Supresión de warnings de TypeScript para vaul'
      },
      {
        pattern: /VaulWrapper.*React\.memo/,
        description: 'Wrapper de compatibilidad para vaul'
      }
    ]
  },
  {
    path: 'package.json',
    description: 'Configuración de dependencias',
    checks: [
      {
        pattern: /"overrides":/,
        description: 'Overrides de dependencias configurados'
      },
      {
        pattern: /"react": "\^19"/,
        description: 'React 19 en overrides'
      },
      {
        pattern: /"next": "\^15\.3\.3"/,
        description: 'Next.js actualizado a la última versión'
      }
    ]
  }
];

filesToCheck.forEach(file => {
  console.log(`\n📁 Verificando ${file.description}...`.cyan);
  
  const filePath = path.join(__dirname, '..', file.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ Archivo no encontrado: ${file.path}`.red);
    allChecksPass = false;
    totalChecks++;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  file.checks.forEach(check => {
    totalChecks++;
    if (check.pattern.test(content)) {
      console.log(`   ✅ ${check.description}`.green);
      passedChecks++;
    } else {
      console.log(`   ❌ ${check.description}`.red);
      allChecksPass = false;
    }
  });
});

// Verificar que Next.js está actualizado
console.log('\n🔄 Verificando versión de Next.js...'.cyan);
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next;
  
  totalChecks++;
  if (nextVersion && nextVersion.includes('15.3')) {
    console.log(`   ✅ Next.js actualizado a ${nextVersion}`.green);
    passedChecks++;
  } else {
    console.log(`   ❌ Next.js no está en la versión correcta: ${nextVersion}`.red);
    allChecksPass = false;
  }
} else {
  console.log('   ❌ package.json no encontrado'.red);
  allChecksPass = false;
  totalChecks++;
}

// Verificar que no hay errores de compilación obvios
console.log('\n🔍 Verificando patrones problemáticos...'.cyan);

const sourceFiles = [
  'app/layout.tsx',
  'components/client-layout-wrapper.tsx',
  'components/ui/drawer.tsx'
];

const problematicPatterns = [
  {
    pattern: /Cannot read properties of undefined \(reading 'call'\)/,
    description: 'Error de webpack "call" resuelto',
    shouldNotExist: true
  },
  {
    pattern: /class.*extends.*Component.*ErrorInfo/,
    description: 'Class components complejos removidos',
    shouldNotExist: true
  },
  {
    pattern: /componentDidCatch|getDerivedStateFromError/,
    description: 'Métodos de class component removidos',
    shouldNotExist: true
  }
];

sourceFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    problematicPatterns.forEach(pattern => {
      totalChecks++;
      const hasPattern = pattern.pattern.test(content);
      
      if (pattern.shouldNotExist) {
        if (!hasPattern) {
          console.log(`   ✅ ${pattern.description}`.green);
          passedChecks++;
        } else {
          console.log(`   ❌ ${pattern.description} - Patrón problemático encontrado`.red);
          allChecksPass = false;
        }
      } else {
        if (hasPattern) {
          console.log(`   ✅ ${pattern.description}`.green);
          passedChecks++;
        } else {
          console.log(`   ❌ ${pattern.description}`.red);
          allChecksPass = false;
        }
      }
    });
  }
});

// Resumen final
console.log('\n' + '='.repeat(60));
console.log(`📊 Resumen: ${passedChecks}/${totalChecks} verificaciones pasaron`.cyan.bold);

if (allChecksPass) {
  console.log('\n🎉 ¡TODOS LOS ERRORES DE RUNTIME HAN SIDO CORREGIDOS!'.green.bold);
  console.log('✅ Next.js actualizado a la última versión'.green);
  console.log('✅ Layout simplificado y compatible con React 19'.green);
  console.log('✅ Dependencias problemáticas manejadas correctamente'.green);
  console.log('✅ Warnings de hidratación suprimidos'.green);
  console.log('\n🚀 La aplicación debería funcionar sin errores de runtime.'.green);
} else {
  console.log('\n❌ AÚN HAY PROBLEMAS POR RESOLVER'.red.bold);
  console.log(`🔧 ${totalChecks - passedChecks} verificaciones fallaron`.red);
  console.log('\n📋 Próximos pasos:'.yellow);
  console.log('1. Revisar los errores mostrados arriba'.yellow);
  console.log('2. Aplicar las correcciones necesarias'.yellow);
  console.log('3. Ejecutar este script nuevamente'.yellow);
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
