#!/usr/bin/env node

/**
 * Script final para verificar que Supabase Realtime funciona correctamente
 * Este script simula exactamente lo que hace el push-notification-service
 */

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase (misma que usa la aplicación)
const supabaseUrl = 'https://olxxrwdxsubpiujsxzxa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHhyd2R4c3VicGl1anN4enhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNjUzOTksImV4cCI6MjA2MDk0MTM5OX0.7oSlKHOYhKptJ5EgpFP1zXG5AiBJ3Hg-ix7RYSfLfFs'

console.log('🔍 Verificación Final de Supabase Realtime\n')

async function testSupabaseRealtime() {
  try {
    console.log('1️⃣ Creando cliente de Supabase...')
    
    // Crear cliente con la misma configuración que usa la aplicación
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
      },
      global: {
        headers: {
          'X-Client-Info': 'gestro-frontend@1.0.0'
        }
      },
      db: {
        schema: 'public'
      }
    })

    if (!supabase) {
      throw new Error('❌ No se pudo crear el cliente de Supabase')
    }
    console.log('✅ Cliente de Supabase creado exitosamente')

    console.log('\n2️⃣ Verificando capacidades del cliente...')
    
    // Verificar que el cliente tenga las funciones necesarias
    const capabilities = []
    
    if (typeof supabase.channel === 'function') {
      capabilities.push('channel')
      console.log('✅ Función channel disponible')
    } else {
      console.log('❌ Función channel NO disponible')
      console.log('❌ Tipo de supabase.channel:', typeof supabase.channel)
      return false
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

    console.log('\n3️⃣ Probando creación de canal (simulando push-notification-service)...')
    
    // Simular exactamente lo que hace el push-notification-service
    const testChannel = supabase.channel('test-notifications-final')
    
    if (!testChannel) {
      throw new Error('❌ No se pudo crear el canal')
    }
    console.log('✅ Canal creado exitosamente')

    // Verificar que el canal tenga las funciones necesarias
    if (typeof testChannel.on === 'function') {
      console.log('✅ Función channel.on disponible')
    } else {
      console.log('❌ Función channel.on NO disponible')
      return false
    }

    if (typeof testChannel.subscribe === 'function') {
      console.log('✅ Función channel.subscribe disponible')
    } else {
      console.log('❌ Función channel.subscribe NO disponible')
      return false
    }

    if (typeof testChannel.unsubscribe === 'function') {
      console.log('✅ Función channel.unsubscribe disponible')
    } else {
      console.log('❌ Función channel.unsubscribe NO disponible')
      return false
    }

    console.log('\n4️⃣ Probando configuración de listener (simulando notificaciones de pedidos)...')
    
    // Configurar un listener como lo hace el push-notification-service
    const channelWithListener = supabase
      .channel('test-orders-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('📨 Evento de prueba recibido:', payload)
        }
      )

    console.log('✅ Listener configurado exitosamente')

    console.log('\n5️⃣ Probando suscripción...')
    
    // Intentar suscribirse
    channelWithListener.subscribe((status) => {
      console.log(`📡 Estado de suscripción: ${status}`)
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Suscripción exitosa')
        
        // Limpiar después de un momento
        setTimeout(() => {
          channelWithListener.unsubscribe()
          testChannel.unsubscribe()
          console.log('🧹 Canales limpiados')
          console.log('\n🎉 TODAS LAS PRUEBAS PASARON - Supabase Realtime funciona correctamente')
          process.exit(0)
        }, 2000)
      } else if (status === 'CHANNEL_ERROR') {
        console.log('❌ Error en la suscripción')
        process.exit(1)
      }
    })

    // Timeout de seguridad
    setTimeout(() => {
      console.log('⏰ Timeout alcanzado - finalizando prueba')
      process.exit(0)
    }, 10000)

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
    console.error('❌ Stack trace:', error.stack)
    return false
  }
}

// Ejecutar la prueba
testSupabaseRealtime().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
