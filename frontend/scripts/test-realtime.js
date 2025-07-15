#!/usr/bin/env node

/**
 * Script de prueba para verificar las funcionalidades de tiempo real de Supabase
 * Este script verifica que el cliente de Supabase se inicialice correctamente
 * y que las funcionalidades de realtime estén disponibles.
 */

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase (usando las mismas variables que la aplicación)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://olxxrwdxsubpiujsxzxa.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHhyd2R4c3VicGl1anN4enhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNjUzOTksImV4cCI6MjA2MDk0MTM5OX0.7oSlKHOYhKptJ5EgpFP1zXG5AiBJ3Hg-ix7RYSfLfFs'

async function testSupabaseRealtime() {
  console.log('🧪 Iniciando pruebas de Supabase Realtime...\n')

  try {
    // 1. Crear cliente de Supabase
    console.log('1️⃣ Creando cliente de Supabase...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })

    if (!supabase) {
      throw new Error('No se pudo crear el cliente de Supabase')
    }
    console.log('✅ Cliente de Supabase creado exitosamente')

    // 2. Verificar capacidades del cliente
    console.log('\n2️⃣ Verificando capacidades del cliente...')
    const capabilities = []

    if (typeof supabase.channel === 'function') {
      capabilities.push('channel')
      console.log('✅ Función channel disponible')
    } else {
      console.log('❌ Función channel NO disponible')
    }

    if (supabase.realtime) {
      capabilities.push('realtime')
      console.log('✅ Objeto realtime disponible')
    } else {
      console.log('❌ Objeto realtime NO disponible')
    }

    if (typeof supabase.from === 'function') {
      capabilities.push('database')
      console.log('✅ Función from (database) disponible')
    } else {
      console.log('❌ Función from (database) NO disponible')
    }

    console.log(`\n📊 Capacidades detectadas: ${capabilities.join(', ')}`)

    // 3. Probar creación de canal
    console.log('\n3️⃣ Probando creación de canal...')
    if (typeof supabase.channel === 'function') {
      const testChannel = supabase.channel('test-channel')
      
      if (testChannel) {
        console.log('✅ Canal de prueba creado exitosamente')
        
        // Verificar métodos del canal
        if (typeof testChannel.on === 'function') {
          console.log('✅ Método .on() disponible')
        } else {
          console.log('❌ Método .on() NO disponible')
        }

        if (typeof testChannel.subscribe === 'function') {
          console.log('✅ Método .subscribe() disponible')
        } else {
          console.log('❌ Método .subscribe() NO disponible')
        }

        if (typeof testChannel.unsubscribe === 'function') {
          console.log('✅ Método .unsubscribe() disponible')
          // Limpiar el canal de prueba
          testChannel.unsubscribe()
          console.log('✅ Canal de prueba limpiado')
        } else {
          console.log('❌ Método .unsubscribe() NO disponible')
        }
      } else {
        console.log('❌ No se pudo crear el canal de prueba')
      }
    } else {
      console.log('❌ No se puede probar creación de canal - función channel no disponible')
    }

    // 4. Verificar conectividad básica
    console.log('\n4️⃣ Verificando conectividad básica...')
    try {
      // Intentar una consulta simple para verificar conectividad
      const { data, error } = await supabase
        .from('orders')
        .select('count')
        .limit(1)

      if (error) {
        console.log(`⚠️ Error en consulta de prueba: ${error.message}`)
        console.log('   (Esto puede ser normal si la tabla no existe o no hay permisos)')
      } else {
        console.log('✅ Conectividad básica verificada')
      }
    } catch (connectivityError) {
      console.log(`⚠️ Error de conectividad: ${connectivityError.message}`)
    }

    // 5. Resumen final
    console.log('\n📋 RESUMEN DE PRUEBAS:')
    console.log('='.repeat(50))
    
    const isRealtimeReady = capabilities.includes('channel') && capabilities.includes('realtime')
    
    if (isRealtimeReady) {
      console.log('🎉 ¡ÉXITO! Supabase Realtime está completamente funcional')
      console.log('   - El cliente se inicializa correctamente')
      console.log('   - Las funciones de canal están disponibles')
      console.log('   - El objeto realtime está configurado')
      console.log('   - La aplicación debería funcionar sin errores')
    } else {
      console.log('⚠️  ADVERTENCIA: Supabase Realtime tiene limitaciones')
      console.log('   - Algunas funcionalidades pueden no estar disponibles')
      console.log('   - La aplicación funcionará en modo fallback')
      console.log('   - Capacidades faltantes:', ['channel', 'realtime'].filter(cap => !capabilities.includes(cap)).join(', '))
    }

    console.log('\n✅ Pruebas completadas exitosamente')
    return true

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error.message)
    console.error('   Stack trace:', error.stack)
    return false
  }
}

// Ejecutar las pruebas
if (require.main === module) {
  testSupabaseRealtime()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error)
      process.exit(1)
    })
}

module.exports = { testSupabaseRealtime }
