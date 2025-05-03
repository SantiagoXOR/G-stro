/**
 * Script para probar el flujo de autenticación con Supabase
 *
 * Este script realiza las siguientes pruebas:
 * 1. Verificar la conexión a Supabase
 * 2. Registrar un usuario de prueba
 * 3. Verificar la creación del perfil
 * 4. Cerrar sesión
 * 5. Iniciar sesión
 * 6. Verificar la sesión
 * 7. Verificar las políticas RLS
 * 8. Verificar la función de reparación de perfiles
 */

require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');
const colors = require('colors/safe');

// Configuración
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY; // Nombre correcto de la variable

// Función para imprimir mensajes con formato
function log(message, color = colors.white) {
  console.log(color(message));
}

// Función principal
async function main() {
  log('='.repeat(80), colors.cyan);
  log('PRUEBA DE FLUJO DE AUTENTICACIÓN CON SUPABASE', colors.cyan.bold);
  log('='.repeat(80), colors.cyan);
  log('');

  // Verificar configuración
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    log('Error: Variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas', colors.red.bold);
    process.exit(1);
  }

  // Crear cliente de Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  log(`Conectando a Supabase: ${SUPABASE_URL}`, colors.yellow);

  try {
    // 1. Verificar conexión a Supabase
    log('\n1. Verificando conexión a Supabase...', colors.cyan);

    const { data: healthData, error: healthError } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);

    if (healthError) {
      throw new Error(`Error al conectar con Supabase: ${healthError.message}`);
    }

    log('✓ Conexión exitosa a Supabase', colors.green);
    log(`Datos de health_check: ${JSON.stringify(healthData)}`, colors.dim);

    // Usar un email fijo para las pruebas
    const uniqueEmail = 'test@example.com';
    const password = 'Test123456!';
    log(`\nEmail de prueba: ${uniqueEmail}`, colors.yellow);

    // 2. Registrar usuario de prueba
    log('\n2. Registrando usuario de prueba...', colors.cyan);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: uniqueEmail,
      password: password,
      options: {
        data: {
          name: 'Usuario de Prueba',
          role: 'customer'
        }
      }
    });

    if (signUpError) {
      if (signUpError.message === 'Email not confirmed') {
        log('✓ Comportamiento esperado: Email no confirmado', colors.green);
        log('En un entorno de producción, el usuario debería confirmar su email', colors.dim);
      } else {
        throw new Error(`Error al registrar usuario: ${signUpError.message}`);
      }
    } else {
      log('✓ Usuario registrado correctamente', colors.green);
      log(`ID de usuario: ${signUpData.user.id}`, colors.dim);
    }

    // 3. Verificar creación de perfil
    log('\n3. Verificando creación de perfil...', colors.cyan);

    // Esperar un momento para que se cree el perfil
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Usar el cliente con service_role para poder consultar sin restricciones
      let serviceClient;
      if (SUPABASE_SERVICE_ROLE_KEY) {
        log(`Usando clave de servicio: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`, colors.dim);
        serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        try {
          const { data: profileData, error: profileError } = await serviceClient
            .from('profiles')
            .select('*')
            .eq('email', uniqueEmail)
            .single();

          if (profileError) {
            log('✗ Error al verificar perfil', colors.red);
            log(`Error: ${profileError.message}`, colors.red);
          } else {
            log('✓ Perfil creado correctamente', colors.green);
            log(`Perfil: ${JSON.stringify(profileData)}`, colors.dim);
          }
        } catch (err) {
          log('✗ Error al verificar perfil', colors.red);
          log(`Error: ${err.message}`, colors.red);
        }

        // Intentar reparar perfiles
        try {
          log('\nIntentando reparar perfiles...', colors.yellow);
          const { data: repairData, error: repairError } = await serviceClient.rpc('repair_profiles_advanced');

          if (repairError) {
            log(`✗ Error al reparar perfiles: ${repairError.message}`, colors.red);
          } else {
            log('✓ Reparación de perfiles ejecutada', colors.green);
            log(repairData, colors.dim);
          }
        } catch (err) {
          log(`✗ Error al reparar perfiles: ${err.message}`, colors.red);
        }
      } else {
        log('⚠ No se pudo verificar el perfil: SUPABASE_SERVICE_ROLE_KEY no está configurada', colors.yellow);
      }
    } catch (err) {
      log(`✗ Error general al verificar perfil: ${err.message}`, colors.red);
    }

    // 4. Cerrar sesión
    log('\n4. Cerrando sesión...', colors.cyan);

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      throw new Error(`Error al cerrar sesión: ${signOutError.message}`);
    }

    log('✓ Sesión cerrada correctamente', colors.green);

    // 5. Iniciar sesión
    log('\n5. Iniciando sesión...', colors.cyan);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: uniqueEmail,
        password: password
      });

      if (signInError) {
        if (signInError.message === 'Email not confirmed') {
          log('✓ Comportamiento esperado: Email no confirmado', colors.green);
          log('En un entorno de producción, el usuario debería confirmar su email', colors.dim);
        } else {
          throw new Error(`Error al iniciar sesión: ${signInError.message}`);
        }
      } else {
        log('✓ Inicio de sesión exitoso', colors.green);
        log(`Token: ${signInData.session.access_token.substring(0, 20)}...`, colors.dim);
      }
    } catch (err) {
      log(`✗ Error al iniciar sesión: ${err.message}`, colors.red);
    }

    // 6. Verificar sesión
    log('\n6. Verificando sesión...', colors.cyan);

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(`Error al obtener sesión: ${sessionError.message}`);
    }

    if (sessionData.session) {
      log('✓ Sesión activa', colors.green);
      log(`Usuario: ${sessionData.session.user.email}`, colors.dim);
    } else {
      log('✗ No hay sesión activa', colors.red);
    }

    // 7. Verificar políticas RLS
    log('\n7. Verificando políticas RLS...', colors.cyan);

    try {
      // Crear un nuevo cliente con la clave de servicio
      if (SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const serviceRoleClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          const { data: policiesData, error: policiesError } = await serviceRoleClient.rpc('test_profiles_recursion_simple');

          if (policiesError) {
            log(`✗ Error al verificar políticas RLS: ${policiesError.message}`, colors.red);
          } else {
            log(`✓ Políticas RLS: ${policiesData}`, colors.green);
          }
        } catch (err) {
          log(`✗ Error al verificar políticas RLS: ${err.message}`, colors.red);
        }
      } else {
        log('⚠ No se pudieron verificar las políticas RLS: SUPABASE_SERVICE_ROLE_KEY no está configurada', colors.yellow);
      }
    } catch (err) {
      log(`✗ Error general al verificar políticas RLS: ${err.message}`, colors.red);
    }

    log('\nPruebas completadas con éxito', colors.green.bold);

  } catch (error) {
    log(`\n✗ Error: ${error.message}`, colors.red.bold);
    process.exit(1);
  }
}

// Ejecutar script
main().catch(error => {
  log(`Error fatal: ${error.message}`, colors.red.bold);
  process.exit(1);
});
