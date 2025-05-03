import { createClient } from '@supabase/supabase-js'
import { createServerClient as createServerClientSSR } from '@supabase/ssr'
import type { Database } from '../../shared/types/database.types'
import { cookies } from 'next/headers'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigValid } from './supabase-config'

// Verificar que la configuración sea válida
const configCheck = isConfigValid()
if (!configCheck.valid) {
  console.error(`Faltan variables de entorno de Supabase: ${configCheck.missingVars.join(', ')}`)
}

// Create Supabase server client for server components
export const createServerClient = (cookieStore?: ReturnType<typeof cookies>) => {
  return createServerClientSSR<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      async get(name: string) {
        const cookie = await cookieStore?.get(name)
        return cookie?.value
      },
      async set(name: string, value: string, options: any) {
        await cookieStore?.set(name, value, options)
      },
      async remove(name: string, options: any) {
        await cookieStore?.set(name, '', { ...options, maxAge: 0 })
      },
    },
  })
}

// Create Supabase client for API routes
export const createRouteHandlerClient = () => {
  const cookieStore = cookies()
  return createServerClientSSR<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      async get(name: string) {
        const cookie = await cookieStore.get(name)
        return cookie?.value
      },
      async set(name: string, value: string, options: any) {
        await cookieStore.set(name, value, options)
      },
      async remove(name: string, options: any) {
        await cookieStore.set(name, '', { ...options, maxAge: 0 })
      },
    },
  })
}
