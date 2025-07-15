#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('👤 Creación de Usuario Administrador - Gëstro\n');

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

console.log('=== 1. VERIFICACIÓN DE CREDENCIALES ===');

// Leer variables de entorno
const envPath = path.join(process.cwd(), '.env');
const envContent = readFile(envPath);

if (!envContent) {
  console.log('❌ No se puede leer el archivo .env');
  process.exit(1);
}

const secretKeyMatch = envContent.match(/CLERK_SECRET_KEY=(.+)/);
if (!secretKeyMatch) {
  console.log('❌ CLERK_SECRET_KEY no encontrado');
  process.exit(1);
}

const secretKey = secretKeyMatch[1].trim();
console.log('✅ Credenciales de Clerk encontradas');

console.log('\n=== 2. CREACIÓN DE USUARIO ADMINISTRADOR ===');

// Función para crear usuario administrador
async function createAdminUser() {
  try {
    console.log('🔄 Creando usuario administrador...');
    
    const userData = {
      email_address: ['santiagomartinez@upc.edu.ar'],
      password: 'GestroAdmin2024!',
      first_name: 'Santiago',
      last_name: 'Martinez',
      public_metadata: {
        role: 'admin'
      },
      private_metadata: {
        created_by: 'setup_script',
        permissions: ['admin', 'staff', 'customer']
      },
      skip_password_checks: true,
      skip_password_requirement: false
    };
    
    const curlCommand = `curl -s -X POST "https://api.clerk.com/v1/users" -H "Authorization: Bearer ${secretKey}" -H "Content-Type: application/json" -d '${JSON.stringify(userData)}'`;
    const result = runCommand(curlCommand);
    
    if (result.success) {
      try {
        const response = JSON.parse(result.output);
        if (response.id) {
          console.log('✅ Usuario administrador creado exitosamente:');
          console.log(`   ID: ${response.id}`);
          console.log(`   Email: ${response.email_addresses[0].email_address}`);
          console.log(`   Nombre: ${response.first_name} ${response.last_name}`);
          console.log(`   Contraseña: GestroAdmin2024!`);
          
          // Verificar el email automáticamente
          await verifyUserEmail(response.id, response.email_addresses[0].id);
          
          return response;
        } else if (response.errors) {
          const error = response.errors[0];
          if (error.code === 'form_identifier_exists') {
            console.log('⚠️  El usuario ya existe. Buscando usuario existente...');
            return await findExistingUser();
          } else {
            console.log('❌ Error al crear usuario:', error.message);
            return null;
          }
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
    console.log('❌ Error al crear usuario:', error.message);
    return null;
  }
}

// Función para buscar usuario existente
async function findExistingUser() {
  try {
    console.log('🔄 Buscando usuario existente...');
    
    const curlCommand = `curl -s -X GET "https://api.clerk.com/v1/users?email_address=santiagomartinez@upc.edu.ar" -H "Authorization: Bearer ${secretKey}"`;
    const result = runCommand(curlCommand);
    
    if (result.success) {
      const response = JSON.parse(result.output);
      if (response.data && response.data.length > 0) {
        const user = response.data[0];
        console.log('✅ Usuario existente encontrado:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email_addresses[0].email_address}`);
        console.log(`   Verificado: ${user.email_addresses[0].verification.status}`);
        return user;
      }
    }
    return null;
  } catch (error) {
    console.log('❌ Error al buscar usuario:', error.message);
    return null;
  }
}

// Función para verificar email del usuario
async function verifyUserEmail(userId, emailId) {
  try {
    console.log('🔄 Verificando email del usuario...');
    
    const curlCommand = `curl -s -X POST "https://api.clerk.com/v1/users/${userId}/email_addresses/${emailId}/verify" -H "Authorization: Bearer ${secretKey}" -H "Content-Type: application/json"`;
    const result = runCommand(curlCommand);
    
    if (result.success) {
      const response = JSON.parse(result.output);
      if (response.verification && response.verification.status === 'verified') {
        console.log('✅ Email verificado exitosamente');
      } else {
        console.log('⚠️  Email no pudo ser verificado automáticamente');
      }
    }
  } catch (error) {
    console.log('⚠️  Error al verificar email:', error.message);
  }
}

console.log('\n=== 3. CONFIGURACIÓN DE ROLES EN SUPABASE ===');

// Función para configurar roles en Supabase
async function setupSupabaseRoles(clerkUserId) {
  try {
    console.log('🔄 Configurando roles en Supabase...');
    
    // Aquí normalmente haríamos una inserción en la tabla de perfiles
    // Por ahora, solo mostramos las instrucciones
    console.log('📝 Instrucciones para configurar roles en Supabase:');
    console.log(`   1. Accede al panel de Supabase`);
    console.log(`   2. Ve a la tabla 'profiles'`);
    console.log(`   3. Inserta un registro con:`);
    console.log(`      - id: ${clerkUserId}`);
    console.log(`      - email: santiagomartinez@upc.edu.ar`);
    console.log(`      - role: admin`);
    console.log(`      - name: Santiago Martinez`);
    
  } catch (error) {
    console.log('❌ Error en configuración de Supabase:', error.message);
  }
}

console.log('\n=== EJECUTANDO CREACIÓN ===');

// Ejecutar la creación del usuario
createAdminUser().then(async (user) => {
  if (user) {
    console.log('\n✅ Usuario administrador configurado exitosamente');
    
    // Configurar roles en Supabase
    await setupSupabaseRoles(user.id);
    
    console.log('\n=== CREDENCIALES DE ACCESO ===');
    console.log('📧 Email: santiagomartinez@upc.edu.ar');
    console.log('🔑 Contraseña: GestroAdmin2024!');
    
    console.log('\n=== PRÓXIMOS PASOS ===');
    console.log('1. 🌐 Accede a: http://localhost:3001/auth/sign-in');
    console.log('2. 🔐 Usa las credenciales mostradas arriba');
    console.log('3. ✅ Verifica que puedas acceder al panel admin');
    console.log('4. 🔧 Si hay problemas, usa la página de prueba: http://localhost:3001/auth/test');
    
    console.log('\n=== ALTERNATIVAS ===');
    console.log('Si la autenticación con Clerk no funciona:');
    console.log('• 🔄 Usa el modo offline con contraseña "offline"');
    console.log('• 📝 Regístrate manualmente en: http://localhost:3001/auth/sign-up');
    console.log('• 🔍 Revisa la consola del navegador para errores');
    
  } else {
    console.log('\n❌ No se pudo crear el usuario administrador');
    console.log('\n🔧 Alternativas:');
    console.log('1. 📝 Regístrate manualmente en: http://localhost:3001/auth/sign-up');
    console.log('2. 🔄 Usa el modo offline con cualquier email y contraseña "offline"');
    console.log('3. 🌐 Crea el usuario directamente en Clerk Dashboard');
  }
});

console.log('\n📊 Información del sistema:');
console.log('   • Aplicación: http://localhost:3001');
console.log('   • Página de prueba: http://localhost:3001/auth/test');
console.log('   • Inicio de sesión: http://localhost:3001/auth/sign-in');
console.log('   • Panel admin: http://localhost:3001/admin');
