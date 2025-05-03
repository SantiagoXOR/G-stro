import { signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// Mock de supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn()
    }
  }
}))

describe('Servicios de Autenticación', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signInWithEmail', () => {
    it('debería iniciar sesión correctamente con credenciales válidas', async () => {
      // Configurar el mock para simular un inicio de sesión exitoso
      const mockResponse = { data: { user: { id: 'test-id' } }, error: null }
      ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(mockResponse)

      // Llamar a la función
      const result = await signInWithEmail('test@example.com', 'password123')

      // Verificar que se llamó a la función correcta con los parámetros correctos
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })

      // Verificar que el resultado es el esperado
      expect(result).toEqual(mockResponse)
    })

    it('debería manejar errores de autenticación', async () => {
      // Configurar el mock para simular un error de autenticación
      const mockError = { message: 'Invalid credentials' }
      ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ data: null, error: mockError })

      // Llamar a la función
      const result = await signInWithEmail('test@example.com', 'wrong-password')

      // Verificar que se llamó a la función correcta
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled()

      // Verificar que el resultado contiene el error
      expect(result.error).toEqual(mockError)
    })

    it('debería manejar excepciones', async () => {
      // Configurar el mock para lanzar una excepción
      const mockException = new Error('Network error')
      ;(supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(mockException)

      // Espiar console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Llamar a la función
      const result = await signInWithEmail('test@example.com', 'password123')

      // Verificar que se registró el error
      expect(consoleSpy).toHaveBeenCalledWith('Error al iniciar sesión con email:', mockException)

      // Verificar que el resultado es el esperado
      expect(result).toEqual({ data: null, error: mockException })

      // Restaurar console.error
      consoleSpy.mockRestore()
    })
  })

  describe('signUpWithEmail', () => {
    it('debería registrar un nuevo usuario correctamente', async () => {
      // Configurar el mock para simular un registro exitoso
      const mockResponse = { 
        data: { 
          user: { 
            id: 'new-user-id',
            email: 'new@example.com'
          } 
        }, 
        error: null 
      }
      ;(supabase.auth.signUp as jest.Mock).mockResolvedValue(mockResponse)

      // Llamar a la función
      const result = await signUpWithEmail('new@example.com', 'password123', { name: 'New User' })

      // Verificar que se llamó a la función correcta con los parámetros correctos
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: { name: 'New User' }
        }
      })

      // Verificar que el resultado es el esperado
      expect(result).toEqual(mockResponse)
    })

    it('debería manejar errores de registro', async () => {
      // Configurar el mock para simular un error de registro
      const mockError = { message: 'Email already in use' }
      ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({ data: null, error: mockError })

      // Llamar a la función
      const result = await signUpWithEmail('existing@example.com', 'password123')

      // Verificar que se llamó a la función correcta
      expect(supabase.auth.signUp).toHaveBeenCalled()

      // Verificar que el resultado contiene el error
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signInWithGoogle', () => {
    it('debería iniciar el flujo de autenticación con Google', async () => {
      // Guardar window.location.origin original
      const originalWindowLocation = window.location

      // Mockear window.location
      delete window.location
      window.location = { origin: 'http://localhost:3000' } as any

      // Configurar el mock para simular un inicio de sesión con Google exitoso
      const mockResponse = { data: { url: 'https://accounts.google.com/o/oauth2/auth?...' }, error: null }
      ;(supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue(mockResponse)

      // Llamar a la función
      const result = await signInWithGoogle()

      // Verificar que se llamó a la función correcta con los parámetros correctos
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      // Verificar que el resultado es el esperado
      expect(result).toEqual(mockResponse)

      // Restaurar window.location
      window.location = originalWindowLocation
    })

    it('debería manejar errores en la autenticación con Google', async () => {
      // Guardar window.location.origin original
      const originalWindowLocation = window.location

      // Mockear window.location
      delete window.location
      window.location = { origin: 'http://localhost:3000' } as any

      // Configurar el mock para simular un error
      const mockError = { message: 'OAuth configuration error' }
      ;(supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({ data: null, error: mockError })

      // Llamar a la función
      const result = await signInWithGoogle()

      // Verificar que se llamó a la función correcta
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalled()

      // Verificar que el resultado contiene el error
      expect(result.error).toEqual(mockError)

      // Restaurar window.location
      window.location = originalWindowLocation
    })
  })

  describe('signOut', () => {
    it('debería cerrar sesión correctamente', async () => {
      // Configurar el mock para simular un cierre de sesión exitoso
      ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null })

      // Llamar a la función
      const result = await signOut()

      // Verificar que se llamó a la función correcta
      expect(supabase.auth.signOut).toHaveBeenCalled()

      // Verificar que el resultado es el esperado
      expect(result).toEqual({ error: null })
    })

    it('debería manejar errores al cerrar sesión', async () => {
      // Configurar el mock para simular un error
      const mockError = { message: 'Session not found' }
      ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: mockError })

      // Llamar a la función
      const result = await signOut()

      // Verificar que se llamó a la función correcta
      expect(supabase.auth.signOut).toHaveBeenCalled()

      // Verificar que el resultado contiene el error
      expect(result.error).toEqual(mockError)
    })
  })

  describe('getSession', () => {
    it('debería obtener la sesión actual correctamente', async () => {
      // Configurar el mock para simular una sesión activa
      const mockSession = { 
        data: { 
          session: { 
            user: { id: 'user-id', email: 'user@example.com' },
            expires_at: Date.now() + 3600000
          } 
        }, 
        error: null 
      }
      ;(supabase.auth.getSession as jest.Mock).mockResolvedValue(mockSession)

      // Llamar a la función
      const result = await getSession()

      // Verificar que se llamó a la función correcta
      expect(supabase.auth.getSession).toHaveBeenCalled()

      // Verificar que el resultado es el esperado
      expect(result).toEqual(mockSession)
    })

    it('debería manejar errores al obtener la sesión', async () => {
      // Configurar el mock para simular un error
      const mockError = { message: 'Failed to get session' }
      ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: null, error: mockError })

      // Llamar a la función
      const result = await getSession()

      // Verificar que se llamó a la función correcta
      expect(supabase.auth.getSession).toHaveBeenCalled()

      // Verificar que el resultado contiene el error
      expect(result.error).toEqual(mockError)
    })
  })
})
