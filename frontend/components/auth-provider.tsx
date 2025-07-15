"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { isInOfflineMode } from "@/lib/offline-mode"
import { secureTokenService } from "@/lib/secure-token-service"

// Tipos para el usuario y la sesión
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
  expires_at: number
  // Token data is now handled securely through httpOnly cookies
  // and not exposed to client-side JavaScript
}

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Función para comprobar si una sesión ha expirado
  const checkSessionExpiration = useCallback(async () => {
    if (!session?.expires_at) return;

    const timeUntilExpiry = session.expires_at - Date.now();

    if (timeUntilExpiry <= 0) {
      // Si la sesión ha expirado completamente
      console.log('Sesión expirada, cerrando sesión...')
      await secureTokenService.clearTokens()
      setSession(null)
      setUser(null)
      localStorage.removeItem('auth_session')
      return true; // Indica que la sesión fue invalidada
    } else if (timeUntilExpiry <= 300000) { // 5 minutos antes de expirar
      // Intentar refrescar el token
      console.log('Refrescando tokens...')
      const { error } = await secureTokenService.refreshTokens()
      if (error) {
        console.error('Error al refrescar tokens:', error)
        return false;
      }
      return true; // Token refrescado exitosamente
    }
    return false; // No se necesitó acción
  }, [session?.expires_at])

  useEffect(() => {
    if (!session?.expires_at) return;

    // Calcular el tiempo hasta la próxima acción necesaria
    const timeUntilExpiry = session.expires_at - Date.now();
    const timeUntilRefresh = timeUntilExpiry - 300000; // 5 minutos antes
    const nextCheckTime = Math.min(
      Math.max(timeUntilRefresh, 0), // Tiempo hasta refresh
      Math.max(timeUntilExpiry, 0)   // Tiempo hasta expiración
    );

    // Configurar timer específico para la próxima acción necesaria
    const expirationTimer = setTimeout(async () => {
      const wasHandled = await checkSessionExpiration();
      if (wasHandled && session?.expires_at) {
        // Si se manejó la sesión, configurar el siguiente timer
        const nextSession = await secureTokenService.refreshTokens();
        if (!nextSession.error) {
          // El siguiente timer se configurará en el efecto cuando session se actualice
        }
      }
    }, nextCheckTime);

    // Limpiar el timer al desmontar o cuando cambie la sesión
    return () => clearTimeout(expirationTimer);
  }, [session?.expires_at, checkSessionExpiration]) // Agregar checkSessionExpiration como dependencia

  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      try {
        // Verificar si hay una sesión guardada en localStorage
        const savedSession = localStorage.getItem('auth_session')
        if (savedSession) {
          const parsedSession = JSON.parse(savedSession) as Session
          // Establecer la sesión y verificar expiración inmediatamente
          setSession(parsedSession)
          setUser(parsedSession.user)
          // checkSessionExpiration se ejecutará automáticamente debido al cambio en session
        }
      } catch (error) {
        console.error("Error al obtener la sesión inicial:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

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
      window.removeEventListener('offlinemodechange', handleOfflineModeChange)
    }
  }, [])

  // Guardar la sesión en localStorage cuando cambie
useEffect(() => {
  if (session) {
    localStorage.setItem('auth_session', JSON.stringify(session))
  } else {
    localStorage.removeItem('auth_session')
  }
}, [session])

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

          // En modo offline, solo guardamos la información no sensible
          const offlineSession = {
            user: offlineUser,
            expires_at: Date.now() + 3600000, // 1 hora
          }

          setSession(offlineSession)
          setUser(offlineUser)
          
          // En un entorno real, aquí manejaríamos los tokens de forma segura
          await secureTokenService.setTokens({
            accessToken: 'offline-token',
            refreshToken: 'offline-refresh-token'
          })

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

      // Modo online: simulación de autenticación
      console.log('Simulando inicio de sesión con:', email)
      
      // Simular un retraso para que parezca real
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Simular un usuario autenticado
      const mockUser: User = {
        id: 'user-' + Date.now(),
        email: email,
        user_metadata: {
          name: 'Usuario Simulado',
        },
        app_metadata: {
          role: 'customer',
        },
        created_at: new Date().toISOString(),
      }
      
      // Crear una sesión simulada
      const mockSession: Session = {
        user: mockUser,
        expires_at: Date.now() + 3600000, // 1 hora
      }

      // Manejar tokens de forma segura
      await secureTokenService.setTokens({
        accessToken: 'mock-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      })
      
      setSession(mockSession)
      setUser(mockUser)
      
      return { error: null }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
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
            name: name || 'Nuevo Usuario Offline',
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

      // Modo online: simulación de registro
      console.log('Simulando registro con:', email)

      // Simular un retraso para que parezca real
      await new Promise(resolve => setTimeout(resolve, 800))

      // Simular un usuario registrado
      const mockUser: User = {
        id: 'user-' + Date.now(),
        email: email,
        user_metadata: {
          name: name || 'Nuevo Usuario',
        },
        app_metadata: {
          role: 'customer',
        },
        created_at: new Date().toISOString(),
      }
      
      // Crear una sesión sin tokens sensibles
      const mockSession: Session = {
        user: mockUser,
        expires_at: Date.now() + 3600000, // 1 hora
      }
      
      // Manejar tokens de forma segura
      await secureTokenService.setTokens({
        accessToken: 'mock-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      })
      
      setSession(mockSession)
      setUser(mockUser)

      return { 
        data: { 
          user: mockUser, 
          session: mockSession 
        }, 
        error: null 
      }
    } catch (error) {
      console.error("Error inesperado al registrarse:", error)
      // Crear un objeto de error con formato similar al anterior
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
          expires_at: Date.now() + 3600000, // 1 hora
        } as Session

        // Manejar tokens de forma segura
        await secureTokenService.setTokens({
          accessToken: 'google-offline-token',
          refreshToken: 'google-offline-refresh-token'
        })

        setSession(offlineSession)
        setUser(offlineUser)

        return { error: null }
      }

      // Modo online: simulación de autenticación con Google
      console.log('Simulando inicio de sesión con Google')
      
      // Simular un retraso para que parezca real
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Simular un usuario de Google
      const mockUser: User = {
        id: 'google-user-' + Date.now(),
        email: 'google-user@example.com',
        user_metadata: {
          name: 'Usuario Google',
          avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
        },
        app_metadata: {
          provider: 'google',
          role: 'customer',
        },
      }
      
      // Crear una sesión sin tokens sensibles
      const mockSession: Session = {
        user: mockUser,
        expires_at: Date.now() + 3600000, // 1 hora
      }

      // Manejar los tokens de forma segura a través de httpOnly cookies
      await secureTokenService.setTokens({
        accessToken: 'google-mock-token-' + Date.now(),
        refreshToken: 'google-mock-refresh-token-' + Date.now()
      })
      
      setSession(mockSession)
      setUser(mockUser)
      
      // Redirigir a la página principal después de un breve retraso
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
      
      return { error: null }
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
        localStorage.removeItem('auth_session')
        return
      }

      // Modo online: simulación de cierre de sesión
      console.log('Simulando cierre de sesión')
      
      // Simular un retraso para que parezca real
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Limpiar la sesión y los tokens de forma segura
      await secureTokenService.clearTokens()
      setSession(null)
      setUser(null)
      localStorage.removeItem('auth_session')
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
