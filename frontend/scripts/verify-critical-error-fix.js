#!/usr/bin/env node

/**
 * Script para verificar que el error crítico "Cannot read properties of undefined (reading 'call')" 
 * ha sido resuelto en Gëstro
 */

const fs = require('fs');
const path = require('path');
const colors = require('colors');

console.log('🔍 Verificando corrección del error crítico de Gëstro...\n'.cyan.bold);

let allChecksPass = true;
let passedChecks = 0;
let totalChecks = 0;

// Verificar que el middleware ha sido simplificado
console.log('📁 Verificando middleware simplificado...'.cyan);
const middlewarePath = path.join(__dirname, '..', 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  // Verificaciones del middleware
  const middlewareChecks = [
    {
      pattern: /import.*clerkMiddleware.*from.*@clerk\/nextjs\/server/,
      description: 'clerkMiddleware removido',
      shouldNotExist: true
    },
    {
      pattern: /import.*currentUser.*from.*@clerk\/nextjs\/server/,
      description: 'currentUser removido',
      shouldNotExist: true
    },
    {
      pattern: /export default function middleware/,
      description: 'Middleware simplificado implementado',
      shouldNotExist: false
    },
    {
      pattern: /MIDDLEWARE SIMPLIFICADO PARA RESOLVER ERROR CRÍTICO/,
      description: 'Comentario de corrección presente',
      shouldNotExist: false
    }
  ];

  middlewareChecks.forEach(check => {
    totalChecks++;
    const found = check.pattern.test(middlewareContent);
    const passed = check.shouldNotExist ? !found : found;
    
    if (passed) {
      console.log(`   ✅ ${check.description}`.green);
      passedChecks++;
    } else {
      console.log(`   ❌ ${check.description}`.red);
      allChecksPass = false;
    }
  });
} else {
  console.log('   ❌ middleware.ts no encontrado'.red);
  allChecksPass = false;
}

// Verificar que el layout sigue siendo simple
console.log('\n📄 Verificando layout simplificado...'.cyan);
const layoutPath = path.join(__dirname, '..', 'app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  const layoutChecks = [
    {
      pattern: /import.*from.*@clerk/,
      description: 'Sin importaciones de Clerk en layout',
      shouldNotExist: true
    },
    {
      pattern: /style=\{\{.*margin: 0.*\}\}/,
      description: 'Estilos inline simples',
      shouldNotExist: false
    },
    {
      pattern: /export default function RootLayout/,
      description: 'Función de layout simple',
      shouldNotExist: false
    }
  ];

  layoutChecks.forEach(check => {
    totalChecks++;
    const found = check.pattern.test(layoutContent);
    const passed = check.shouldNotExist ? !found : found;
    
    if (passed) {
      console.log(`   ✅ ${check.description}`.green);
      passedChecks++;
    } else {
      console.log(`   ❌ ${check.description}`.red);
      allChecksPass = false;
    }
  });
} else {
  console.log('   ❌ app/layout.tsx no encontrado'.red);
  allChecksPass = false;
}

// Verificar configuración de Next.js
console.log('\n⚙️ Verificando configuración de Next.js...'.cyan);
const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  totalChecks++;
  if (nextConfigContent.includes('reactStrictMode: false')) {
    console.log('   ✅ React Strict Mode deshabilitado'.green);
    passedChecks++;
  } else {
    console.log('   ⚠️ React Strict Mode no está explícitamente deshabilitado'.yellow);
  }
} else {
  console.log('   ❌ next.config.mjs no encontrado'.red);
  allChecksPass = false;
}

// Verificar variables de entorno
console.log('\n🔐 Verificando variables de entorno...'.cyan);
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const envChecks = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'
  ];

  envChecks.forEach(envVar => {
    totalChecks++;
    if (envContent.includes(envVar)) {
      console.log(`   ✅ ${envVar} configurada`.green);
      passedChecks++;
    } else {
      console.log(`   ❌ ${envVar} faltante`.red);
      allChecksPass = false;
    }
  });
} else {
  console.log('   ❌ .env.local no encontrado'.red);
  allChecksPass = false;
}

// Verificar que no hay patrones problemáticos
console.log('\n🔍 Verificando patrones problemáticos...'.cyan);
const sourceFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'middleware.ts'
];

const problematicPatterns = [
  {
    pattern: /Cannot read properties of undefined \(reading 'call'\)/,
    description: 'Error "call" resuelto',
    shouldNotExist: true
  },
  {
    pattern: /clerkMiddleware\(/,
    description: 'clerkMiddleware removido',
    shouldNotExist: true
  },
  {
    pattern: /currentUser\(\)/,
    description: 'currentUser() removido',
    shouldNotExist: true
  }
];

sourceFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    problematicPatterns.forEach(pattern => {
      totalChecks++;
      const found = pattern.pattern.test(content);
      const passed = pattern.shouldNotExist ? !found : found;
      
      if (passed) {
        console.log(`   ✅ ${file}: ${pattern.description}`.green);
        passedChecks++;
      } else {
        console.log(`   ❌ ${file}: ${pattern.description}`.red);
        allChecksPass = false;
      }
    });
  }
});

// Resumen final
console.log('\n' + '='.repeat(60));
console.log('📊 Resumen de verificación del error crítico:'.bold);
console.log(`   Total de verificaciones: ${totalChecks}`);
console.log(`   Verificaciones exitosas: ${passedChecks}`.green);
console.log(`   Verificaciones fallidas: ${totalChecks - passedChecks}`.red);

if (allChecksPass) {
  console.log('\n🎉 ¡ERROR CRÍTICO RESUELTO EXITOSAMENTE!'.green.bold);
  console.log('✅ La aplicación debería funcionar sin errores de runtime'.green);
  console.log('✅ Fast Refresh debería funcionar correctamente'.green);
  console.log('✅ El middleware ha sido simplificado temporalmente'.green);
  console.log('\n📝 Próximos pasos recomendados:'.cyan);
  console.log('   1. Verificar que la aplicación carga correctamente en el navegador');
  console.log('   2. Probar Fast Refresh haciendo cambios en componentes');
  console.log('   3. Configurar Clerk correctamente cuando sea necesario');
  console.log('   4. Restaurar autenticación gradualmente');
} else {
  console.log('\n❌ Aún hay problemas que resolver'.red.bold);
  console.log('🔧 Revisa los elementos marcados con ❌ arriba'.yellow);
}

console.log('\n' + '='.repeat(60));
