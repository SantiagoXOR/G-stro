#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar la conectividad con Supabase
 * Ejecutar con: node scripts/test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testSupabaseConnection() {
  console.log('🔍 Iniciando diagnóstico de Supabase...\n')

  // 1. Verificar variables de entorno
  console.log('📋 Verificando variables de entorno:')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ Faltante'}`)
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurada' : '❌ Faltante'}`)
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Configurada' : '❌ Faltante'}`)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('\n❌ Variables de entorno faltantes. Verifica tu archivo .env.local')
    return
  }

  // 2. Probar conexión con clave anónima
  console.log('\n🔗 Probando conexión con clave anónima...')
  try {
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
    
    // Probar una consulta simple
    const { data, error } = await supabaseAnon
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      console.log(`   ❌ Error con clave anónima: ${error.message}`)
      console.log(`   Código: ${error.code}`)
    } else {
      console.log('   ✅ Conexión exitosa con clave anónima')
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`)
  }

  // 3. Probar conexión con service role (si está disponible)
  if (supabaseServiceKey) {
    console.log('\n🔑 Probando conexión con service role...')
    try {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      // Probar una consulta simple
      const { data, error } = await supabaseService
        .from('profiles')
        .select('count')
        .limit(1)

      if (error) {
        console.log(`   ❌ Error con service role: ${error.message}`)
        console.log(`   Código: ${error.code}`)
      } else {
        console.log('   ✅ Conexión exitosa con service role')
      }
    } catch (error) {
      console.log(`   ❌ Error de conexión: ${error.message}`)
    }
  }

  // 4. Verificar estructura de la tabla profiles
  console.log('\n📊 Verificando estructura de la tabla profiles...')
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (error) {
      console.log(`   ❌ Error al acceder a la tabla profiles: ${error.message}`)
      if (error.code === 'PGRST116') {
        console.log('   ℹ️ La tabla está vacía (esto es normal)')
      }
    } else {
      console.log('   ✅ Tabla profiles accesible')
      if (data && data.length > 0) {
        console.log('   📝 Estructura de ejemplo:', Object.keys(data[0]))
      }
    }
  } catch (error) {
    console.log(`   ❌ Error inesperado: ${error.message}`)
  }

  console.log('\n🏁 Diagnóstico completado.')
}

// Ejecutar el diagnóstico
testSupabaseConnection().catch(console.error)
