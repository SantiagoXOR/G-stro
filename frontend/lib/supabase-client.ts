/**
 * Cliente de Supabase para el frontend
 * Maneja la conexión con Supabase de forma segura y robusta
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseConfig, validateSupabaseEnv } from './env-validation'
import type { Database } from '../../shared/types/database.types'

// Cliente singleton
let supabaseClient: SupabaseClient<Database> | null = null

/**
 * Obtiene el cliente de Supabase de forma segura
 * Crea una nueva instancia si no existe o si la configuración ha cambiado
 */
export async function getSupabaseClient(): Promise<SupabaseClient<Database> | null> {
  try {
    // Verificar si ya tenemos un cliente válido
    if (supabaseClient) {
      return supabaseClient
    }

    // Obtener configuración de forma segura
    const config = getSupabaseConfig()

    if (!config.url || !config.anonKey) {
      console.error('❌ Configuración de Supabase incompleta:', {
        hasUrl: !!config.url,
        hasAnonKey: !!config.anonKey
      })
      return null
    }

    // Crear el cliente con configuración robusta
    supabaseClient = createClient<Database>(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'gestro-frontend'
        }
      }
    })

    console.log('✅ Cliente de Supabase creado exitosamente')
    return supabaseClient
  } catch (error) {
    console.error('❌ Error al crear cliente de Supabase:', error)
    return null
  }
}

/**
 * Verifica si el cliente de Supabase está configurado correctamente
 */
export function isSupabaseConfigured(): boolean {
  const validation = validateSupabaseEnv()
  return validation.valid
}

/**
 * Obtiene la sesión actual del usuario
 */
export async function getCurrentSession() {
  try {
    const client = await getSupabaseClient()
    const { data: { session }, error } = await client.auth.getSession()
    
    if (error) {
      console.error('Error obteniendo sesión:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error al obtener sesión:', error)
    return null
  }
}

/**
 * Obtiene el usuario actual
 */
export async function getCurrentUser() {
  try {
    const client = await getSupabaseClient()
    const { data: { user }, error } = await client.auth.getUser()
    
    if (error) {
      console.error('Error obteniendo usuario:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return null
  }
}

/**
 * Inicia sesión con email y contraseña
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const client = await getSupabaseClient()
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    })
    
    return { data, error }
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    return { data: null, error }
  }
}

/**
 * Registra un nuevo usuario
 */
export async function signUpWithEmail(email: string, password: string, metadata?: any) {
  try {
    const client = await getSupabaseClient()
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    return { data, error }
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    return { data: null, error }
  }
}

/**
 * Inicia el flujo de OAuth con un proveedor
 */
export async function signInWithOAuth(provider: 'google' | 'github' | 'facebook', redirectTo?: string) {
  try {
    const client = await getSupabaseClient()
    const { data, error } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`
      }
    })
    
    return { data, error }
  } catch (error) {
    console.error(`Error al iniciar sesión con ${provider}:`, error)
    return { data: null, error }
  }
}

/**
 * Cierra la sesión del usuario
 */
export async function signOut() {
  try {
    const client = await getSupabaseClient()
    const { error } = await client.auth.signOut()
    
    if (error) {
      console.error('Error al cerrar sesión:', error)
    }
    
    return { error }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    return { error }
  }
}

/**
 * Escucha cambios en el estado de autenticación
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return getSupabaseClient().then(client => {
    return client.auth.onAuthStateChange(callback)
  })
}

/**
 * Resetea el cliente (útil para testing o cambios de configuración)
 */
export function resetSupabaseClient() {
  supabaseClient = null
}

/**
 * Verifica la conectividad con Supabase
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const client = await getSupabaseClient()
    const { error } = await client.from('profiles').select('count').limit(1)
    
    return !error
  } catch (error) {
    console.error('Error de conectividad con Supabase:', error)
    return false
  }
}
