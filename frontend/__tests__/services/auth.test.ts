// Mock de supabase-client con funciones inline
jest.mock('@/lib/supabase-client', () => ({
  getSupabaseClient: jest.fn(() => Promise.resolve({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn()
    }
  })),
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  signInWithOAuth: jest.fn(),
  signOut: jest.fn(),
  getCurrentSession: jest.fn(),
  getCurrentUser: jest.fn(),
}))

// Importar las funciones después del mock
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, getSession } from '@/lib/auth'
import * as supabaseClient from '@/lib/supabase-client'

// Obtener referencias a los mocks
const mockSignInWithEmail = supabaseClient.signInWithEmail as jest.MockedFunction<typeof supabaseClient.signInWithEmail>
const mockSignUpWithEmail = supabaseClient.signUpWithEmail as jest.MockedFunction<typeof supabaseClient.signUpWithEmail>
const mockSignInWithOAuth = supabaseClient.signInWithOAuth as jest.MockedFunction<typeof supabaseClient.signInWithOAuth>
const mockSignOut = supabaseClient.signOut as jest.MockedFunction<typeof supabaseClient.signOut>
const mockGetCurrentSession = supabaseClient.getCurrentSession as jest.MockedFunction<typeof supabaseClient.getCurrentSession>
const mockGetCurrentUser = supabaseClient.getCurrentUser as jest.MockedFunction<typeof supabaseClient.getCurrentUser>

describe('Servicios de Autenticación', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock implementations
    mockSignInWithEmail.mockReset()
    mockSignUpWithEmail.mockReset()
    mockSignInWithOAuth.mockReset()
    mockSignOut.mockReset()
    mockGetCurrentSession.mockReset()
    mockGetCurrentUser.mockReset()
  })

  describe('signInWithEmail', () => {
    it('debería iniciar sesión correctamente con credenciales válidas', async () => {
      // Configurar el mock para simular un inicio de sesión exitoso
      const mockResponse = { data: { user: { id: 'test-id' } }, error: null }
      mockSignInWithEmail.mockResolvedValue(mockResponse)

      // Llamar a la función
      const result = await signInWithEmail('test@example.com', 'password123')

      // Verificar que se llamó a la función correcta con los parámetros correctos
      expect(mockSignInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123')

      // Verificar que el resultado es el esperado
      expect(result).toEqual(mockResponse)
    })

    it('debería manejar errores de autenticación', async () => {
      // Configurar el mock para simular un error de autenticación
      const mockError = { message: 'Invalid credentials' }
      mockSignInWithEmail.mockResolvedValue({ data: null, error: mockError })

      // Llamar a la función
      const result = await signInWithEmail('test@example.com', 'wrong-password')

      // Verificar que se llamó a la función correcta
      expect(mockSignInWithEmail).toHaveBeenCalledWith('test@example.com', 'wrong-password')

      // Verificar que el resultado contiene el error
      expect(result.error).toEqual(mockError)
    })

    it('debería manejar excepciones', async () => {
      // Configurar el mock para lanzar una excepción
      const mockException = new Error('Network error')
      mockSignInWithEmail.mockRejectedValue(mockException)

      // Llamar a la función y esperar que lance una excepción
      await expect(signInWithEmail('test@example.com', 'password123')).rejects.toEqual(mockException)

      // Verificar que se llamó a la función correcta
      expect(mockSignInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123')
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
      mockSignUpWithEmail.mockResolvedValue(mockResponse)

      // Llamar a la función
      const result = await signUpWithEmail('new@example.com', 'password123', { name: 'New User' })

      // Verificar que se llamó a la función correcta con los parámetros correctos
      expect(mockSignUpWithEmail).toHaveBeenCalledWith('new@example.com', 'password123', { name: 'New User' })

      // Verificar que el resultado es el esperado
      expect(result).toEqual(mockResponse)
    })

    it('debería manejar errores de registro', async () => {
      // Configurar el mock para simular un error de registro
      const mockError = { message: 'Email already in use' }
      mockSignUpWithEmail.mockResolvedValue({ data: null, error: mockError })

      // Llamar a la función
      const result = await signUpWithEmail('existing@example.com', 'password123')

      // Verificar que se llamó a la función correcta
      expect(mockSignUpWithEmail).toHaveBeenCalledWith('existing@example.com', 'password123')

      // Verificar que el resultado contiene el error
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signInWithGoogle', () => {
    it('debería iniciar el flujo de autenticación con Google', async () => {
      // Configurar el mock para simular un inicio de sesión con Google exitoso
      const mockResponse = { data: { url: 'https://accounts.google.com/o/oauth2/auth?...' }, error: null }
      mockSignInWithOAuth.mockResolvedValue(mockResponse)

      // Llamar a la función
      const result = await signInWithGoogle()

      // Verificar que se llamó a la función correcta con los parámetros correctos
      expect(mockSignInWithOAuth).toHaveBeenCalledWith('google', undefined)

      // Verificar que el resultado es el esperado
      expect(result).toEqual(mockResponse)
    })

    it('debería manejar errores en la autenticación con Google', async () => {
      // Configurar el mock para simular un error
      const mockError = { message: 'OAuth configuration error' }
      mockSignInWithOAuth.mockResolvedValue({ data: null, error: mockError })

      // Llamar a la función
      const result = await signInWithGoogle()

      // Verificar que se llamó a la función correcta
      expect(mockSignInWithOAuth).toHaveBeenCalledWith('google', undefined)

      // Verificar que el resultado contiene el error
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signOut', () => {
    it('debería cerrar sesión correctamente', async () => {
      // Configurar el mock para simular un cierre de sesión exitoso
      mockSignOut.mockResolvedValue({ error: null })

      // Llamar a la función
      const result = await signOut()

      // Verificar que se llamó a la función correcta
      expect(mockSignOut).toHaveBeenCalled()

      // Verificar que el resultado es el esperado
      expect(result).toEqual({ error: null })
    })

    it('debería manejar errores al cerrar sesión', async () => {
      // Configurar el mock para simular un error
      const mockError = { message: 'Session not found' }
      mockSignOut.mockResolvedValue({ error: mockError })

      // Llamar a la función
      const result = await signOut()

      // Verificar que se llamó a la función correcta
      expect(mockSignOut).toHaveBeenCalled()

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
      mockGetCurrentSession.mockResolvedValue(mockSession)

      // Llamar a la función
      const result = await getSession()

      // Verificar que se llamó a la función correcta
      expect(mockGetCurrentSession).toHaveBeenCalled()

      // Verificar que el resultado es el esperado
      expect(result).toEqual(mockSession)
    })

    it('debería manejar errores al obtener la sesión', async () => {
      // Configurar el mock para simular un error
      const mockError = { message: 'Failed to get session' }
      mockGetCurrentSession.mockResolvedValue({ data: null, error: mockError })

      // Llamar a la función
      const result = await getSession()

      // Verificar que se llamó a la función correcta
      expect(mockGetCurrentSession).toHaveBeenCalled()

      // Verificar que el resultado contiene el error
      expect(result.error).toEqual(mockError)
    })
  })
})
