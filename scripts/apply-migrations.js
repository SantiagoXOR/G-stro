// Script para aplicar las migraciones a la base de datos Supabase

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Cargar configuración de Supabase desde el archivo de configuración
const config = require('./supabase-config');
const supabaseUrl = config.supabaseUrl;
const supabaseServiceKey = config.supabaseServiceKey;

// Verificar que tenemos la clave de servicio
if (!supabaseServiceKey) {
  console.error('Error: No se encontró la clave de servicio de Supabase');
  console.error('Asegúrate de configurar correctamente el archivo scripts/supabase-config.js');
  process.exit(1);
}

// Crear cliente de Supabase con la clave de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para aplicar una migración
async function applyMigration(filePath) {
  try {
    const fileName = path.basename(filePath);
    console.log(`Aplicando migración: ${fileName}`);

    // Leer el archivo SQL
    const sqlContent = fs.readFileSync(filePath, 'utf8');

    // Extraer y ejecutar cada sentencia SQL individualmente
    const statements = sqlContent.split(';').filter(stmt => stmt.trim() !== '');

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;

      // Ejecutar la sentencia SQL
      try {
        // Intentar ejecutar la sentencia SQL directamente
        const { data, error } = await supabase.rpc('pgexec', { sql: stmt + ';' });

        if (error) {
          console.error(`Error al ejecutar la sentencia #${i+1} en ${fileName}:`, error);
          console.error(`Sentencia: ${stmt.substring(0, 100)}...`);
          return false;
        }
      } catch (stmtErr) {
        console.error(`Error al ejecutar la sentencia #${i+1} en ${fileName}:`, stmtErr);
        console.error(`Sentencia: ${stmt.substring(0, 100)}...`);
        return false;
      }
    }

    console.log(`✅ Migración aplicada correctamente: ${fileName}`);
    return true;
  } catch (err) {
    console.error(`Error inesperado al aplicar la migración ${path.basename(filePath)}:`, err);
    return false;
  }
}

// Función principal para aplicar todas las migraciones
async function applyAllMigrations() {
  try {
    console.log('Aplicando migraciones a la base de datos...');

    // Obtener la lista de archivos de migración
    const migrationsDir = path.join(__dirname, '..', 'backend', 'supabase', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ordenar por nombre (que incluye la fecha)

    console.log(`Se encontraron ${migrationFiles.length} archivos de migración.`);

    // Aplicar cada migración en orden
    let successCount = 0;
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const success = await applyMigration(filePath);
      if (success) {
        successCount++;
      }
    }

    console.log(`\nResumen: ${successCount} de ${migrationFiles.length} migraciones aplicadas correctamente.`);

    if (successCount < migrationFiles.length) {
      console.log('\nAlgunas migraciones fallaron. Revisa los errores y vuelve a intentarlo.');
      process.exit(1);
    }

    console.log('\n¡Todas las migraciones se aplicaron correctamente!');

    // Recordatorio para verificar la seguridad
    console.log('\nRecordatorio: Verifica la configuración de seguridad ejecutando:');
    console.log('node scripts/check-supabase-security-simple.js');

  } catch (err) {
    console.error('Error inesperado:', err);
    process.exit(1);
  }
}

// Ejecutar la función principal
applyAllMigrations();
