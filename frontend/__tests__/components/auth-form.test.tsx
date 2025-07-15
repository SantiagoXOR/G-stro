import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { AuthForm } from '@/components/auth-form'
import userEvent from '@testing-library/user-event'
import { useAuth } from '@/components/auth-provider'

// Mock offline mode
jest.mock('@/lib/offline-mode', () => ({
  isInOfflineMode: jest.fn(() => true) // Forzar modo offline para tests
}))

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({ user: null })),
  useSignIn: jest.fn(() => ({
    signIn: null,
    isLoaded: false
  })),
  useSignUp: jest.fn(() => ({
    signUp: null,
    isLoaded: false
  }))
}))

// Mock useAuth hook
jest.mock('@/components/auth-provider', () => {
  const mockSignIn = jest.fn()
  const mockSignUp = jest.fn()
  const mockSignInWithGoogle = jest.fn()

  return {
    useAuth: jest.fn(() => ({
      signIn: mockSignIn,
      signUp: mockSignUp,
      signInWithGoogle: mockSignInWithGoogle,
      user: null,
      isLoading: false
    }))
  }
})

// Mock toast
jest.mock('sonner', () => {
  const mockSuccess = jest.fn()
  const mockError = jest.fn()

  return {
    toast: {
      success: mockSuccess,
      error: mockError
    }
  }
})

// Mock router
jest.mock('next/navigation', () => {
  const mockPush = jest.fn()
  const mockReplace = jest.fn()
  const mockBack = jest.fn()

  return {
    useRouter: jest.fn(() => ({
      push: mockPush,
      replace: mockReplace,
      back: mockBack
    }))
  }
})

describe('AuthForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form by default', () => {
    render(<AuthForm />)

    // Verificar que se muestra el formulario de login
    expect(screen.getByText('Iniciar Sesión', { selector: 'div' })).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('switches to register form when toggle is clicked', () => {
    render(<AuthForm />)

    // Hacer clic en el enlace para cambiar a registro
    fireEvent.click(screen.getByText('Crear una cuenta'))

    // Verificar que se muestra el formulario de registro
    expect(screen.getByText('Crear Cuenta')).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument()
  })

  it('valida el formulario antes de enviar', async () => {
    const user = userEvent.setup()
    render(<AuthForm />)

    // Ingresar un email inválido
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    await user.type(emailInput, 'invalid-email')

    // Hacer clic en el botón de login
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    await user.click(submitButton)

    // Verificar que no se llamó a la función de inicio de sesión
    const { useAuth } = require('@/components/auth-provider')
    const mockUseAuth = useAuth as jest.Mock
    const mockSignIn = mockUseAuth().signIn
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('valida la longitud de la contraseña', async () => {
    const user = userEvent.setup()
    render(<AuthForm />)

    // Ingresar un email válido
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    await user.type(emailInput, 'test@example.com')

    // Ingresar una contraseña demasiado corta
    const passwordInput = screen.getByLabelText(/contraseña/i)
    await user.type(passwordInput, '123')

    // Hacer clic en el botón de login
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    await user.click(submitButton)

    // Verificar que no se llamó a la función de inicio de sesión
    const { useAuth } = require('@/components/auth-provider')
    const mockUseAuth = useAuth as jest.Mock
    const mockSignIn = mockUseAuth().signIn
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('envía el formulario de login con datos válidos', async () => {
    // Configurar mocks
    const mockSignIn = jest.fn().mockResolvedValue({ error: null })
    const mockPush = jest.fn()

    // Configurar los mocks
    const { useAuth } = require('@/components/auth-provider')
    const mockUseAuth = useAuth as jest.Mock
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      user: null,
      isLoading: false
    })

    const { useRouter } = require('next/navigation')
    const mockUseRouter = useRouter as jest.Mock
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn()
    })

    const { toast } = require('sonner')

    const user = userEvent.setup()
    render(<AuthForm />)

    // Ingresar datos válidos
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    // Hacer clic en el botón de login
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    await user.click(submitButton)

    // Verificar que se llama a signIn con los datos correctos
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')

    // Verificar que se muestra un mensaje de éxito (modo offline)
    expect(toast.success).toHaveBeenCalledWith('Inicio de sesión exitoso (modo offline)')

    // Verificar que se redirige a la página principal
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('envía el formulario de registro con datos válidos', async () => {
    // Configurar mocks
    const mockSignUp = jest.fn().mockResolvedValue({ error: null })

    // Configurar los mocks
    const { useAuth } = require('@/components/auth-provider')
    const mockUseAuth = useAuth as jest.Mock
    mockUseAuth.mockReturnValue({
      signIn: jest.fn(),
      signUp: mockSignUp,
      signInWithGoogle: jest.fn(),
      user: null,
      isLoading: false
    })

    const { toast } = require('sonner')

    const user = userEvent.setup()
    render(<AuthForm />)

    // Cambiar a formulario de registro
    const createAccountButton = screen.getByText('Crear una cuenta')
    await user.click(createAccountButton)

    // Verificar que estamos en el formulario de registro
    const registerHeading = await screen.findByText('Crear Cuenta', { selector: 'div' })
    expect(registerHeading).toBeInTheDocument()

    // Ingresar datos válidos
    const nameInput = screen.getByLabelText(/nombre/i)
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    // Hacer clic en el botón de registro
    const registerButton = screen.getByRole('button', { name: /registrarse/i })
    await user.click(registerButton)

    // Verificar que se llama a signUp con los datos correctos
    expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User')

    // Verificar que se muestra un mensaje de éxito (modo offline)
    expect(toast.success).toHaveBeenCalledWith('Cuenta creada correctamente (modo offline)')
  })

  it('maneja errores de autenticación', async () => {
    // Configurar mock para simular un error
    const mockError = { message: 'Credenciales inválidas' }
    const mockSignIn = jest.fn().mockResolvedValue({ error: mockError })

    // Configurar los mocks
    const { useAuth } = require('@/components/auth-provider')
    const mockUseAuth = useAuth as jest.Mock
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      user: null,
      isLoading: false
    })

    const { toast } = require('sonner')

    const user = userEvent.setup()
    render(<AuthForm />)

    // Ingresar datos
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    // Hacer clic en el botón de login
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    await user.click(submitButton)

    // Verificar que se llama a signIn con los datos correctos
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')

    // Verificar que se muestra un mensaje de error
    expect(toast.error).toHaveBeenCalledWith('Credenciales inválidas')
  })

  it('muestra el botón de inicio de sesión con Google', () => {
    render(<AuthForm />)

    // Verificar que se muestra el botón de Google
    const googleButton = screen.getByRole('button', { name: /google/i })
    expect(googleButton).toBeInTheDocument()
  })

  it('llama a signInWithGoogle cuando se hace clic en el botón de Google', async () => {
    // Configurar mock
    const mockSignInWithGoogle = jest.fn().mockResolvedValue({ error: null })

    // Configurar los mocks
    const { useAuth } = require('@/components/auth-provider')
    const mockUseAuth = useAuth as jest.Mock
    mockUseAuth.mockReturnValue({
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: mockSignInWithGoogle,
      user: null,
      isLoading: false
    })

    const user = userEvent.setup()
    render(<AuthForm />)

    // Hacer clic en el botón de Google
    const googleButton = screen.getByRole('button', { name: /google/i })
    await user.click(googleButton)

    // Verificar que se llama a signInWithGoogle
    expect(mockSignInWithGoogle).toHaveBeenCalled()
  })
})
