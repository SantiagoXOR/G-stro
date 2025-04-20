// Script simplificado para verificar la configuración de seguridad de Supabase

const { createClient } = require('@supabase/supabase-js');

// Cargar configuración de Supabase desde el archivo de configuración
const config = require('./supabase-config');
const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.supabaseAnonKey;

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTablesAndPolicies() {
  console.log('\n--- Verificando tablas y políticas RLS ---');

  // Verificar tabla categories
  console.log('\nVerificando tabla categories:');
  try {
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (categoriesError) {
      if (categoriesError.code === 'PGRST301') {
        console.log('✅ La tabla categories tiene RLS habilitado');

        // Intentar seleccionar como usuario anónimo
        const { data: publicCategories, error: publicError } = await supabase
          .from('categories')
          .select('id')
          .limit(1);

        if (publicError) {
          console.log('❌ No hay política de lectura pública para categories');
        } else {
          console.log('✅ Existe una política de lectura pública para categories');
        }
      } else {
        console.log('❌ Error al verificar categories:', categoriesError.message);
      }
    } else {
      console.log('⚠️ La tabla categories existe pero podría no tener RLS habilitado o tiene una política que permite acceso público');
    }
  } catch (err) {
    console.log('❌ Error al verificar categories:', err.message);
  }

  // Verificar tabla products
  console.log('\nVerificando tabla products:');
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (productsError) {
      if (productsError.code === 'PGRST301') {
        console.log('✅ La tabla products tiene RLS habilitado');

        // Intentar seleccionar como usuario anónimo
        const { data: publicProducts, error: publicError } = await supabase
          .from('products')
          .select('id')
          .limit(1);

        if (publicError) {
          console.log('❌ No hay política de lectura pública para products');
        } else {
          console.log('✅ Existe una política de lectura pública para products');
        }
      } else {
        console.log('❌ Error al verificar products:', productsError.message);
      }
    } else {
      console.log('⚠️ La tabla products existe pero podría no tener RLS habilitado o tiene una política que permite acceso público');
    }
  } catch (err) {
    console.log('❌ Error al verificar products:', err.message);
  }
}

async function checkSecurityIssues() {
  try {
    console.log('Verificando configuración de seguridad de Supabase...');
    console.log(`URL: ${supabaseUrl}`);

    await checkTablesAndPolicies();

    console.log('\n--- Recordatorio de configuración manual ---');
    console.log('Para resolver los problemas de seguridad detectados por el Security Advisor:');
    console.log('\n1. Funciones sin search_path configurado:');
    console.log('   - Aplica la migración SQL en backend/supabase/migrations/20240501000000_fix_security_issues.sql');
    console.log('   - Puedes ejecutarla desde la interfaz de SQL Editor de Supabase');

    console.log('\n2. Configuración de autenticación:');
    console.log('   - Authentication > Settings > Security > OTP expiry time (recomendado: 5-10 minutos)');
    console.log('   - Authentication > Settings > Security > Enable leaked password protection (debe estar habilitado)');

    console.log('\nPara más detalles, consulta la guía en docs/guia-seguridad-supabase.md');

  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

checkSecurityIssues();
