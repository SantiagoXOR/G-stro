/**
 * Re-exportación del cliente de Supabase
 * Este archivo mantiene compatibilidad con importaciones existentes
 */

export { 
  getSupabaseClient,
  getCurrentSession,
  getCurrentUser,
  signInWithEmail,
  signUpWithEmail,
  signInWithOAuth,
  signOut,
  onAuthStateChange,
  isSupabaseConfigured,
  testSupabaseConnection,
  resetSupabaseClient,
  type Database
} from './supabase-client'

// Exportar el cliente por defecto para compatibilidad
export async function getSupabase() {
  const { getSupabaseClient } = await import('./supabase-client')
  return await getSupabaseClient()
}

// Alias para compatibilidad - función que retorna una promesa
export function getSupabaseInstance() {
  return getSupabase()
}
