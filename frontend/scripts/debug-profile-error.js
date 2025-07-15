#!/usr/bin/env node

/**
 * Script de debugging para reproducir el error de perfil
 * Ejecutar con: node scripts/debug-profile-error.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function debugProfileError() {
  console.log('🐛 Iniciando debugging del error de perfil...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Variables de entorno faltantes')
    return
  }

  // Simular el ID de usuario de Clerk (formato típico)
  const testUserId = 'user_2abcdefghijklmnopqrstuvwxyz'

  console.log(`🔍 Probando getUserProfile con usuario inexistente: ${testUserId}`)

  // 1. Probar con cliente anónimo (como en la app)
  console.log('\n1️⃣ Probando con cliente anónimo...')
  try {
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data, error } = await supabaseAnon
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single()

    console.log('📊 Resultado de la consulta:')
    console.log('   data:', data)
    console.log('   error:', error)
    console.log('   error type:', typeof error)
    console.log('   error keys:', Object.keys(error || {}))
    console.log('   error string:', String(error))
    console.log('   error JSON:', JSON.stringify(error, null, 2))

    if (error) {
      console.log('\n🔍 Análisis detallado del error:')
      console.log('   error.code:', error?.code)
      console.log('   error.message:', error?.message)
      console.log('   error.details:', error?.details)
      console.log('   error.hint:', error?.hint)
      
      // Verificar si es el error esperado PGRST116
      if (error.code === 'PGRST116') {
        console.log('   ✅ Error PGRST116 detectado correctamente (usuario no encontrado)')
      } else {
        console.log('   ⚠️ Error diferente al esperado')
      }
    }

  } catch (error) {
    console.log(`   ❌ Error inesperado: ${error.message}`)
  }

  // 2. Probar con service role
  if (supabaseServiceKey) {
    console.log('\n2️⃣ Probando con service role...')
    try {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      const { data, error } = await supabaseService
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single()

      console.log('📊 Resultado con service role:')
      console.log('   data:', data)
      console.log('   error:', error)
      console.log('   error type:', typeof error)
      console.log('   error keys:', Object.keys(error || {}))

      if (error) {
        console.log('\n🔍 Análisis del error con service role:')
        console.log('   error.code:', error?.code)
        console.log('   error.message:', error?.message)
        
        if (error.code === 'PGRST116') {
          console.log('   ✅ Error PGRST116 detectado con service role')
        }
      }

    } catch (error) {
      console.log(`   ❌ Error inesperado con service role: ${error.message}`)
    }
  }

  // 3. Probar con un usuario que SÍ existe (si hay alguno)
  console.log('\n3️⃣ Verificando si hay usuarios existentes...')
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1)

    if (error) {
      console.log('   ❌ Error al buscar usuarios existentes:', error)
    } else if (data && data.length > 0) {
      console.log('   ✅ Usuario existente encontrado:', data[0].id)
      
      // Probar getUserProfile con usuario existente
      const { data: existingData, error: existingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data[0].id)
        .single()

      console.log('   📊 Resultado con usuario existente:')
      console.log('      data:', existingData ? 'Usuario encontrado' : 'No data')
      console.log('      error:', existingError)
    } else {
      console.log('   ℹ️ No hay usuarios en la base de datos')
    }

  } catch (error) {
    console.log(`   ❌ Error al verificar usuarios existentes: ${error.message}`)
  }

  console.log('\n🏁 Debugging completado.')
}

// Ejecutar el debugging
debugProfileError().catch(console.error)
