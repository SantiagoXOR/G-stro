#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('colors');

console.log('🔍 Verificando preparación para deploy en Vercel'.cyan.bold);
console.log('=' .repeat(60));

let allChecksPass = true;
let passedChecks = 0;
let totalChecks = 0;

function check(condition, description) {
  totalChecks++;
  if (condition) {
    console.log(`   ✅ ${description}`.green);
    passedChecks++;
  } else {
    console.log(`   ❌ ${description}`.red);
    allChecksPass = false;
  }
}

// 1. VERIFICAR ARCHIVOS DE CONFIGURACIÓN
console.log('\n📁 ARCHIVOS DE CONFIGURACIÓN:'.yellow);

const configFiles = [
  { file: 'package.json', description: 'package.json existe' },
  { file: 'next.config.mjs', description: 'next.config.mjs configurado' },
  { file: 'vercel.json', description: 'vercel.json creado' },
  { file: '.env.production.example', description: 'Variables de entorno documentadas' }
];

configFiles.forEach(({ file, description }) => {
  const filePath = path.join(__dirname, '..', file);
  check(fs.existsSync(filePath), description);
});

// 2. VERIFICAR PACKAGE.JSON
console.log('\n📦 SCRIPTS DE BUILD:'.yellow);
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  
  check(packageJson.scripts?.build, 'Script de build configurado');
  check(packageJson.scripts?.start, 'Script de start configurado');
  check(packageJson.scripts?.dev, 'Script de desarrollo configurado');
  
  // Verificar dependencias críticas
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  check(deps['next'], 'Next.js instalado');
  check(deps['react'], 'React instalado');
  check(deps['@clerk/nextjs'], 'Clerk instalado');
  check(deps['@supabase/supabase-js'], 'Supabase instalado');
  
} catch (error) {
  check(false, 'Error al leer package.json');
}

// 3. VERIFICAR NEXT.CONFIG.MJS
console.log('\n⚙️ CONFIGURACIÓN DE NEXT.JS:'.yellow);
try {
  const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs');
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  check(nextConfigContent.includes('remotePatterns'), 'Patrones de imágenes remotas configurados');
  check(nextConfigContent.includes('img.clerk.com'), 'Imágenes de Clerk permitidas');
  check(nextConfigContent.includes('googleusercontent.com'), 'Imágenes de Google permitidas');
  
} catch (error) {
  check(false, 'Error al verificar next.config.mjs');
}

// 4. VERIFICAR ESTRUCTURA DE DIRECTORIOS
console.log('\n📂 ESTRUCTURA DEL PROYECTO:'.yellow);

const requiredDirs = [
  'app',
  'components',
  'lib',
  'public'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  check(fs.existsSync(dirPath), `Directorio ${dir}/ existe`);
});

// 5. VERIFICAR ARCHIVOS CRÍTICOS
console.log('\n📄 ARCHIVOS CRÍTICOS:'.yellow);

const criticalFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'middleware.ts',
  'lib/supabase-client.ts'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  check(fs.existsSync(filePath), `${file} existe`);
});

// 6. VERIFICAR VARIABLES DE ENTORNO
console.log('\n🔐 VARIABLES DE ENTORNO:'.yellow);

const envExample = path.join(__dirname, '..', '.env.production.example');
if (fs.existsSync(envExample)) {
  const envContent = fs.readFileSync(envExample, 'utf8');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY',
    'MERCADOPAGO_ACCESS_TOKEN'
  ];
  
  requiredEnvVars.forEach(envVar => {
    check(envContent.includes(envVar), `${envVar} documentada`);
  });
} else {
  check(false, 'Archivo .env.production.example no encontrado');
}

// 7. VERIFICAR VERCEL.JSON
console.log('\n🚀 CONFIGURACIÓN DE VERCEL:'.yellow);
try {
  const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  
  check(vercelConfig.framework === 'nextjs', 'Framework Next.js configurado');
  check(vercelConfig.buildCommand, 'Comando de build configurado');
  check(vercelConfig.functions, 'Configuración de funciones definida');
  
} catch (error) {
  check(false, 'Error al verificar vercel.json');
}

// RESUMEN FINAL
console.log('\n' + '='.repeat(60));
console.log(`📊 RESUMEN: ${passedChecks}/${totalChecks} verificaciones pasaron`.cyan.bold);

if (allChecksPass) {
  console.log('\n🎉 ¡PROYECTO LISTO PARA DEPLOY!'.green.bold);
  console.log('   Todos los archivos y configuraciones están en orden.');
  console.log('   Puedes proceder con el deploy en Vercel.');
} else {
  console.log('\n⚠️ PROYECTO NECESITA AJUSTES'.yellow.bold);
  console.log('   Revisa los elementos marcados con ❌ antes del deploy.');
}

console.log('\n📋 PRÓXIMOS PASOS:'.cyan.bold);
console.log('   1. Ejecutar: node scripts/deploy-vercel.js');
console.log('   2. Conectar repositorio a Vercel');
console.log('   3. Configurar variables de entorno en Vercel Dashboard');
console.log('   4. Realizar deploy de prueba');

process.exit(allChecksPass ? 0 : 1);
