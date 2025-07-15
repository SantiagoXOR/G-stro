'use client'

import { createContext, useContext, useState, useEffect } from 'react'

// Tipos para el usuario simulado
export type MockUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  imageUrl: string
  createdAt: string
}

// Contexto para la autenticación simulada
type MockAuthContextType = {
  isLoaded: boolean
  isSignedIn: boolean
  user: MockUser | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// Crear el contexto
const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined)

// Proveedor de autenticación simulada
export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [user, setUser] = useState<MockUser | null>(null)

  // Cargar el estado de autenticación desde localStorage al inicio
  useEffect(() => {
    const storedUser = localStorage.getItem('mock_auth_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsSignedIn(true)
    }
    setIsLoaded(true)
  }, [])

  // Guardar el usuario en localStorage cuando cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem('mock_auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('mock_auth_user')
    }
  }, [user])

  // Función para iniciar sesión
  const signIn = async (email: string, password: string) => {
    // Simular un retraso
    await new Promise(resolve => setTimeout(resolve, 500))

    // Crear un usuario simulado
    const mockUser: MockUser = {
      id: `user_${Date.now()}`,
      email,
      firstName: 'Usuario',
      lastName: 'Simulado',
      imageUrl: 'https://via.placeholder.com/150',
      createdAt: new Date().toISOString(),
    }

    setUser(mockUser)
    setIsSignedIn(true)
  }

  // Función para registrarse
  const signUp = async (email: string, password: string) => {
    // Simular un retraso
    await new Promise(resolve => setTimeout(resolve, 800))

    // Crear un usuario simulado
    const mockUser: MockUser = {
      id: `user_${Date.now()}`,
      email,
      firstName: 'Nuevo',
      lastName: 'Usuario',
      imageUrl: 'https://via.placeholder.com/150',
      createdAt: new Date().toISOString(),
    }

    setUser(mockUser)
    setIsSignedIn(true)
  }

  // Función para cerrar sesión
  const signOut = async () => {
    // Simular un retraso
    await new Promise(resolve => setTimeout(resolve, 300))

    setUser(null)
    setIsSignedIn(false)
  }

  // Valor del contexto
  const value = {
    isLoaded,
    isSignedIn,
    user,
    signIn,
    signUp,
    signOut,
  }

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  )
}

// Hook para usar la autenticación simulada
export function useMockAuth() {
  const context = useContext(MockAuthContext)
  if (context === undefined) {
    throw new Error('useMockAuth debe ser usado dentro de un MockAuthProvider')
  }
  return context
}

// Componentes simulados de Clerk
export function SignIn() {
  const { signIn } = useMockAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn(email, password)
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Iniciar sesión (Simulado)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-primary text-primary-foreground rounded"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  )
}

export function SignUp() {
  const { signUp } = useMockAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signUp(email, password)
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Registrarse (Simulado)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-primary text-primary-foreground rounded"
        >
          Registrarse
        </button>
      </form>
    </div>
  )
}

// Exportar versiones simuladas de los hooks de Clerk
export function useAuth() {
  const { isLoaded, isSignedIn } = useMockAuth()
  return { isLoaded, isSignedIn }
}

export function useUser() {
  const { user } = useMockAuth()
  return { user, isLoaded: true, isSignedIn: !!user }
}

export function useClerk() {
  const { signIn: mockSignIn, signUp: mockSignUp, signOut: mockSignOut } = useMockAuth()
  
  return {
    signIn: {
      create: async ({ identifier, password }: { identifier: string, password: string }) => {
        await mockSignIn(identifier, password)
      }
    },
    signUp: {
      create: async ({ emailAddress, password }: { emailAddress: string, password: string }) => {
        await mockSignUp(emailAddress, password)
      }
    },
    signOut: mockSignOut,
    openSignIn: () => {
      window.location.href = '/auth/sign-in'
    },
    openSignUp: () => {
      window.location.href = '/auth/sign-up'
    },
    openUserProfile: () => {
      alert('Perfil de usuario (simulado)')
    },
    authenticateWithRedirect: () => {
      alert('Autenticación con redirección (simulada)')
    }
  }
}
