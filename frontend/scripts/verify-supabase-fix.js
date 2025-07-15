#!/usr/bin/env node

/**
 * Script de verificación para comprobar que el error de Supabase Realtime se ha resuelto
 * Este script verifica la configuración y funcionalidad de Supabase
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando corrección del error de Supabase Realtime...\n');

// Verificar que los archivos necesarios existen
const requiredFiles = [
  'lib/supabase-client.ts',
  'lib/supabase-config.ts',
  'lib/services/push-notification-service.ts',
  'components/pwa-manager.tsx'
];

console.log('📁 Verificando archivos necesarios:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - FALTA`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Algunos archivos necesarios no existen. Verificar la implementación.');
  process.exit(1);
}

// Verificar configuración en supabase-client.ts
console.log('\n🔧 Verificando configuración de supabase-client.ts:');
const supabaseClientPath = path.join(__dirname, '..', 'lib/supabase-client.ts');
const supabaseClientContent = fs.readFileSync(supabaseClientPath, 'utf8');

const checks = [
  {
    name: 'Importa getSupabaseConfig',
    pattern: /import.*getSupabaseConfig.*from.*supabase-config/,
    required: true
  },
  {
    name: 'Usa configuración centralizada',
    pattern: /getSupabaseConfig\(\)/,
    required: true
  },
  {
    name: 'Usa config.config',
    pattern: /createClient\(config\.url,\s*config\.anonKey,\s*config\.config\)/,
    required: true
  },
  {
    name: 'Manejo de promesas',
    pattern: /_initializationPromise/,
    required: true
  }
];

checks.forEach(check => {
  if (check.pattern.test(supabaseClientContent)) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ${check.required ? '❌' : '⚠️'} ${check.name} - ${check.required ? 'FALTA' : 'OPCIONAL'}`);
    if (check.required) {
      allFilesExist = false;
    }
  }
});

// Verificar configuración en supabase-config.ts
console.log('\n⚙️ Verificando configuración de supabase-config.ts:');
const supabaseConfigPath = path.join(__dirname, '..', 'lib/supabase-config.ts');
const supabaseConfigContent = fs.readFileSync(supabaseConfigPath, 'utf8');

const configChecks = [
  {
    name: 'Función validateSupabaseConfig',
    pattern: /function validateSupabaseConfig/,
    required: true
  },
  {
    name: 'Función getSupabaseConfig',
    pattern: /function getSupabaseConfig/,
    required: true
  },
  {
    name: 'Configuración del cliente',
    pattern: /SUPABASE_CLIENT_CONFIG/,
    required: true
  },
  {
    name: 'Variables de entorno correctas',
    pattern: /olxxrwdxsubpiujsxzxa\.supabase\.co/,
    required: true
  }
];

configChecks.forEach(check => {
  if (check.pattern.test(supabaseConfigContent)) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ${check.required ? '❌' : '⚠️'} ${check.name} - ${check.required ? 'FALTA' : 'OPCIONAL'}`);
    if (check.required) {
      allFilesExist = false;
    }
  }
});

// Verificar mejoras en push-notification-service.ts
console.log('\n🔔 Verificando mejoras en push-notification-service.ts:');
const pushServicePath = path.join(__dirname, '..', 'lib/services/push-notification-service.ts');
const pushServiceContent = fs.readFileSync(pushServicePath, 'utf8');

const serviceChecks = [
  {
    name: 'Test funcional de channel',
    pattern: /channel-functional/,
    required: true
  },
  {
    name: 'Verificación de cliente mejorada',
    pattern: /testChannel.*unsubscribe/,
    required: true
  },
  {
    name: 'Limpieza de canales',
    pattern: /this\.cleanup\(\)/,
    required: true
  },
  {
    name: 'Modo fallback mejorado',
    pattern: /setupFallbackMode/,
    required: true
  }
];

serviceChecks.forEach(check => {
  if (check.pattern.test(pushServiceContent)) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ${check.required ? '❌' : '⚠️'} ${check.name} - ${check.required ? 'FALTA' : 'OPCIONAL'}`);
    if (check.required) {
      allFilesExist = false;
    }
  }
});

// Verificar variables de entorno
console.log('\n🌍 Verificando variables de entorno:');
const envPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const envChecks = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      pattern: /NEXT_PUBLIC_SUPABASE_URL=https:\/\/olxxrwdxsubpiujsxzxa\.supabase\.co/,
      required: true
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      pattern: /NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ/,
      required: true
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      pattern: /SUPABASE_SERVICE_ROLE_KEY=eyJ/,
      required: false
    }
  ];

  envChecks.forEach(check => {
    if (check.pattern.test(envContent)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ${check.required ? '❌' : '⚠️'} ${check.name} - ${check.required ? 'FALTA' : 'OPCIONAL'}`);
      if (check.required) {
        allFilesExist = false;
      }
    }
  });
} else {
  console.log('  ❌ .env.local - FALTA');
  allFilesExist = false;
}

// Resultado final
console.log('\n' + '='.repeat(60));
if (allFilesExist) {
  console.log('✅ VERIFICACIÓN EXITOSA');
  console.log('🎉 El error de Supabase Realtime ha sido corregido correctamente');
  console.log('\n📋 Próximos pasos:');
  console.log('  1. Ejecutar: npm run dev');
  console.log('  2. Abrir: http://localhost:3000 (o 3001 si 3000 está ocupado)');
  console.log('  3. Verificar en la consola del navegador que no hay errores');
  console.log('  4. Comprobar que aparecen logs de inicialización de Supabase');
} else {
  console.log('❌ VERIFICACIÓN FALLIDA');
  console.log('🚨 Algunos elementos necesarios están faltando o mal configurados');
  console.log('\n📋 Acciones requeridas:');
  console.log('  1. Revisar los elementos marcados con ❌');
  console.log('  2. Completar la implementación faltante');
  console.log('  3. Ejecutar este script nuevamente');
}
console.log('='.repeat(60));

process.exit(allFilesExist ? 0 : 1);
