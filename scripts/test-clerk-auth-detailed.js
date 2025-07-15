#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Prueba Detallada de Autenticación con Clerk - Gëstro\n');

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

if (!publishableKeyMatch || !secretKeyMatch) {
  console.log('❌ Credenciales de Clerk no encontradas en .env');
  process.exit(1);
}

const publishableKey = publishableKeyMatch[1].trim();
const secretKey = secretKeyMatch[1].trim();

console.log('=== 1. VERIFICACIÓN DE CREDENCIALES ===');
console.log(`✅ Publishable Key: ${publishableKey.substring(0, 20)}...`);
console.log(`✅ Secret Key: ${secretKey.substring(0, 20)}...`);

console.log('\n=== 2. PRUEBA DE CONECTIVIDAD CON CLERK API ===');

// Función para hacer peticiones a la API de Clerk
async function testClerkAPI() {
  try {
    // Probar endpoint de usuarios
    console.log('🔄 Probando endpoint de usuarios...');
    
    const curlCommand = `curl -s -X GET "https://api.clerk.com/v1/users" -H "Authorization: Bearer ${secretKey}" -H "Content-Type: application/json"`;
    const result = runCommand(curlCommand);
    
    if (result.success) {
      try {
        const response = JSON.parse(result.output);
        if (response.data) {
          console.log(`✅ Conectividad OK - ${response.data.length} usuarios encontrados`);
          
          // Buscar el usuario administrador
          const adminUser = response.data.find(user => 
            user.email_addresses && 
            user.email_addresses.some(email => email.email_address === 'santiagomartinez@upc.edu.ar')
          );
          
          if (adminUser) {
            console.log('✅ Usuario administrador encontrado:', adminUser.id);
            console.log('   Email:', adminUser.email_addresses[0].email_address);
            console.log('   Creado:', new Date(adminUser.created_at).toLocaleString());
          } else {
            console.log('⚠️  Usuario administrador no encontrado');
            console.log('🔧 Creando usuario administrador...');
            await createAdminUser();
          }
        } else if (response.errors) {
          console.log('❌ Error de API:', response.errors[0].message);
        } else {
          console.log('⚠️  Respuesta inesperada de la API');
        }
      } catch (parseError) {
        console.log('❌ Error al parsear respuesta:', result.output);
      }
    } else {
      console.log('❌ Error en petición:', result.output);
    }
  } catch (error) {
    console.log('❌ Error en prueba de API:', error.message);
  }
}

// Función para crear usuario administrador
async function createAdminUser() {
  try {
    const userData = {
      email_address: ['santiagomartinez@upc.edu.ar'],
      password: 'Admin123!',
      first_name: 'Santiago',
      last_name: 'Martinez',
      public_metadata: {
        role: 'admin'
      },
      private_metadata: {
        created_by: 'setup_script'
      }
    };
    
    const curlCommand = `curl -s -X POST "https://api.clerk.com/v1/users" -H "Authorization: Bearer ${secretKey}" -H "Content-Type: application/json" -d '${JSON.stringify(userData)}'`;
    const result = runCommand(curlCommand);
    
    if (result.success) {
      try {
        const response = JSON.parse(result.output);
        if (response.id) {
          console.log('✅ Usuario administrador creado exitosamente');
          console.log('   ID:', response.id);
          console.log('   Email:', response.email_addresses[0].email_address);
        } else if (response.errors) {
          console.log('❌ Error al crear usuario:', response.errors[0].message);
        }
      } catch (parseError) {
        console.log('❌ Error al parsear respuesta de creación:', result.output);
      }
    } else {
      console.log('❌ Error en petición de creación:', result.output);
    }
  } catch (error) {
    console.log('❌ Error al crear usuario administrador:', error.message);
  }
}

console.log('\n=== 3. VERIFICACIÓN DE CONFIGURACIÓN DE APLICACIÓN ===');

// Verificar configuración de la aplicación en Clerk
async function checkAppConfig() {
  try {
    console.log('🔄 Verificando configuración de aplicación...');
    
    const curlCommand = `curl -s -X GET "https://api.clerk.com/v1/instance" -H "Authorization: Bearer ${secretKey}"`;
    const result = runCommand(curlCommand);
    
    if (result.success) {
      try {
        const response = JSON.parse(result.output);
        if (response.object === 'instance') {
          console.log('✅ Configuración de aplicación:');
          console.log('   Dominio:', response.home_url || 'No configurado');
          console.log('   Modo desarrollo:', response.development_origin || 'No configurado');
          
          // Verificar URLs de redirección
          if (response.allowed_origins && response.allowed_origins.length > 0) {
            console.log('   Orígenes permitidos:', response.allowed_origins.join(', '));
          } else {
            console.log('⚠️  No hay orígenes permitidos configurados');
          }
        }
      } catch (parseError) {
        console.log('❌ Error al parsear configuración:', result.output);
      }
    } else {
      console.log('❌ Error al obtener configuración:', result.output);
    }
  } catch (error) {
    console.log('❌ Error en verificación de configuración:', error.message);
  }
}

console.log('\n=== 4. PRUEBA DE AUTENTICACIÓN LOCAL ===');

// Función para probar autenticación local
function testLocalAuth() {
  console.log('🔄 Probando autenticación en aplicación local...');
  
  // Verificar si la aplicación está ejecutándose
  const result3001 = runCommand('netstat -ano | findstr :3001');
  if (result3001.success && result3001.output.includes('3001')) {
    console.log('✅ Aplicación ejecutándose en puerto 3001');
    console.log('🔧 Accede a: http://localhost:3001/auth/sign-in');
    console.log('📧 Usuario: santiagomartinez@upc.edu.ar');
    console.log('🔑 Contraseña: Admin123!');
  } else {
    console.log('❌ Aplicación no está ejecutándose en puerto 3001');
    console.log('🔧 Ejecuta: npm run dev');
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  await testClerkAPI();
  await checkAppConfig();
  testLocalAuth();
  
  console.log('\n=== RESUMEN ===');
  console.log('1. Verifica que la aplicación esté ejecutándose');
  console.log('2. Accede a http://localhost:3001/auth/sign-in');
  console.log('3. Usa las credenciales del usuario administrador');
  console.log('4. Si hay problemas, revisa la consola del navegador');
  
  console.log('\n=== PRÓXIMOS PASOS ===');
  console.log('- Si la autenticación falla, verifica las URLs de redirección en Clerk Dashboard');
  console.log('- Asegúrate de que localhost:3001 esté en los orígenes permitidos');
  console.log('- Revisa los logs de la aplicación para errores específicos');
}

runAllTests();
