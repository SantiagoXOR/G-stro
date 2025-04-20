// Script para aplicar las correcciones de seguridad a la base de datos Supabase

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://myjqdrrqfdugzmuejypz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesitamos la clave de servicio para ejecutar SQL

// Verificar que tenemos la clave de servicio
if (!supabaseServiceKey) {
  console.error('Error: Se requiere la variable de entorno SUPABASE_SERVICE_ROLE_KEY');
  console.error('Esta clave se puede obtener en la sección de configuración del proyecto en Supabase');
  process.exit(1);
}

// Crear cliente de Supabase con la clave de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySecurityFixes() {
  try {
    console.log('Aplicando correcciones de seguridad a la base de datos...');
    
    // Leer el archivo SQL con las correcciones
    const sqlFilePath = path.join(__dirname, '..', 'backend', 'supabase', 'migrations', '20240501000000_fix_security_issues.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Ejecutar el SQL
    const { error } = await supabase.rpc('pgexec', { sql: sqlContent });
    
    if (error) {
      console.error('Error al aplicar las correcciones:', error);
      process.exit(1);
    }
    
    console.log('Correcciones aplicadas correctamente');
    
    // Verificar configuración de autenticación
    console.log('\nRecordatorio: Para completar todas las correcciones de seguridad:');
    console.log('1. Accede a la interfaz de Supabase: https://app.supabase.com');
    console.log('2. Ve a Authentication > Settings > Security');
    console.log('3. Configura "OTP expiry time" a un valor recomendado (5-10 minutos)');
    console.log('4. Habilita "Enable leaked password protection"');
    console.log('\nEstas configuraciones no se pueden cambiar mediante SQL y deben hacerse manualmente.');
    
  } catch (err) {
    console.error('Error inesperado:', err);
    process.exit(1);
  }
}

applySecurityFixes();
