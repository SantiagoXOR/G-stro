/**
 * Script de diagnóstico para problemas con perfiles de usuario
 * Verifica conectividad, políticas RLS, y estructura de la base de datos
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function diagnoseProfilesIssue() {
  console.log('🔍 DIAGNÓSTICO DE PROBLEMAS CON PERFILES DE USUARIO');
  console.log('=' .repeat(60));

  // 1. Verificar variables de entorno
  console.log('\n📋 1. VERIFICANDO VARIABLES DE ENTORNO:');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.log('   ❌ NEXT_PUBLIC_SUPABASE_URL no configurada');
    return;
  } else {
    console.log(`   ✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
  }

  if (!supabaseAnonKey) {
    console.log('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no configurada');
    return;
  } else {
    console.log(`   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 20)}...`);
  }

  if (!supabaseServiceKey) {
    console.log('   ⚠️ SUPABASE_SERVICE_ROLE_KEY no configurada (opcional para este test)');
  } else {
    console.log(`   ✅ SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey.substring(0, 20)}...`);
  }

  // 2. Probar conectividad básica
  console.log('\n🌐 2. PROBANDO CONECTIVIDAD:');
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test básico de conectividad
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('   ❌ Error de conectividad:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
    } else {
      console.log('   ✅ Conectividad exitosa');
      console.log(`   📊 Total de perfiles en la base de datos: ${data.length || 0}`);
    }
  } catch (error) {
    console.log('   ❌ Error de conexión:', error.message);
  }

  // 3. Verificar estructura de la tabla profiles
  console.log('\n🗄️ 3. VERIFICANDO ESTRUCTURA DE LA TABLA:');
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Intentar hacer una consulta simple para verificar la estructura
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, created_at, updated_at')
      .limit(1);
    
    if (error) {
      console.log('   ❌ Error al acceder a la tabla profiles:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      
      if (error.code === '42P01') {
        console.log('   💡 La tabla profiles no existe. Ejecutar migraciones.');
      } else if (error.code === '42703') {
        console.log('   💡 Algunas columnas no existen. Verificar migraciones.');
      }
    } else {
      console.log('   ✅ Estructura de tabla verificada');
      if (data && data.length > 0) {
        console.log('   📝 Ejemplo de perfil:', data[0]);
      }
    }
  } catch (error) {
    console.log('   ❌ Error verificando estructura:', error.message);
  }

  // 4. Verificar políticas RLS
  console.log('\n🔒 4. VERIFICANDO POLÍTICAS RLS:');
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Intentar insertar un perfil de prueba (debería fallar sin autenticación)
    const testUserId = 'test-user-' + Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer'
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '42501' || error.message.includes('RLS')) {
        console.log('   ✅ RLS está activo (esperado sin autenticación)');
      } else {
        console.log('   ⚠️ Error inesperado:', {
          code: error.code,
          message: error.message
        });
      }
    } else {
      console.log('   ⚠️ RLS podría no estar configurado correctamente (inserción exitosa sin auth)');
    }
  } catch (error) {
    console.log('   ❌ Error verificando RLS:', error.message);
  }

  // 5. Verificar con service role (si está disponible)
  if (supabaseServiceKey) {
    console.log('\n🔑 5. VERIFICANDO CON SERVICE ROLE:');
    try {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .limit(5);
      
      if (error) {
        console.log('   ❌ Error con service role:', {
          code: error.code,
          message: error.message
        });
      } else {
        console.log(`   ✅ Service role funciona. Perfiles encontrados: ${data.length}`);
        if (data.length > 0) {
          console.log('   📝 Perfiles de ejemplo:');
          data.forEach((profile, index) => {
            console.log(`      ${index + 1}. ${profile.email} (${profile.role})`);
          });
        }
      }
    } catch (error) {
      console.log('   ❌ Error con service role:', error.message);
    }
  }

  // 6. Recomendaciones
  console.log('\n💡 6. RECOMENDACIONES:');
  console.log('   1. Verificar que las migraciones de Supabase estén aplicadas');
  console.log('   2. Comprobar que las políticas RLS permitan operaciones autenticadas');
  console.log('   3. Verificar que el usuario esté correctamente autenticado con Clerk');
  console.log('   4. Revisar logs de Supabase en el dashboard para más detalles');
  console.log('   5. Considerar usar el webhook de Clerk para sincronizar usuarios');

  console.log('\n🔧 COMANDOS ÚTILES:');
  console.log('   - Aplicar migraciones: npx supabase db push');
  console.log('   - Ver logs: npx supabase logs');
  console.log('   - Reset DB: npx supabase db reset');

  console.log('\n' + '=' .repeat(60));
}

// Ejecutar diagnóstico
diagnoseProfilesIssue().catch(console.error);
