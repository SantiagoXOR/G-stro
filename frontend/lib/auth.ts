/**
 * Servicios de autenticación
 * Proporciona una interfaz unificada para la autenticación
 */

import {
  getSupabaseClient,
  signInWithEmail,
  signUpWithEmail,
  signInWithOAuth,
  signOut,
  getCurrentSession,
  getCurrentUser,
  onAuthStateChange
} from './supabase-client'

// Re-exportar funciones de Supabase para mantener compatibilidad
export { signInWithEmail, signUpWithEmail, signOut }
export const signInWithGoogle = (redirectTo?: string) => signInWithOAuth('google', redirectTo)
export const getSession = getCurrentSession
export const getUser = getCurrentUser

/**
 * Hook para escuchar cambios en el estado de autenticación
 */
export function useAuthStateChange(callback: (event: string, session: any) => void) {
  return onAuthStateChange(callback)
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getCurrentSession()
    return !!session
  } catch (error) {
    console.error('Error verificando autenticación:', error)
    return false
  }
}

/**
 * Obtiene el perfil del usuario actual
 */
export async function getUserProfile() {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const client = await getSupabaseClient()
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error obteniendo perfil:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error al obtener perfil:', error)
    return null
  }
}

/**
 * Actualiza el perfil del usuario
 */
export async function updateUserProfile(updates: {
  full_name?: string
  avatar_url?: string
}) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Usuario no autenticado')

    const client = await getSupabaseClient()
    const { data, error } = await client
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error actualizando perfil:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    throw error
  }
}

/**
 * Cambia la contraseña del usuario
 */
export async function changePassword(newPassword: string) {
  try {
    const client = await getSupabaseClient()
    const { error } = await client.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Error cambiando contraseña:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    throw error
  }
}

/**
 * Envía un email de recuperación de contraseña
 */
export async function resetPassword(email: string) {
  try {
    const client = await getSupabaseClient()
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      console.error('Error enviando email de recuperación:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error al enviar email de recuperación:', error)
    throw error
  }
}

/**
 * Verifica el email del usuario
 */
export async function verifyEmail(token: string) {
  try {
    const client = await getSupabaseClient()
    const { error } = await client.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    })

    if (error) {
      console.error('Error verificando email:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error al verificar email:', error)
    throw error
  }
}

/**
 * Obtiene los roles del usuario
 */
export async function getUserRoles() {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    // Los roles pueden estar en los metadatos del usuario
    const roles = user.user_metadata?.roles || user.app_metadata?.roles || []
    return Array.isArray(roles) ? roles : [roles].filter(Boolean)
  } catch (error) {
    console.error('Error obteniendo roles:', error)
    return []
  }
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function hasRole(role: string): Promise<boolean> {
  try {
    const roles = await getUserRoles()
    return roles.includes(role)
  } catch (error) {
    console.error('Error verificando rol:', error)
    return false
  }
}

/**
 * Verifica si el usuario es administrador
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin')
}

/**
 * Verifica si el usuario es staff
 */
export async function isStaff(): Promise<boolean> {
  const roles = await getUserRoles()
  return roles.some(role => ['admin', 'staff', 'waiter', 'kitchen'].includes(role))
}
