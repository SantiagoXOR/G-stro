import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

// Mock de supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn()
          }
        }
      }))
    }
  }
}))

// Mock de offline-mode
jest.mock('@/lib/offline-mode', () => ({
  isInOfflineMode: jest.fn().mockReturnValue(false),
  offlineData: {}
}))

// Componente de prueba para acceder al contexto de autenticación
const AuthConsumer = () => {
  const { user, isLoading, signIn, signOut } = useAuth()
  
  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'Cargando...' : 'Carga completa'}</div>
      <div data-testid="user-email">{user ? user.email : 'No autenticado'}</div>
      <button onClick={() => signIn('test@example.com', 'password123')} data-testid="login-button">
        Iniciar sesión
      </button>
      <button onClick={() => signOut()} data-testid="logout-button">
        Cerrar sesión
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debería mostrar estado de carga inicialmente', async () => {
    // Configurar el mock para que la promesa no se resuelva inmediatamente
    ;(supabase.auth.getSession as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: { session: null }, error: null }), 100))
    )

    // Renderizar el componente
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    // Verificar que se muestra el estado de carga
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Cargando...')
  })

  it('debería cargar la sesión inicial correctamente', async () => {
    // Crear un usuario de prueba
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com'
    } as User

    // Crear una sesión de prueba
    const mockSession = {
      user: mockUser,
      access_token: 'test-token',
      refresh_token: 'test-refresh-token',
      expires_at: Date.now() + 3600000
    } as Session

    // Configurar el mock para devolver una sesión
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    // Renderizar el componente
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    // Esperar a que se complete la carga
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Carga completa')
    })

    // Verificar que se muestra el email del usuario
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
  })

  it('debería manejar errores al cargar la sesión inicial', async () => {
    // Configurar el mock para simular un error
    const mockError = new Error('Failed to get session')
    ;(supabase.auth.getSession as jest.Mock).mockRejectedValue(mockError)

    // Espiar console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    // Renderizar el componente
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    // Esperar a que se complete la carga
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Carga completa')
    })

    // Verificar que se registró el error
    expect(consoleSpy).toHaveBeenCalledWith('Error al obtener la sesión inicial:', mockError)

    // Verificar que no hay usuario autenticado
    expect(screen.getByTestId('user-email')).toHaveTextContent('No autenticado')

    // Restaurar console.error
    consoleSpy.mockRestore()
  })

  it('debería iniciar sesión correctamente', async () => {
    // Configurar el mock para que no haya sesión inicial
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null
    })

    // Configurar el mock para simular un inicio de sesión exitoso
    ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        user: { id: 'test-user-id', email: 'test@example.com' },
        session: { access_token: 'test-token' }
      },
      error: null
    })

    // Renderizar el componente
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    // Esperar a que se complete la carga
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Carga completa')
    })

    // Verificar que inicialmente no hay usuario autenticado
    expect(screen.getByTestId('user-email')).toHaveTextContent('No autenticado')

    // Hacer clic en el botón de inicio de sesión
    await act(async () => {
      screen.getByTestId('login-button').click()
    })

    // Verificar que se llamó a la función correcta con los parámetros correctos
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('debería cerrar sesión correctamente', async () => {
    // Crear un usuario de prueba
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com'
    } as User

    // Crear una sesión de prueba
    const mockSession = {
      user: mockUser,
      access_token: 'test-token',
      refresh_token: 'test-refresh-token',
      expires_at: Date.now() + 3600000
    } as Session

    // Configurar el mock para devolver una sesión
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    // Configurar el mock para simular un cierre de sesión exitoso
    ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null })

    // Renderizar el componente
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    // Esperar a que se complete la carga
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Carga completa')
    })

    // Verificar que hay un usuario autenticado
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')

    // Hacer clic en el botón de cierre de sesión
    await act(async () => {
      screen.getByTestId('logout-button').click()
    })

    // Verificar que se llamó a la función correcta
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })
})
