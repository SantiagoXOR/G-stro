#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('colors');

console.log('🚀 Configuración de Deployment en Vercel - Gëstro'.cyan.bold);
console.log('=' .repeat(70));

// Verificar estado actual
console.log('\n📊 ESTADO ACTUAL DEL PROYECTO:'.yellow.bold);

// 1. Verificar archivos de configuración
const configFiles = [
  { file: 'vercel.json', desc: 'Configuración de Vercel' },
  { file: 'next.config.mjs', desc: 'Configuración de Next.js' },
  { file: '.env.production.example', desc: 'Variables de entorno de ejemplo' },
  { file: 'package.json', desc: 'Dependencias del proyecto' },
  { file: 'middleware.ts', desc: 'Middleware de autenticación' }
];

configFiles.forEach(({ file, desc }) => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  console.log(`   ${exists ? '✅' : '❌'} ${desc}: ${file}`);
});

// 2. Verificar estructura crítica
console.log('\n📂 ESTRUCTURA CRÍTICA:'.yellow.bold);
const criticalDirs = ['app', 'components', 'lib', 'public'];
criticalDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, '..', dir));
  console.log(`   ${exists ? '✅' : '❌'} Directorio ${dir}/`);
});

// 3. Leer configuración actual
console.log('\n⚙️ CONFIGURACIÓN ACTUAL:'.yellow.bold);
try {
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
  console.log(`   ✅ Framework: ${vercelConfig.framework}`);
  console.log(`   ✅ Build Command: ${vercelConfig.buildCommand}`);
  console.log(`   ✅ Región: ${vercelConfig.regions?.[0] || 'default'}`);
} catch (error) {
  console.log('   ❌ Error al leer vercel.json');
}

// 4. Verificar variables de entorno
console.log('\n🔑 VARIABLES DE ENTORNO:'.yellow.bold);
const envExample = path.join(__dirname, '..', '.env.production.example');
if (fs.existsSync(envExample)) {
  const envContent = fs.readFileSync(envExample, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY'
  ];
  
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(varName);
    console.log(`   ${hasVar ? '✅' : '❌'} ${varName}`);
  });
} else {
  console.log('   ❌ Archivo .env.production.example no encontrado');
}

console.log('\n' + '=' .repeat(70));
console.log('📋 PASOS PARA DEPLOYMENT EN VERCEL:'.green.bold);

console.log('\n1️⃣ PREPARACIÓN PREVIA:'.cyan.bold);
console.log('   📋 Obtener credenciales de producción:');
console.log('      • Clerk: https://dashboard.clerk.com'.gray);
console.log('      • MercadoPago: https://www.mercadopago.com.ar/developers'.gray);
console.log('   📄 Revisar: docs/production-credentials-setup.md'.gray);

console.log('\n2️⃣ CONECTAR A VERCEL:'.cyan.bold);
console.log('   🌐 Ve a: https://vercel.com/dashboard'.gray);
console.log('   ➕ Haz clic en "New Project"');
console.log('   🔗 Conecta tu repositorio GitHub');
console.log('   📁 Selecciona el repositorio "G-stro"');
console.log('   ⚙️ Configura:');
console.log('      • Framework Preset: Next.js'.gray);
console.log('      • Root Directory: frontend'.gray);
console.log('      • Build Command: npm run build'.gray);
console.log('      • Output Directory: .next'.gray);

console.log('\n3️⃣ CONFIGURAR VARIABLES DE ENTORNO:'.cyan.bold);
console.log('   ⚙️ En Vercel Dashboard → Settings → Environment Variables');
console.log('   📋 Agregar las siguientes variables:');

// Leer y mostrar variables de ejemplo
if (fs.existsSync(envExample)) {
  const envContent = fs.readFileSync(envExample, 'utf8');
  const lines = envContent.split('\n').filter(line => 
    line.trim() && 
    !line.startsWith('#') && 
    line.includes('=')
  );
  
  lines.forEach(line => {
    const [key] = line.split('=');
    if (key) {
      console.log(`      • ${key}`.gray);
    }
  });
}

console.log('\n4️⃣ CONFIGURAR WEBHOOKS:'.cyan.bold);
console.log('   🔗 Clerk Webhook:');
console.log('      • URL: https://tu-dominio.vercel.app/api/webhook/clerk'.gray);
console.log('      • Eventos: user.created, user.updated, user.deleted'.gray);
console.log('   💳 MercadoPago Webhook:');
console.log('      • URL: https://tu-dominio.vercel.app/api/payments/webhook'.gray);
console.log('      • Eventos: payment, merchant_order'.gray);

console.log('\n5️⃣ REALIZAR DEPLOYMENT:'.cyan.bold);
console.log('   🚀 Haz clic en "Deploy"');
console.log('   ⏱️ Espera a que termine el build (2-5 minutos)');
console.log('   🔍 Verifica que no haya errores');
console.log('   🌐 Prueba la aplicación en el dominio asignado');

console.log('\n6️⃣ TESTING POST-DEPLOYMENT:'.cyan.bold);
console.log('   🔐 Probar autenticación con Clerk');
console.log('   💳 Probar pagos con MercadoPago');
console.log('   🗄️ Verificar conexión con Supabase');
console.log('   🍽️ Probar funcionalidades del menú y pedidos');

console.log('\n' + '=' .repeat(70));
console.log('⚠️ PROBLEMAS CONOCIDOS:'.red.bold);
console.log('   🔧 Build local con error de permisos: Normal, no afecta Vercel');
console.log('   ⚠️ Warning de Supabase realtime: No afecta funcionalidad');
console.log('   🔑 Credenciales de desarrollo: Deben cambiarse a producción');

console.log('\n' + '=' .repeat(70));
console.log('🔗 ENLACES ÚTILES:'.blue.bold);
console.log('   📊 Vercel Dashboard: https://vercel.com/dashboard');
console.log('   🔐 Clerk Dashboard: https://dashboard.clerk.com');
console.log('   💳 MercadoPago Dev: https://www.mercadopago.com.ar/developers');
console.log('   🗄️ Supabase Dashboard: https://supabase.com/dashboard');

console.log('\n' + '=' .repeat(70));
console.log('✅ CHECKLIST DE DEPLOYMENT:'.green.bold);
console.log('   [ ] Credenciales de Clerk actualizadas');
console.log('   [ ] Credenciales de MercadoPago actualizadas');
console.log('   [ ] Variables de entorno configuradas en Vercel');
console.log('   [ ] Webhooks configurados');
console.log('   [ ] Proyecto conectado a Vercel');
console.log('   [ ] Deployment exitoso');
console.log('   [ ] Testing de funcionalidades críticas');

console.log('\n🎉 ¡Listo para deployment!'.green.bold);
console.log('📞 Siguiente paso: Obtener credenciales de producción'.yellow);
