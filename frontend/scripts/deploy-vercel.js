#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('colors');

console.log('🚀 Guía de Deploy en Vercel para Gëstro'.cyan.bold);
console.log('=' .repeat(60));

console.log('\n📋 PASOS PARA EL DEPLOY:'.yellow.bold);

console.log('\n1️⃣ PREPARACIÓN DEL PROYECTO:'.green);
console.log('   ✅ Verificar que el build funciona localmente');
console.log('   ✅ Configurar variables de entorno de producción');
console.log('   ✅ Actualizar credenciales de Clerk y MercadoPago');

console.log('\n2️⃣ CONFIGURACIÓN EN VERCEL:'.green);
console.log('   📁 Conectar repositorio GitHub a Vercel');
console.log('   ⚙️ Configurar variables de entorno en Vercel Dashboard');
console.log('   🔧 Configurar dominio personalizado (opcional)');

console.log('\n3️⃣ VARIABLES DE ENTORNO REQUERIDAS:'.green);
const envVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CLERK_WEBHOOK_SECRET',
  'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY',
  'MERCADOPAGO_ACCESS_TOKEN',
  'NEXT_PUBLIC_APP_URL',
  'NODE_ENV'
];

envVars.forEach(envVar => {
  console.log(`   📝 ${envVar}`);
});

console.log('\n4️⃣ CONFIGURACIÓN DE CLERK PARA PRODUCCIÓN:'.green);
console.log('   🔑 Crear aplicación de producción en Clerk Dashboard');
console.log('   🌐 Configurar dominios permitidos');
console.log('   🔗 Configurar URLs de redirección');
console.log('   📡 Configurar webhook para sincronización con Supabase');

console.log('\n5️⃣ CONFIGURACIÓN DE MERCADOPAGO:'.green);
console.log('   💳 Obtener credenciales de producción');
console.log('   🔗 Configurar URLs de notificación');
console.log('   ✅ Verificar configuración de pagos');

console.log('\n6️⃣ VERIFICACIONES POST-DEPLOY:'.green);
console.log('   🔐 Probar flujo de autenticación');
console.log('   💰 Probar flujo de pagos');
console.log('   📱 Verificar funcionalidad en móviles');
console.log('   🔄 Probar sincronización en tiempo real');

console.log('\n📚 ARCHIVOS IMPORTANTES:'.yellow.bold);
console.log('   📄 vercel.json - Configuración de Vercel');
console.log('   📄 .env.production.example - Variables de entorno');
console.log('   📄 next.config.mjs - Configuración de Next.js');

console.log('\n🔗 ENLACES ÚTILES:'.yellow.bold);
console.log('   🌐 Vercel Dashboard: https://vercel.com/dashboard');
console.log('   🔑 Clerk Dashboard: https://dashboard.clerk.com');
console.log('   💳 MercadoPago Developers: https://www.mercadopago.com.ar/developers');
console.log('   🗄️ Supabase Dashboard: https://supabase.com/dashboard');

console.log('\n⚠️ IMPORTANTE:'.red.bold);
console.log('   🔒 NO subir credenciales de producción al repositorio');
console.log('   🔑 Configurar todas las variables en Vercel Dashboard');
console.log('   🧪 Probar exhaustivamente antes de ir a producción');

console.log('\n✨ ¡Listo para el deploy!'.green.bold);
console.log('   Sigue los pasos anteriores para desplegar Gëstro en Vercel');
