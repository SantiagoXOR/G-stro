"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/nextjs"
import { isInOfflineMode } from "@/lib/offline-mode"

// Tipos compatibles con el proveedor anterior
export type User = {
  id: string
  email?: string | null
  user_metadata?: {
    name?: string
    avatar_url?: string
    [key: string]: any
  }
  app_metadata?: {
    role?: string
    [key: string]: any
  }
  created_at?: string
}

export type Session = {
  user: User
  access_token: string
  refresh_token: string
  expires_at: number
}

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
}

const AuthCompatibilityContext = createContext<AuthContextType | undefined>(undefined)

export function ClerkCompatibilityProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerkAuth()
  const clerk = useClerk()

  // Convertir el usuario de Clerk al formato anterior
  useEffect(() => {
    if (clerkIsLoaded) {
      try {
        // Verificar si estamos en modo offline
        if (typeof window !== 'undefined' && isInOfflineMode()) {
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

        // Modo online: usar Clerk
        if (clerkUser) {
          const compatUser: User = {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            user_metadata: {
              name: clerkUser.fullName || clerkUser.firstName || 'Usuario',
              avatar_url: clerkUser.imageUrl,
            },
            app_metadata: {
              role: 'customer', // Por defecto, todos los usuarios son clientes
            },
            created_at: clerkUser.createdAt?.toString(),
          }

          const compatSession: Session = {
            user: compatUser,
            access_token: 'clerk-token', // Clerk maneja los tokens internamente
            refresh_token: 'clerk-refresh-token',
            expires_at: Date.now() + 3600000, // 1 hora (aproximado)
          }

          setUser(compatUser)
          setSession(compatSession)
        } else {
          setUser(null)
          setSession(null)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error al obtener la sesión inicial:", error)
        setIsLoading(false)
      }
    }
  }, [clerkUser, clerkIsLoaded])

  // Funciones de autenticación compatibles
  const signIn = async (email: string, password: string) => {
    try {
      // Verificar si estamos en modo offline
      if (typeof window !== 'undefined' && isInOfflineMode()) {
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

      // Modo online: usar Clerk
      if (!clerk) {
        return { error: { message: 'Clerk no está disponible' } }
      }

      setIsLoading(true)

      try {
        await clerk.signIn.create({
          identifier: email,
          password,
        })

        // La redirección la maneja Clerk automáticamente
        return { error: null }
      } catch (error: any) {
        console.error("Error al iniciar sesión con Clerk:", error)
        return {
          error: {
            message: error.errors?.[0]?.message || "Error al iniciar sesión"
          }
        }
      } finally {
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error inesperado al iniciar sesión:", error)
      return { error: { message: 'Error inesperado' } }
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

      // Modo online: usar Clerk
      setIsLoading(true)

      try {
        await clerk.signUp.create({
          emailAddress: email,
          password,
        })

        // La redirección la maneja Clerk automáticamente
        return {
          data: { user: null, session: null },
          error: null
        }
      } catch (error: any) {
        console.error("Error al registrarse con Clerk:", error)
        return {
          data: null,
          error: {
            message: error.errors?.[0]?.message || "Error al registrarse"
          }
        }
      } finally {
        setIsLoading(false)
      }
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

      // Modo online: usar Clerk
      setIsLoading(true)

      try {
        await clerk.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/auth/sso-callback',
          redirectUrlComplete: '/',
        })

        return { error: null }
      } catch (error: any) {
        console.error("Error al iniciar sesión con Google:", error)
        return {
          error: {
            message: error.errors?.[0]?.message || "Error al iniciar sesión con Google"
          }
        }
      } finally {
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error inesperado al iniciar sesión con Google:", error)
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

      // Modo online: usar Clerk
      await clerkSignOut()

      // Clerk maneja la redirección automáticamente
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

  return <AuthCompatibilityContext.Provider value={value}>{children}</AuthCompatibilityContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthCompatibilityContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un ClerkCompatibilityProvider")
  }
  return context
}
