"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { isInOfflineMode, offlineData } from "@/lib/offline-mode"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      try {
        // Verificar si estamos en modo offline
        if (isInOfflineMode()) {
          console.log('Modo offline: usando datos de ejemplo para la sesión')
          // Simular un usuario en modo offline
          const offlineUser = {
            id: 'offline-user',
            email: 'offline@example.com',
            user_metadata: {
              name: 'Usuario Offline',
            },
            app_metadata: {
              role: 'customer',
            },
          } as User

          // Crear una sesión offline
          const offlineSession = {
            user: offlineUser,
            access_token: 'offline-token',
            refresh_token: 'offline-refresh-token',
            expires_at: Date.now() + 3600000, // 1 hora
          } as Session

          setSession(offlineSession)
          setUser(offlineUser)
          setIsLoading(false)
          return
        }

        // Modo online: obtener sesión real
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error al obtener la sesión inicial:", error)
          setIsLoading(false)
          return
        }

        setSession(data.session)
        setUser(data.session?.user ?? null)
      } catch (error) {
        console.error("Error al obtener la sesión inicial:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Configurar el listener para cambios en la autenticación (solo en modo online)
    let authListener = { subscription: { unsubscribe: () => {} } }

    if (!isInOfflineMode()) {
      authListener = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session)
          setUser(session?.user ?? null)
          setIsLoading(false)
        }
      ).data
    }

    // Escuchar cambios en el modo offline
    const handleOfflineModeChange = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail.isOffline) {
        // Cambiar a modo offline
        getInitialSession()
      } else {
        // Cambiar a modo online
        getInitialSession()
      }
    }

    window.addEventListener('offlinemodechange', handleOfflineModeChange)

    // Limpiar los listeners al desmontar
    return () => {
      authListener.subscription.unsubscribe()
      window.removeEventListener('offlinemodechange', handleOfflineModeChange)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // Verificar si estamos en modo offline
      if (isInOfflineMode()) {
        console.log('Modo offline: simulando inicio de sesión')

        // Simular un retraso para que parezca real
        await new Promise(resolve => setTimeout(resolve, 500))

        // Verificar credenciales de ejemplo (cualquier email con password "offline")
        if (password === 'offline') {
          // Simular un usuario en modo offline
          const offlineUser = {
            id: 'offline-user',
            email: email,
            user_metadata: {
              name: 'Usuario Offline',
            },
            app_metadata: {
              role: 'customer',
            },
          } as User

          // Crear una sesión offline
          const offlineSession = {
            user: offlineUser,
            access_token: 'offline-token',
            refresh_token: 'offline-refresh-token',
            expires_at: Date.now() + 3600000, // 1 hora
          } as Session

          setSession(offlineSession)
          setUser(offlineUser)

          return { error: null }
        } else {
          // Simular error de autenticación
          return {
            error: {
              message: 'En modo offline, usa cualquier email con la contraseña "offline"'
            }
          }
        }
      }

      // Modo online: autenticación real
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      // Verificar si estamos en modo offline
      if (isInOfflineMode()) {
        console.log('Modo offline: simulando registro de usuario')

        // Simular un retraso para que parezca real
        await new Promise(resolve => setTimeout(resolve, 800))

        // Simular un usuario registrado en modo offline
        const offlineUser = {
          id: 'offline-user-' + Date.now(),
          email: email,
          user_metadata: {
            name: 'Nuevo Usuario Offline',
          },
          app_metadata: {
            role: 'customer',
          },
          created_at: new Date().toISOString(),
        }

        return {
          data: { user: offlineUser, session: null },
          error: null
        }
      }

      // Modo online: registro real
      console.log('Iniciando registro con Supabase...')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error("Error de Supabase al registrarse:", error)
      } else {
        console.log('Registro con Supabase exitoso:', data)
      }

      return { data, error }
    } catch (error) {
      console.error("Error inesperado al registrarse:", error)
      // Crear un objeto de error con formato similar al de Supabase
      const customError = {
        message: error instanceof Error ? error.message : 'Error de conexión con el servidor',
        status: error instanceof Response ? error.status : 500
      }
      return { data: null, error: customError }
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Verificar si estamos en modo offline
      if (isInOfflineMode()) {
        console.log('Modo offline: simulando inicio de sesión con Google')

        // Simular un retraso para que parezca real
        await new Promise(resolve => setTimeout(resolve, 500))

        // Simular un usuario de Google en modo offline
        const offlineUser = {
          id: 'google-offline-user',
          email: 'google-user@example.com',
          user_metadata: {
            name: 'Usuario Google Offline',
            avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
          },
          app_metadata: {
            provider: 'google',
            role: 'customer',
          },
        } as User

        // Crear una sesión offline
        const offlineSession = {
          user: offlineUser,
          access_token: 'google-offline-token',
          refresh_token: 'google-offline-refresh-token',
          expires_at: Date.now() + 3600000, // 1 hora
        } as Session

        setSession(offlineSession)
        setUser(offlineUser)

        return { error: null }
      }

      // Modo online: autenticación real con Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { error }
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      // Verificar si estamos en modo offline
      if (isInOfflineMode()) {
        console.log('Modo offline: simulando cierre de sesión')

        // Simular un retraso para que parezca real
        await new Promise(resolve => setTimeout(resolve, 300))

        // Limpiar la sesión
        setSession(null)
        setUser(null)
        return
      }

      // Modo online: cierre de sesión real
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
