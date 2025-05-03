// Script para verificar si el perfil se crea correctamente después de la autenticación
const { createClient } = require('@supabase/supabase-js');

// Obtener variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Faltan variables de entorno. Asegúrate de configurar:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Crear cliente de Supabase con la clave de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAuthProfile(userId) {
  try {
    console.log(`Verificando usuario con ID: ${userId}`);

    // Verificar si el usuario existe en auth.users
    const { data: authUser, error: authError } = await supabase.rpc('pgexec', {
      sql: `SELECT * FROM auth.users WHERE id = '${userId}'`
    });

    if (authError) {
      console.error('Error al consultar auth.users:', authError);
      return;
    }

    if (!authUser || authUser.length === 0) {
      console.error('El usuario no existe en auth.users');
      return;
    }

    console.log('Usuario encontrado en auth.users:');
    console.log('- Email:', authUser[0].email);
    console.log('- Metadata:', authUser[0].raw_user_meta_data);
    console.log('- Creado:', authUser[0].created_at);

    // Verificar si existe el perfil correspondiente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error al consultar el perfil:', profileError);
      
      // Crear el perfil manualmente si no existe
      if (profileError.code === 'PGRST116') {
        console.log('El perfil no existe. Creando perfil manualmente...');
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: authUser[0].email,
            name: authUser[0].raw_user_meta_data?.name || 
                  authUser[0].raw_user_meta_data?.full_name || 
                  authUser[0].email,
            role: 'customer'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error al crear el perfil:', createError);
        } else {
          console.log('Perfil creado exitosamente:', newProfile);
        }
      }
      return;
    }

    console.log('Perfil encontrado:');
    console.log(profile);

    // Verificar el trigger
    console.log('\nVerificando el trigger on_auth_user_created:');
    const { data: trigger, error: triggerError } = await supabase.rpc('pgexec', {
      sql: `
        SELECT * FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
      `
    });

    if (triggerError) {
      console.error('Error al consultar el trigger:', triggerError);
      return;
    }

    if (!trigger || trigger.length === 0) {
      console.error('El trigger on_auth_user_created no existe');
    } else {
      console.log('Trigger encontrado:');
      console.log('- Esquema:', trigger[0].trigger_schema);
      console.log('- Tabla:', trigger[0].event_object_table);
      console.log('- Acción:', trigger[0].action_statement);
    }

    // Verificar la función handle_new_user
    console.log('\nVerificando la función handle_new_user:');
    const { data: func, error: funcError } = await supabase.rpc('pgexec', {
      sql: `SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'handle_new_user'`
    });

    if (funcError) {
      console.error('Error al consultar la función:', funcError);
      return;
    }

    if (!func || func.length === 0) {
      console.error('La función handle_new_user no existe');
    } else {
      console.log('Función encontrada:');
      console.log(func[0].pg_get_functiondef);
    }

  } catch (error) {
    console.error('Error inesperado:', error);
  }
}

// Obtener el ID de usuario de los argumentos
const userId = process.argv[2];

if (!userId) {
  console.error('Error: Debes proporcionar un ID de usuario como argumento');
  console.error('Uso: node scripts/check-auth-profile.js <user-id>');
  process.exit(1);
}

checkAuthProfile(userId)
  .then(() => {
    console.log('Verificación completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error en la verificación:', error);
    process.exit(1);
  });
