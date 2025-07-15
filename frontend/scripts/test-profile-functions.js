#!/usr/bin/env node

/**
 * Script de prueba para las funciones de perfil
 * Ejecutar con: node scripts/test-profile-functions.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Simular un usuario de prueba
const TEST_USER = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Usuario de Prueba'
}

async function testProfileFunctions() {
  console.log('🧪 Iniciando pruebas de funciones de perfil...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Variables de entorno faltantes')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // 1. Probar getUserProfile con usuario inexistente
  console.log('1️⃣ Probando getUserProfile con usuario inexistente...')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', 'usuario-inexistente')
      .single()

    if (error && error.code === 'PGRST116') {
      console.log('   ✅ Manejo correcto de usuario inexistente')
    } else if (error) {
      console.log(`   ⚠️ Error inesperado: ${error.message}`)
    } else {
      console.log('   ⚠️ Se encontró un usuario que no debería existir')
    }
  } catch (error) {
    console.log(`   ❌ Error en la prueba: ${error.message}`)
  }

  // 2. Limpiar usuario de prueba si existe
  console.log('\n2️⃣ Limpiando usuario de prueba previo...')
  try {
    await supabase
      .from('profiles')
      .delete()
      .eq('id', TEST_USER.id)
    console.log('   ✅ Limpieza completada')
  } catch (error) {
    console.log(`   ⚠️ Error en limpieza: ${error.message}`)
  }

  // 3. Probar createUserProfile
  console.log('\n3️⃣ Probando createUserProfile...')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: TEST_USER.id,
        email: TEST_USER.email,
        name: TEST_USER.name,
        role: 'customer'
      }])
      .select()
      .single()

    if (error) {
      console.log(`   ❌ Error al crear perfil: ${error.message}`)
    } else {
      console.log('   ✅ Perfil creado exitosamente')
      console.log(`   📝 Datos: ${JSON.stringify(data, null, 2)}`)
    }
  } catch (error) {
    console.log(`   ❌ Error inesperado: ${error.message}`)
  }

  // 4. Probar getUserProfile con usuario existente
  console.log('\n4️⃣ Probando getUserProfile con usuario existente...')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', TEST_USER.id)
      .single()

    if (error) {
      console.log(`   ❌ Error al obtener perfil: ${error.message}`)
    } else {
      console.log('   ✅ Perfil obtenido exitosamente')
      console.log(`   📝 Email: ${data.email}`)
    }
  } catch (error) {
    console.log(`   ❌ Error inesperado: ${error.message}`)
  }

  // 5. Probar updateUserProfile
  console.log('\n5️⃣ Probando updateUserProfile...')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ name: 'Usuario Actualizado' })
      .eq('id', TEST_USER.id)
      .select()
      .single()

    if (error) {
      console.log(`   ❌ Error al actualizar perfil: ${error.message}`)
    } else {
      console.log('   ✅ Perfil actualizado exitosamente')
      console.log(`   📝 Nuevo nombre: ${data.name}`)
    }
  } catch (error) {
    console.log(`   ❌ Error inesperado: ${error.message}`)
  }

  // 6. Limpiar usuario de prueba
  console.log('\n6️⃣ Limpiando usuario de prueba...')
  try {
    await supabase
      .from('profiles')
      .delete()
      .eq('id', TEST_USER.id)
    console.log('   ✅ Usuario de prueba eliminado')
  } catch (error) {
    console.log(`   ❌ Error en limpieza final: ${error.message}`)
  }

  console.log('\n🏁 Pruebas de funciones de perfil completadas.')
}

// Ejecutar las pruebas
testProfileFunctions().catch(console.error)
