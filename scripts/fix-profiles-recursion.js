// Script para generar instrucciones para corregir el problema de recursión infinita en las políticas RLS
// Ejecuta este script y sigue las instrucciones para aplicar la corrección manualmente

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Cargar configuración de Supabase
let supabaseUrl, supabaseServiceKey;

try {
  // Intentar cargar desde archivo de configuración
  const configPath = path.join(__dirname, 'supabase-config.js');
  if (fs.existsSync(configPath)) {
    const config = require('./supabase-config.js');
    supabaseUrl = config.supabaseUrl;
    supabaseServiceKey = config.supabaseServiceKey;
  }
} catch (err) {
  console.error('Error al cargar configuración:', err);
}

// Si no se pudo cargar desde archivo, usar variables de entorno
supabaseUrl = supabaseUrl || process.env.SUPABASE_URL || 'https://myjqdrrqfdugzmuejypz.supabase.co';
supabaseServiceKey = supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar si tenemos la clave de servicio
if (!supabaseServiceKey) {
  console.log('\n===== INSTRUCCIONES PARA CORREGIR RECURSIÓN INFINITA EN POLÍTICAS RLS =====\n');
  console.log('No se encontró la clave de servicio de Supabase. Sigue estas instrucciones para aplicar la corrección manualmente:\n');
  
  // Leer el archivo SQL con la corrección
  const sqlFilePath = path.join(__dirname, '..', 'backend', 'supabase', 'migrations', '20240530000000_fix_profiles_recursion.sql');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  
  console.log('1. Inicia sesión en el panel de control de Supabase: https://supabase.com/dashboard');
  console.log('2. Selecciona tu proyecto');
  console.log('3. Ve a "SQL Editor" en el menú lateral');
  console.log('4. Crea una nueva consulta');
  console.log('5. Copia y pega el siguiente SQL:');
  console.log('\n' + '-'.repeat(80) + '\n');
  console.log(sqlContent);
  console.log('\n' + '-'.repeat(80) + '\n');
  console.log('6. Ejecuta la consulta');
  console.log('7. Verifica que la corrección se haya aplicado correctamente visitando la página de diagnóstico de autenticación en tu aplicación');
  
  process.exit(0);
}

// Si tenemos la clave de servicio, intentar aplicar la corrección automáticamente
console.log('Intentando aplicar la corrección automáticamente...');

// Crear cliente de Supabase con la clave de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyFix() {
  try {
    // Leer el archivo SQL con la corrección
    const sqlFilePath = path.join(__dirname, '..', 'backend', 'supabase', 'migrations', '20240530000000_fix_profiles_recursion.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Ejecutar el SQL
    const { data, error } = await supabase.rpc('pgexec', { sql: sqlContent });
    
    if (error) {
      console.error('Error al aplicar la corrección:', error);
      console.log('\nPor favor, sigue las instrucciones para aplicar la corrección manualmente:');
      
      console.log('1. Inicia sesión en el panel de control de Supabase: https://supabase.com/dashboard');
      console.log('2. Selecciona tu proyecto');
      console.log('3. Ve a "SQL Editor" en el menú lateral');
      console.log('4. Crea una nueva consulta');
      console.log('5. Copia y pega el SQL del archivo:');
      console.log(`   ${sqlFilePath}`);
      console.log('6. Ejecuta la consulta');
      
      process.exit(1);
    }
    
    console.log('Corrección aplicada exitosamente');
    console.log('Resultado:', data);
    
    // Verificar que la corrección funcionó
    const { data: testData, error: testError } = await supabase.rpc('test_profiles_recursion_simple');
    
    if (testError) {
      console.error('Error al verificar la corrección:', testError);
      process.exit(1);
    }
    
    console.log('\nVerificación de la corrección:');
    console.log(testData);
    
    process.exit(0);
  } catch (err) {
    console.error('Error inesperado:', err);
    process.exit(1);
  }
}

applyFix();
