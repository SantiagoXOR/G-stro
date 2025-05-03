/**
 * Script para probar el flujo de autenticación con Supabase
 *
 * Este script prueba:
 * 1. Registro de usuario
 * 2. Inicio de sesión
 * 3. Verificación de perfil
 * 4. Cierre de sesión
 *
 * Uso:
 * node scripts/test-auth-flow.js
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://myjqdrrqfdugzmuejypz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar que tenemos la clave anónima
if (!supabaseAnonKey) {
  console.error('Error: Se requiere la variable de entorno NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('Esta clave se puede obtener en la sección de configuración del proyecto en Supabase');
  process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Crear interfaz de línea de comandos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Función para imprimir mensajes con formato
function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

// Función para preguntar al usuario
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Función para generar un email único
function generateUniqueEmail() {
  // Usar un dominio válido para evitar problemas de validación
  return `test.${Date.now()}@gmail.com`;
}

// Función principal
async function main() {
  log('\n=== PRUEBA DE FLUJO DE AUTENTICACIÓN CON SUPABASE ===\n', colors.bright + colors.cyan);

  try {
    // 1. Verificar conexión a Supabase
    log('1. Verificando conexión a Supabase...', colors.yellow);

    try {
      const { data: healthCheck, error: healthError } = await supabase.from('health_check').select('*').limit(1);

      if (healthError) {
        throw new Error(`Error al conectar con Supabase: ${healthError.message}`);
      }

      log('✓ Conexión exitosa a Supabase', colors.green);
    } catch (error) {
      log(`✗ Error de conexión: ${error.message}`, colors.red);
      process.exit(1);
    }

    // 2. Registrar un nuevo usuario
    log('\n2. Registrando un nuevo usuario...', colors.yellow);

    const uniqueEmail = generateUniqueEmail();
    const password = 'password123';

    log(`Email generado: ${uniqueEmail}`, colors.dim);

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
      throw new Error(`Error al registrar usuario: ${signUpError.message}`);
    }

    log('✓ Usuario registrado correctamente', colors.green);
    log(`ID de usuario: ${signUpData.user.id}`, colors.dim);

    // 3. Verificar si se creó el perfil
    log('\n3. Verificando si se creó el perfil...', colors.yellow);

    // Esperar un momento para que se cree el perfil
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signUpData.user.id)
      .single();

    if (profileError) {
      log(`✗ Error al verificar perfil: ${profileError.message}`, colors.red);

      // Intentar reparar el perfil
      log('\nIntentando reparar el perfil...', colors.yellow);

      const { data: repairData, error: repairError } = await supabase.rpc('repair_profiles_advanced');

      if (repairError) {
        log(`✗ Error al reparar perfiles: ${repairError.message}`, colors.red);
      } else {
        log('✓ Reparación de perfiles completada', colors.green);
        log(repairData, colors.dim);

        // Verificar nuevamente
        const { data: profileDataAfterRepair, error: profileErrorAfterRepair } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signUpData.user.id)
          .single();

        if (profileErrorAfterRepair) {
          log(`✗ Perfil no encontrado después de la reparación: ${profileErrorAfterRepair.message}`, colors.red);
        } else {
          log('✓ Perfil encontrado después de la reparación', colors.green);
          log(JSON.stringify(profileDataAfterRepair, null, 2), colors.dim);
        }
      }
    } else {
      log('✓ Perfil creado correctamente', colors.green);
      log(JSON.stringify(profileData, null, 2), colors.dim);
    }

    // 4. Cerrar sesión
    log('\n4. Cerrando sesión...', colors.yellow);

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      throw new Error(`Error al cerrar sesión: ${signOutError.message}`);
    }

    log('✓ Sesión cerrada correctamente', colors.green);

    // 5. Iniciar sesión con el usuario creado
    log('\n5. Intentando iniciar sesión con el usuario creado...', colors.yellow);

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
        log(`Token de acceso: ${signInData.session.access_token.substring(0, 20)}...`, colors.dim);
      }
    } catch (error) {
      log(`✗ Error inesperado al iniciar sesión: ${error.message}`, colors.red);
    }

    // 6. Verificar la sesión
    log('\n6. Verificando la sesión...', colors.yellow);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Error al obtener la sesión: ${sessionError.message}`);
      }

      if (!sessionData.session) {
        log('✓ Comportamiento esperado: No hay sesión activa (email no confirmado)', colors.green);
      } else {
        log('✓ Sesión verificada correctamente', colors.green);
        log(`Usuario autenticado: ${sessionData.session.user.email}`, colors.dim);
      }
    } catch (error) {
      log(`✗ Error al verificar la sesión: ${error.message}`, colors.red);
    }

    // 7. Verificar políticas RLS
    log('\n7. Verificando políticas RLS...', colors.yellow);

    try {
      // Intentar acceder a perfiles sin autenticación (debería mostrar solo perfiles públicos)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

      if (profilesError) {
        log(`? Error al verificar perfiles: ${profilesError.message}`, colors.yellow);
      } else {
        log(`✓ Se pueden ver ${profilesData.length} perfiles públicos`, colors.green);
        log('Esto es esperado ya que la política RLS permite ver perfiles a todos', colors.dim);
      }

      // Intentar actualizar un perfil sin autenticación (debería fallar)
      if (profilesData && profilesData.length > 0) {
        const testProfileId = profilesData[0].id;
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ name: 'Test Update' })
          .eq('id', testProfileId);

        if (updateError && updateError.code === 'PGRST116') {
          log('✓ Políticas RLS funcionando correctamente (no se puede actualizar perfiles sin autenticación)', colors.green);
        } else if (updateError) {
          log(`? Error al verificar políticas RLS: ${updateError.message}`, colors.yellow);
        } else {
          log('! Advertencia: Se pudo actualizar un perfil sin autenticación', colors.red);
          log('Esto podría indicar un problema con las políticas RLS', colors.red);
        }
      }
    } catch (error) {
      log(`✗ Error al verificar políticas RLS: ${error.message}`, colors.red);
    }

    // 8. Verificar función de reparación de perfiles
    log('\n8. Verificando función de reparación de perfiles...', colors.yellow);

    try {
      const { data: fixRlsData, error: fixRlsError } = await supabase.rpc('fix_profiles_rls');

      if (fixRlsError) {
        log(`✗ Error al verificar políticas RLS: ${fixRlsError.message}`, colors.red);
      } else {
        log('✓ Verificación de políticas RLS completada', colors.green);
        log(fixRlsData, colors.dim);
      }
    } catch (error) {
      log(`✗ Error al ejecutar función de reparación: ${error.message}`, colors.red);
    }

    // 9. Cerrar sesión final
    log('\n9. Cerrando sesión final...', colors.yellow);

    try {
      const { error: finalSignOutError } = await supabase.auth.signOut();

      if (finalSignOutError) {
        throw new Error(`Error al cerrar sesión final: ${finalSignOutError.message}`);
      }

      log('✓ Sesión final cerrada correctamente', colors.green);
    } catch (error) {
      log(`✗ Error al cerrar sesión final: ${error.message}`, colors.red);
    }

    log('\n=== PRUEBA DE FLUJO DE AUTENTICACIÓN COMPLETADA ===\n', colors.bright + colors.green);
  } catch (error) {
    log(`\n✗ ERROR: ${error.message}\n`, colors.bright + colors.red);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Ejecutar la función principal
main();
