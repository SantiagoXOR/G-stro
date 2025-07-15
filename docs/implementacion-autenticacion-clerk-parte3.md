# Implementación de Autenticación con Clerk en Gëstro: Parte 3

## Índice

1. [Manejo de Errores](#manejo-de-errores)
2. [Consideraciones de Seguridad](#consideraciones-de-seguridad)
3. [Pruebas y Verificación](#pruebas-y-verificación)
4. [Migración desde Supabase Auth](#migración-desde-supabase-auth)

## Manejo de Errores

### Tipos de Errores Comunes

Clerk puede generar varios tipos de errores durante los procesos de autenticación. Es importante manejarlos adecuadamente para proporcionar una buena experiencia de usuario.

1. **Errores de Validación**:
   - Email inválido
   - Contraseña débil
   - Campos obligatorios faltantes

2. **Errores de Autenticación**:
   - Credenciales incorrectas
   - Cuenta bloqueada
   - Límite de intentos excedido

3. **Errores de Red**:
   - Timeout
   - Sin conexión
   - Problemas con la API de Clerk

4. **Errores de Integración**:
   - Problemas con webhooks
   - Errores en la sincronización con Supabase
   - Problemas con JWT

### Estructura de Errores de Clerk

Los errores de Clerk tienen la siguiente estructura:

```typescript
type ClerkError = {
  errors: Array<{
    code: string;
    message: string;
    longMessage?: string;
    meta?: Record<string, any>;
  }>;
};
```

### Implementación de Manejo de Errores

```typescript
// lib/error-handling.ts
import { useState } from "react"
import { toast } from "sonner"

// Mapeo de códigos de error a mensajes amigables
const errorMessages: Record<string, string> = {
  // Errores de autenticación
  "form_identifier_not_found": "El email no está registrado",
  "form_password_incorrect": "La contraseña es incorrecta",
  "form_identifier_exists": "Este email ya está registrado",
  "form_password_pwned": "Esta contraseña no es segura. Por favor, elige otra.",
  "form_password_validation_failed": "La contraseña debe tener al menos 8 caracteres",
  "form_param_format_invalid": "El formato del email es inválido",
  
  // Errores de red
  "network_error": "Error de conexión. Verifica tu conexión a internet.",
  "not_found_error": "Recurso no encontrado",
  "server_error": "Error en el servidor. Intenta nuevamente más tarde.",
  
  // Errores de integración
  "webhook_failed": "Error en la sincronización de datos",
  "jwt_invalid": "Sesión inválida. Por favor, inicia sesión nuevamente.",
  
  // Errores generales
  "unknown_error": "Ha ocurrido un error inesperado"
}

// Función para manejar errores de Clerk
export function handleClerkError(error: any): string {
  console.error("Error de autenticación:", error)
  
  // Si es un error de Clerk con estructura conocida
  if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    const errorCode = error.errors[0].code
    return errorMessages[errorCode] || error.errors[0].message || "Error desconocido"
  }
  
  // Si es un error de red
  if (error.name === "NetworkError") {
    return errorMessages.network_error
  }
  
  // Si es un error del servidor
  if (error.status >= 500) {
    return errorMessages.server_error
  }
  
  // Error desconocido
  return errorMessages.unknown_error
}

// Componente de manejo de errores para formularios
export function useFormError() {
  const [error, setError] = useState<string | null>(null)
  
  const handleError = (error: any) => {
    const errorMessage = handleClerkError(error)
    setError(errorMessage)
    toast.error(errorMessage)
    return errorMessage
  }
  
  const clearError = () => setError(null)
  
  return { error, handleError, clearError }
}
```

### Ejemplo de Uso en Componentes

```tsx
// components/login-form.tsx
"use client"

import { useState } from "react"
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFormError } from "@/lib/error-handling"

export function LoginForm() {
  const clerk = useClerk()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { error, handleError, clearError } = useFormError()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsLoading(true)
    
    try {
      // Validar campos
      if (!email || !password) {
        throw { errors: [{ code: "form_param_missing", message: "Todos los campos son obligatorios" }] }
      }
      
      // Intentar iniciar sesión
      await clerk.signIn.create({
        identifier: email,
        password
      })
      
      // Redirigir al usuario
      router.push("/")
    } catch (error: any) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Contraseña</label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Procesando..." : "Iniciar sesión"}
      </Button>
    </form>
  )
}
```

### Manejo de Errores en Modo Offline

```typescript
// lib/offline-error-handling.ts
import { useIsOffline } from "@/lib/offline-mode"
import { handleClerkError } from "@/lib/error-handling"

export function useOfflineAwareError() {
  const isOffline = useIsOffline()
  const [error, setError] = useState<string | null>(null)
  
  const handleError = (error: any) => {
    // Si estamos en modo offline y es un error de red
    if (isOffline && (error.name === "NetworkError" || !navigator.onLine)) {
      const message = "No hay conexión a internet. La aplicación está en modo offline."
      setError(message)
      return message
    }
    
    // Usar el manejador normal para otros errores
    const errorMessage = handleClerkError(error)
    setError(errorMessage)
    return errorMessage
  }
  
  const clearError = () => setError(null)
  
  return { error, handleError, clearError, isOffline }
}
```

## Consideraciones de Seguridad

### Mejores Prácticas de Seguridad

1. **Protección de Rutas**:
   - Utilizar el middleware de Clerk para proteger todas las rutas que requieren autenticación
   - Implementar verificación de roles para rutas sensibles
   - No confiar solo en la protección del cliente

2. **Manejo de Tokens**:
   - No almacenar tokens JWT en localStorage
   - Utilizar cookies seguras para almacenar tokens
   - Configurar tiempos de expiración adecuados

3. **Políticas de Contraseñas**:
   - Exigir contraseñas fuertes
   - Implementar límites de intentos de inicio de sesión
   - Ofrecer recuperación segura de contraseñas

4. **Protección contra CSRF y XSS**:
   - Utilizar tokens CSRF en formularios
   - Implementar Content Security Policy (CSP)
   - Sanitizar datos de entrada y salida

### Configuración de Seguridad en Clerk

```typescript
// components/clerk-provider-secure.tsx
"use client"

import { ClerkProvider as ClerkProviderOriginal } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  
  return (
    <ClerkProviderOriginal
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: '#112D1C',
          colorTextOnPrimaryBackground: '#FAECD8',
        },
      }}
      // Configuración de seguridad
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/auth/verify-email"
      // Opciones de cookies
      cookieOptions={{
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      }}
    >
      {children}
    </ClerkProviderOriginal>
  )
}
```

### Configuración de Seguridad en Supabase

Para asegurar que las políticas RLS de Supabase funcionen correctamente con Clerk:

```sql
-- Función para verificar el rol del usuario
CREATE OR REPLACE FUNCTION public.get_user_role(user_id TEXT)
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = user_id
$$ LANGUAGE sql SECURITY DEFINER;

-- Política para acceso basado en roles
CREATE POLICY "Admin access policy"
  ON admin_only_table
  FOR ALL
  USING (
    get_user_role(auth.uid()) = 'admin'
  );
```

### Auditoría y Logging

```typescript
// lib/auth-logging.ts
import { supabase } from "@/lib/supabase-client"

// Tipos de eventos de autenticación
type AuthEvent = 
  | 'sign_in'
  | 'sign_up'
  | 'sign_out'
  | 'password_reset'
  | 'email_verification'
  | 'profile_update'
  | 'role_change'
  | 'failed_sign_in'

// Función para registrar eventos de autenticación
export async function logAuthEvent(
  event: AuthEvent,
  userId: string | null,
  metadata: Record<string, any> = {}
) {
  try {
    await supabase
      .from('auth_logs')
      .insert({
        event_type: event,
        user_id: userId,
        metadata,
        ip_address: metadata.ip_address || null,
        user_agent: metadata.user_agent || null,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error al registrar evento de autenticación:', error)
  }
}

// Hook para registrar eventos de autenticación
export function useAuthLogging() {
  const { user } = useUser()
  
  const logEvent = useCallback(
    async (event: AuthEvent, metadata: Record<string, any> = {}) => {
      // Obtener información del navegador
      const browserMetadata = {
        user_agent: navigator.userAgent,
        ...metadata
      }
      
      await logAuthEvent(event, user?.id || null, browserMetadata)
    },
    [user]
  )
  
  return { logEvent }
}
```

## Pruebas y Verificación

### Pruebas Automatizadas

```typescript
// __tests__/auth.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClerkProvider } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/login-form'

// Mock de Clerk
jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useClerk: () => ({
    signIn: {
      create: jest.fn().mockImplementation(({ identifier, password }) => {
        if (identifier === 'test@example.com' && password === 'password123') {
          return Promise.resolve()
        }
        return Promise.reject({
          errors: [{ code: 'form_password_incorrect', message: 'Contraseña incorrecta' }]
        })
      })
    }
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: false
  }),
  useUser: () => ({
    user: null
  })
}))

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

describe('LoginForm', () => {
  it('muestra error cuando las credenciales son incorrectas', async () => {
    render(<LoginForm />)
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'wrong-password' }
    })
    
    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    // Verificar que se muestra el mensaje de error
    await waitFor(() => {
      expect(screen.getByText(/contraseña incorrecta/i)).toBeInTheDocument()
    })
  })
  
  it('inicia sesión correctamente con credenciales válidas', async () => {
    const { push } = useRouter()
    render(<LoginForm />)
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password123' }
    })
    
    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    // Verificar que se redirige al usuario
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/')
    })
  })
})
```

### Página de Diagnóstico

```tsx
// app/diagnostico/auth/page.tsx
"use client"

import { useAuth, useUser, useClerk } from "@clerk/nextjs"
import { useIsOffline } from "@/lib/offline-mode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DiagnosticoAuthPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const clerk = useClerk()
  const isOffline = useIsOffline()
  
  if (!isLoaded) {
    return <div>Cargando...</div>
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Diagnóstico de Autenticación</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Estado de Autenticación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Modo:</strong> {isOffline ? 'Offline' : 'Online'}</p>
            <p><strong>Autenticado:</strong> {isSignedIn ? 'Sí' : 'No'}</p>
            <p><strong>Clerk cargado:</strong> {isLoaded ? 'Sí' : 'No'}</p>
          </div>
        </CardContent>
      </Card>
      
      {isSignedIn && user && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
              <p><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Rol:</strong> {user.unsafeMetadata?.role || 'No especificado'}</p>
              <p><strong>Creado:</strong> {new Date(user.createdAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          {!isSignedIn ? (
            <>
              <Button onClick={() => clerk.openSignIn()}>
                Iniciar sesión
              </Button>
              <Button onClick={() => clerk.openSignUp()}>
                Registrarse
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => clerk.signOut()}>
                Cerrar sesión
              </Button>
              <Button onClick={() => clerk.openUserProfile()}>
                Perfil de usuario
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Datos Técnicos</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
            {JSON.stringify(
              {
                auth: {
                  isLoaded,
                  isSignedIn
                },
                user: user ? {
                  id: user.id,
                  email: user.primaryEmailAddress?.emailAddress,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  metadata: user.unsafeMetadata
                } : null,
                environment: {
                  isOffline,
                  userAgent: navigator.userAgent,
                  onLine: navigator.onLine
                }
              },
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
```
