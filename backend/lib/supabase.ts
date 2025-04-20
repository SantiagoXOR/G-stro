import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../shared/types/database.types'

// Usar variables de entorno si están disponibles, de lo contrario usar valores predeterminados
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://myjqdrrqfdugzmuejypz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15anFkcnJxZmR1Z3ptdWVqeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzQ2NTMsImV4cCI6MjA0ODQxMDY1M30.xYKMe1AkPD3wxCMPR1yybGphQDvalQ62K92VVZtNerI'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Opciones de autenticación comunes para ambos clientes
const authOptions = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: 'pkce',
  debug: true // Habilitar logs detallados
}

// Create Supabase client for browser
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: authOptions,
  global: {
    fetch: (url, options) => {
      console.log('Supabase Request:', { url, options })
      return fetch(url, options).then(async (response) => {
        const responseClone = response.clone()
        try {
          const data = await responseClone.json()
          console.log('Supabase Response:', { url, status: response.status, data })
        } catch (e) {
          console.log('Supabase Response:', { url, status: response.status, body: 'No JSON body' })
        }
        return response
      })
    }
  }
})

// Create Supabase server client
export const createServerClient = (cookieString?: string) => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: authOptions,
    // Si se proporcionan cookies, configurar el almacenamiento para usar cookies
    ...(cookieString && {
      global: {
        headers: {
          cookie: cookieString
        }
      }
    })
  })
}
