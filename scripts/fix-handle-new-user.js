// Script para aplicar la corrección a la función handle_new_user
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://myjqdrrqfdugzmuejypz.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15anFkcnJxZmR1Z3ptdWVqeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzQ2NTMsImV4cCI6MjA0ODQxMDY1M30.xYKMe1AkPD3wxCMPR1yybGphQDvalQ62K92VVZtNerI';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, anonKey);

// Función para verificar si la tabla profiles existe
async function checkProfilesTable() {
  try {
    console.log('Verificando si la tabla profiles existe...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error al consultar la tabla profiles:', error);
      return false;
    }
    
    console.log('La tabla profiles existe');
    return true;
  } catch (err) {
    console.error('Error inesperado al verificar la tabla profiles:', err);
    return false;
  }
}

// Función para verificar la estructura de la tabla profiles
async function checkProfilesStructure() {
  try {
    console.log('Verificando la estructura de la tabla profiles...');
    
    // Verificar si la tabla tiene las columnas necesarias
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role')
      .limit(1);
    
    if (error) {
      console.error('Error al verificar la estructura de la tabla profiles:', error);
      return false;
    }
    
    console.log('La tabla profiles tiene la estructura correcta');
    return true;
  } catch (err) {
    console.error('Error inesperado al verificar la estructura de la tabla profiles:', err);
    return false;
  }
}

// Función principal
async function main() {
  try {
    // Verificar si la tabla profiles existe
    const profilesExist = await checkProfilesTable();
    if (!profilesExist) {
      console.error('La tabla profiles no existe. Por favor, ejecuta las migraciones de la base de datos.');
      return;
    }
    
    // Verificar la estructura de la tabla profiles
    const profilesStructureOk = await checkProfilesStructure();
    if (!profilesStructureOk) {
      console.error('La estructura de la tabla profiles no es correcta. Por favor, verifica las migraciones de la base de datos.');
      return;
    }
    
    console.log('Todo parece estar correcto con la tabla profiles.');
    console.log('Para resolver el problema de autenticación con Google, sigue estos pasos:');
    console.log('1. Accede al panel de control de Supabase: https://app.supabase.com');
    console.log('2. Ve a Authentication > Providers');
    console.log('3. Habilita el proveedor "Google"');
    console.log('4. Configura el ID de cliente y el secreto de cliente de Google');
    console.log('5. Agrega las URLs de redirección autorizadas:');
    console.log('   - https://myjqdrrqfdugzmuejypz.supabase.co/auth/v1/callback');
    console.log('   - http://localhost:3000/auth/callback');
    console.log('6. Guarda la configuración');
    console.log('7. Reinicia el servidor de desarrollo');
    
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

main();
