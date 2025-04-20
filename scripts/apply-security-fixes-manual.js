// Script para generar instrucciones manuales para aplicar las correcciones de seguridad

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://myjqdrrqfdugzmuejypz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15anFkcnJxZmR1Z3ptdWVqeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzQ2NTMsImV4cCI6MjA0ODQxMDY1M30.xYKMe1AkPD3wxCMPR1yybGphQDvalQ62K92VVZtNerI';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateInstructions() {
  try {
    console.log('Generando instrucciones para aplicar correcciones de seguridad...');
    
    // Leer el archivo SQL con las correcciones
    const sqlFilePath = path.join(__dirname, '..', 'backend', 'supabase', 'migrations', '20240501000000_fix_security_issues.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('\n=== INSTRUCCIONES PARA APLICAR CORRECCIONES DE SEGURIDAD ===\n');
    
    console.log('1. Accede a la interfaz de Supabase: https://app.supabase.com');
    console.log('2. Selecciona tu proyecto');
    console.log('3. Ve a SQL Editor');
    console.log('4. Crea un nuevo script SQL');
    console.log('5. Copia y pega el siguiente código SQL:');
    console.log('\n----- INICIO DEL CÓDIGO SQL -----');
    console.log(sqlContent);
    console.log('----- FIN DEL CÓDIGO SQL -----\n');
    console.log('6. Ejecuta el script SQL');
    
    console.log('\nPara configurar los ajustes de autenticación:');
    console.log('1. Ve a Authentication > Settings > Security');
    console.log('2. Configura "OTP expiry time" a un valor recomendado (5-10 minutos)');
    console.log('3. Habilita "Enable leaked password protection"');
    console.log('4. Guarda los cambios');
    
    console.log('\nDespués de aplicar estas correcciones, verifica que los problemas se hayan resuelto en el Security Advisor.');
    
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

generateInstructions();
