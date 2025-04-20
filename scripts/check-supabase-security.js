// Script para verificar la configuración de seguridad de Supabase

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://myjqdrrqfdugzmuejypz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar que tenemos la clave de servicio
if (!supabaseServiceKey) {
  console.error('Error: Se requiere la variable de entorno SUPABASE_SERVICE_ROLE_KEY');
  console.error('Esta clave se puede obtener en la sección de configuración del proyecto en Supabase');
  process.exit(1);
}

// Crear cliente de Supabase con la clave de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFunctionSearchPath() {
  console.log('\n--- Verificando funciones sin search_path configurado ---');
  
  const { data, error } = await supabase.rpc('pgexec', { 
    sql: `
      SELECT 
        n.nspname as schema_name,
        p.proname as function_name,
        pg_get_functiondef(p.oid) as function_def
      FROM 
        pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE 
        n.nspname = 'public'
        AND p.prosecdef = true
        AND p.proname IN ('handle_new_user', 'update_updated_at_column', 'make_user_admin', 'reorder_category')
        AND pg_get_functiondef(p.oid) NOT ILIKE '%SET search_path%'
    `
  });
  
  if (error) {
    console.error('Error al verificar funciones:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Se encontraron las siguientes funciones sin search_path configurado:');
    data.forEach(func => {
      console.log(`- ${func.schema_name}.${func.function_name}`);
    });
  } else {
    console.log('✅ Todas las funciones tienen search_path configurado correctamente');
  }
}

async function checkRLSPolicies() {
  console.log('\n--- Verificando políticas RLS ---');
  
  const { data, error } = await supabase.rpc('pgexec', { 
    sql: `
      SELECT 
        tablename,
        rowsecurity
      FROM 
        pg_tables
      WHERE 
        schemaname = 'public'
        AND tablename IN ('categories', 'products')
    `
  });
  
  if (error) {
    console.error('Error al verificar RLS:', error);
    return;
  }
  
  if (data) {
    for (const table of data) {
      if (!table.rowsecurity) {
        console.log(`⚠️ La tabla ${table.tablename} no tiene RLS habilitado`);
      } else {
        // Verificar si hay políticas para esta tabla
        const { data: policies, error: policiesError } = await supabase.rpc('pgexec', { 
          sql: `
            SELECT 
              policyname
            FROM 
              pg_policies
            WHERE 
              schemaname = 'public'
              AND tablename = '${table.tablename}'
          `
        });
        
        if (policiesError) {
          console.error(`Error al verificar políticas para ${table.tablename}:`, policiesError);
          continue;
        }
        
        if (!policies || policies.length === 0) {
          console.log(`⚠️ La tabla ${table.tablename} tiene RLS habilitado pero no tiene políticas`);
        } else {
          console.log(`✅ La tabla ${table.tablename} tiene RLS habilitado con ${policies.length} políticas`);
          policies.forEach(policy => {
            console.log(`  - ${policy.policyname}`);
          });
        }
      }
    }
  }
}

async function checkSecurityIssues() {
  try {
    console.log('Verificando configuración de seguridad de Supabase...');
    console.log(`URL: ${supabaseUrl}`);
    
    await checkFunctionSearchPath();
    await checkRLSPolicies();
    
    console.log('\n--- Recordatorio de configuración manual ---');
    console.log('Los siguientes ajustes deben configurarse manualmente en la interfaz de Supabase:');
    console.log('1. Authentication > Settings > Security > OTP expiry time (recomendado: 5-10 minutos)');
    console.log('2. Authentication > Settings > Security > Enable leaked password protection (debe estar habilitado)');
    
    console.log('\nPara aplicar las correcciones automáticas, ejecuta:');
    console.log('node scripts/apply-security-fixes.js');
    
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

checkSecurityIssues();
