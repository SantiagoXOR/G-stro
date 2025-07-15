/**
 * Cliente de Supabase para el servidor (API routes)
 * Maneja la conexión con Supabase desde el lado del servidor
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseConfig, validateSupabaseEnv } from './env-validation'
import { Database } from './supabase-client'

// Cliente singleton para el servidor
let supabaseServerClient: SupabaseClient<Database> | null = null

/**
 * Obtiene el cliente de Supabase para el servidor
 * Utiliza la service role key para operaciones administrativas
 */
export function getSupabaseServerClient(): SupabaseClient<Database> {
  // Verificar si ya tenemos un cliente válido
  if (supabaseServerClient) {
    return supabaseServerClient
  }

  // Obtener configuración de forma segura
  const config = getSupabaseConfig()
  
  // Para el servidor, intentamos usar la service role key si está disponible
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const key = serviceRoleKey || config.anonKey

  // Crear el cliente con configuración para servidor
  supabaseServerClient = createClient<Database>(config.url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'gestro-server'
      }
    }
  })

  return supabaseServerClient
}

/**
 * Obtiene el cliente de Supabase con autenticación de usuario
 * Para usar en API routes que requieren autenticación
 */
export function getSupabaseServerClientWithAuth(accessToken: string): SupabaseClient<Database> {
  const config = getSupabaseConfig()
  
  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'gestro-server-auth',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  })
}

/**
 * Verifica si el servidor de Supabase está configurado correctamente
 */
export function isSupabaseServerConfigured(): boolean {
  const validation = validateSupabaseEnv()
  return validation.valid
}

/**
 * Obtiene la sesión del usuario desde el token de autorización
 */
export async function getServerSession(authHeader?: string) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    const client = getSupabaseServerClient()
    const { data: { user }, error } = await client.auth.getUser(token)
    
    if (error || !user) {
      console.error('Error obteniendo usuario del servidor:', error)
      return null
    }
    
    return { user }
  } catch (error) {
    console.error('Error al obtener sesión del servidor:', error)
    return null
  }
}

/**
 * Middleware para verificar autenticación en API routes
 */
export async function requireAuth(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const session = await getServerSession(authHeader)
  
  if (!session) {
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  return session
}

/**
 * Obtiene el perfil del usuario desde el servidor
 */
export async function getServerUserProfile(userId: string) {
  try {
    const client = getSupabaseServerClient()
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error obteniendo perfil del servidor:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error al obtener perfil del servidor:', error)
    return null
  }
}

/**
 * Crea o actualiza un perfil de usuario desde el servidor
 */
export async function upsertServerUserProfile(profile: {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: string
}) {
  try {
    const client = getSupabaseServerClient()
    const { data, error } = await client
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creando/actualizando perfil del servidor:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error al crear/actualizar perfil del servidor:', error)
    throw error
  }
}

/**
 * Verifica la conectividad con Supabase desde el servidor
 */
export async function testSupabaseServerConnection(): Promise<boolean> {
  try {
    const client = getSupabaseServerClient()
    const { error } = await client.from('profiles').select('count').limit(1)
    
    return !error
  } catch (error) {
    console.error('Error de conectividad del servidor con Supabase:', error)
    return false
  }
}

/**
 * Resetea el cliente del servidor (útil para testing)
 */
export function resetSupabaseServerClient() {
  supabaseServerClient = null
}

/**
 * Obtiene estadísticas del servidor
 */
export async function getServerStats() {
  try {
    const client = getSupabaseServerClient()
    
    const [
      { count: profilesCount },
      { count: ordersCount }
    ] = await Promise.all([
      client.from('profiles').select('*', { count: 'exact', head: true }),
      client.from('orders').select('*', { count: 'exact', head: true })
    ])

    return {
      profiles: profilesCount || 0,
      orders: ordersCount || 0
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas del servidor:', error)
    return {
      profiles: 0,
      orders: 0
    }
  }
}

/**
 * Ejecuta una consulta administrativa (requiere service role)
 */
export async function executeAdminQuery<T = any>(
  query: (client: SupabaseClient<Database>) => Promise<T>
): Promise<T> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error('Service role key no configurada para operaciones administrativas')
  }

  const config = getSupabaseConfig()
  const adminClient = createClient<Database>(config.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'gestro-admin'
      }
    }
  })

  return query(adminClient)
}

/**
 * Crea un cliente de Supabase para route handlers
 * Mantiene compatibilidad con importaciones existentes
 */
export function createRouteHandlerClient() {
  return getSupabaseServerClient()
}

/**
 * Crea un cliente de servidor de Supabase
 * Mantiene compatibilidad con importaciones existentes
 */
export function createServerClient() {
  return getSupabaseServerClient()
}
