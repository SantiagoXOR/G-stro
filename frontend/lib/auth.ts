import { supabase } from './supabase'

/**
 * Inicia sesión con email y contraseña
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    console.error('Error al iniciar sesión con email:', error)
    return { data: null, error }
  }
}

/**
 * Inicia sesión con Google
 * Esta función redirige al usuario a la página de autenticación de Google
 */
export async function signInWithGoogle() {
  try {
    // Guardar la URL actual para redirigir después de la autenticación
    const currentUrl = window.location.origin

    // Iniciar el flujo de autenticación con Google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${currentUrl}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    return { data, error }
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error)
    return { data: null, error }
  }
}

/**
 * Registra un nuevo usuario con email y contraseña
 */
export async function signUpWithEmail(email: string, password: string, metadata?: any) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    return { data, error }
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    return { data: null, error }
  }
}

/**
 * Cierra la sesión del usuario actual
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    return { error }
  }
}

/**
 * Obtiene la sesión actual del usuario
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  } catch (error) {
    console.error('Error al obtener sesión:', error)
    return { data: null, error }
  }
}


