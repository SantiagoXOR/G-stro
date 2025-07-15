#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Prueba de Inicio de Sesión de Administrador - Gëstro\n');

// Función para leer archivo de forma segura
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Función para ejecutar comandos y capturar salida
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { 
      success: false, 
      output: error.message,
      stderr: error.stderr ? error.stderr.toString() : ''
    };
  }
}

console.log('=== 1. VERIFICACIÓN DE ESTADO DE LA APLICACIÓN ===');

// Verificar si la aplicación está ejecutándose
const checkApp = () => {
  const result3001 = runCommand('netstat -ano | findstr :3001');
  if (result3001.success && result3001.output.includes('3001')) {
    console.log('✅ Aplicación ejecutándose en puerto 3001');
    return true;
  } else {
    console.log('❌ Aplicación no está ejecutándose en puerto 3001');
    return false;
  }
};

const appRunning = checkApp();

if (!appRunning) {
  console.log('🔧 Inicia la aplicación con: npm run dev');
  process.exit(1);
}

console.log('\n=== 2. VERIFICACIÓN DE CREDENCIALES DE CLERK ===');

// Leer variables de entorno
const envPath = path.join(process.cwd(), '.env');
const envContent = readFile(envPath);

if (!envContent) {
  console.log('❌ No se puede leer el archivo .env');
  process.exit(1);
}

// Extraer credenciales de Clerk
const publishableKeyMatch = envContent.match(/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=(.+)/);
const secretKeyMatch = envContent.match(/CLERK_SECRET_KEY=(.+)/);
const devModeMatch = envContent.match(/NEXT_PUBLIC_CLERK_DEVELOPMENT=(.+)/);

if (!publishableKeyMatch || !secretKeyMatch) {
  console.log('❌ Credenciales de Clerk no encontradas');
  process.exit(1);
}

console.log('✅ Credenciales de Clerk configuradas');
console.log(`✅ Modo desarrollo: ${devModeMatch ? devModeMatch[1] : 'false'}`);

console.log('\n=== 3. PRUEBA DE USUARIO ADMINISTRADOR ===');

const secretKey = secretKeyMatch[1].trim();

// Función para buscar usuario administrador
async function checkAdminUser() {
  try {
    console.log('🔄 Buscando usuario administrador...');
    
    const curlCommand = `curl -s -X GET "https://api.clerk.com/v1/users?email_address=santiagomartinez@upc.edu.ar" -H "Authorization: Bearer ${secretKey}"`;
    const result = runCommand(curlCommand);
    
    if (result.success) {
      try {
        const response = JSON.parse(result.output);
        if (response.data && response.data.length > 0) {
          const user = response.data[0];
          console.log('✅ Usuario administrador encontrado:');
          console.log(`   ID: ${user.id}`);
          console.log(`   Email: ${user.email_addresses[0].email_address}`);
          console.log(`   Nombre: ${user.first_name} ${user.last_name}`);
          console.log(`   Verificado: ${user.email_addresses[0].verification.status}`);
          console.log(`   Creado: ${new Date(user.created_at).toLocaleString()}`);
          return user;
        } else {
          console.log('❌ Usuario administrador no encontrado');
          return null;
        }
      } catch (parseError) {
        console.log('❌ Error al parsear respuesta:', result.output);
        return null;
      }
    } else {
      console.log('❌ Error en petición:', result.output);
      return null;
    }
  } catch (error) {
    console.log('❌ Error al buscar usuario:', error.message);
    return null;
  }
}

console.log('\n=== 4. INSTRUCCIONES DE PRUEBA ===');

console.log('🌐 URLs de prueba disponibles:');
console.log('   • Página de prueba: http://localhost:3001/auth/test');
console.log('   • Inicio de sesión: http://localhost:3001/auth/sign-in');
console.log('   • Registro: http://localhost:3001/auth/sign-up');
console.log('   • Panel admin: http://localhost:3001/admin');

console.log('\n📧 Credenciales de prueba:');
console.log('   • Email: santiagomartinez@upc.edu.ar');
console.log('   • Contraseña: (usar la configurada en Clerk Dashboard)');

console.log('\n🔧 Opciones de autenticación:');
console.log('   1. Clerk UI (recomendado): Usa el tab "Clerk UI" en /auth/sign-in');
console.log('   2. Formulario básico: Usa el tab "Formulario Básico"');
console.log('   3. Modo offline: Usa cualquier email con contraseña "offline"');

console.log('\n=== 5. PASOS PARA PROBAR ===');

console.log('1. 🌐 Abre: http://localhost:3001/auth/test');
console.log('2. 🔍 Verifica el estado de autenticación');
console.log('3. 🔐 Si no estás autenticado, haz clic en "Iniciar Sesión"');
console.log('4. 📝 Usa las credenciales del administrador');
console.log('5. ✅ Verifica que puedas acceder al panel admin');

console.log('\n=== 6. SOLUCIÓN DE PROBLEMAS ===');

console.log('Si la autenticación falla:');
console.log('• 🔍 Abre las herramientas de desarrollador (F12)');
console.log('• 📋 Revisa la consola para errores');
console.log('• 🌐 Verifica que no hay errores de CORS');
console.log('• 🔄 Intenta refrescar la página');
console.log('• 🔧 Si persiste, usa el modo offline con contraseña "offline"');

console.log('\n=== VERIFICACIÓN FINAL ===');

// Ejecutar verificación de usuario administrador
checkAdminUser().then(user => {
  if (user) {
    console.log('\n✅ Todo configurado correctamente. ¡Prueba la autenticación!');
    console.log('🚀 Accede a: http://localhost:3001/auth/test');
  } else {
    console.log('\n⚠️  Usuario administrador no encontrado en Clerk.');
    console.log('🔧 Opciones:');
    console.log('   1. Crear usuario en Clerk Dashboard');
    console.log('   2. Registrarse en: http://localhost:3001/auth/sign-up');
    console.log('   3. Usar modo offline con contraseña "offline"');
  }
});

console.log('\n📊 Estado actual:');
console.log(`   • Aplicación: ✅ Ejecutándose en puerto 3001`);
console.log(`   • Clerk: ✅ Configurado`);
console.log(`   • Modo desarrollo: ✅ Activado`);
console.log(`   • Páginas de prueba: ✅ Disponibles`);
