# Guía de Migración a Clerk

Esta guía proporciona instrucciones paso a paso para migrar un proyecto existente a Clerk como proveedor de autenticación, basado en la experiencia de migración de Gëstro desde Supabase Auth.

## Índice

1. [Preparación](#preparación)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [Implementación de la Capa de Compatibilidad](#implementación-de-la-capa-de-compatibilidad)
4. [Migración de Componentes](#migración-de-componentes)
5. [Configuración del Middleware](#configuración-del-middleware)
6. [Integración con la Base de Datos](#integración-con-la-base-de-datos)
7. [Pruebas y Verificación](#pruebas-y-verificación)
8. [Eliminación de la Capa de Compatibilidad](#eliminación-de-la-capa-de-compatibilidad)

## Preparación

### 1. Análisis del Sistema Actual

Antes de comenzar la migración, es importante analizar el sistema actual:

- Identificar todos los componentes que utilizan autenticación
- Documentar los flujos de autenticación existentes
- Identificar las integraciones con otros sistemas

### 2. Planificación de la Migración

Crear un plan de migración que incluya:

- Cronograma de migración
- Estrategia de implementación (gradual o completa)
- Plan de pruebas
- Plan de contingencia

## Instalación y Configuración

### 1. Instalar Clerk

```bash
npm install @clerk/nextjs
# o
yarn add @clerk/nextjs
# o
pnpm add @clerk/nextjs
```

### 2. Configurar Variables de Entorno

Crear o actualizar el archivo `.env.local`:

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_[TU_CLAVE_DE_DESARROLLO_AQUI]

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL=/
```

### 3. Configurar ClerkProvider

Crear un componente `ClerkProvider` personalizado:

```tsx
// components/clerk-provider.tsx
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
        elements: {
          formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          card: 'shadow-md',
          formField: 'mb-4',
          formFieldLabel: 'text-foreground font-medium',
          formFieldInput: 'border-border rounded-md',
          footerActionLink: 'text-primary hover:text-primary/90',
        }
      }}
    >
      {children}
    </ClerkProviderOriginal>
  )
}
```

### 4. Integrar ClerkProvider en el Layout Principal

```tsx
// app/layout.tsx
import { ClerkProvider } from "@/components/clerk-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
```

## Implementación de la Capa de Compatibilidad

Para facilitar la migración gradual, es recomendable implementar una capa de compatibilidad que proporcione una API similar a la del proveedor de autenticación anterior.

### 1. Crear la Capa de Compatibilidad

```tsx
// lib/clerk-client.tsx
"use client"

import { useAuth as useClerkAuth, useUser, useClerk } from "@clerk/nextjs"
import { createContext, useContext, useState, useEffect } from "react"

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
  refresh_token?: string
  expires_at?: number
}

// Contexto de autenticación
type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string, options?: any) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useClerkAuth()
  const { user } = useUser()
  const clerk = useClerk()
  const [compatUser, setCompatUser] = useState<User | null>(null)
  const [compatSession, setCompatSession] = useState<Session | null>(null)

  // Actualizar el usuario compatible cuando cambia el usuario de Clerk
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const newCompatUser: User = {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || null,
        user_metadata: {
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          avatar_url: user.imageUrl,
          role: user.unsafeMetadata?.role || 'customer'
        },
        app_metadata: {
          role: user.unsafeMetadata?.role || 'customer'
        },
        created_at: user.createdAt
      }

      setCompatUser(newCompatUser)
      setCompatSession({
        user: newCompatUser,
        access_token: 'clerk-token',
        expires_at: Date.now() + 3600000 // 1 hora
      })
    } else {
      setCompatUser(null)
      setCompatSession(null)
    }
  }, [isLoaded, isSignedIn, user])

  // Funciones de autenticación compatibles
  const signIn = async (email: string, password: string) => {
    try {
      await clerk.signIn.create({
        identifier: email,
        password
      })
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      await clerk.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/auth/sso-callback',
        redirectUrlComplete: '/'
      })
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, options?: any) => {
    try {
      const name = options?.options?.data?.name || ''
      const role = options?.options?.data?.role || 'customer'

      await clerk.signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        unsafeMetadata: {
          role
        }
      })
    } catch (error) {
      console.error('Error al registrarse:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await clerk.signOut()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: compatUser,
        session: compatSession,
        isLoading: !isLoaded,
        signIn,
        signInWithGoogle,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
```

### 2. Integrar AuthProvider en el Layout

```tsx
// app/layout.tsx
import { ClerkProvider } from "@/components/clerk-provider"
import { AuthProvider } from "@/lib/clerk-client"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ClerkProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
```

## Migración de Componentes

### 1. Actualizar Importaciones

Buscar y reemplazar las importaciones del proveedor anterior por la capa de compatibilidad:

```tsx
// Antes
import { useAuth } from '@/lib/auth'
// o
import { useAuth } from '@/components/auth-provider'

// Después
import { useAuth } from '@/lib/clerk-client'
```

### 2. Actualizar Componentes de Autenticación

#### Formulario de Inicio de Sesión

```tsx
// components/login-form.tsx
"use client"

import { useState } from "react"
import { useAuth } from "@/lib/clerk-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LoginForm() {
  const { signIn, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await signIn(email, password)
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500">{error}</p>}
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Cargando..." : "Iniciar sesión"}
      </Button>
    </form>
  )
}
```

## Configuración del Middleware

### 1. Crear Middleware para Protección de Rutas

```tsx
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/sso-callback',
  // Otras rutas públicas...
])

export default clerkMiddleware(
  async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect()
    }
  }
)

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

## Integración con la Base de Datos

### 1. Crear Webhook para Sincronización

```tsx
// app/api/webhook/clerk/route.ts
import { WebhookEvent } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  // Verificar la firma del webhook
  const headerPayload = headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error de verificación de webhook', {
      status: 400
    })
  }

  // Obtener el cuerpo de la solicitud
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verificar la firma con la clave secreta de Clerk
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    return new Response('Webhook secret not configured', {
      status: 500
    })
  }

  const webhook = new Webhook(webhookSecret)
  let event: WebhookEvent

  try {
    event = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature
    }) as WebhookEvent
  } catch (err) {
    console.error('Error al verificar webhook:', err)
    return new Response('Error al verificar webhook', {
      status: 400
    })
  }

  // Manejar diferentes eventos de Clerk
  const eventType = event.type
  
  if (eventType === 'user.created') {
    // Crear perfil en la base de datos cuando se crea un usuario en Clerk
    const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = event.data

    await db.user.create({
      data: {
        id,
        email: email_addresses[0]?.email_address,
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        role: unsafe_metadata?.role || 'customer',
        avatarUrl: image_url
      }
    })
  }

  return NextResponse.json({ success: true })
}
```

## Pruebas y Verificación

### 1. Crear Página de Prueba

```tsx
// app/auth/test/page.tsx
"use client"

import { useAuth } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export default function TestPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const clerk = useClerk()

  if (!isLoaded) {
    return <div>Cargando...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Prueba de Autenticación</h1>
      
      <div className="mb-4">
        <p>Estado: {isSignedIn ? "Autenticado" : "No autenticado"}</p>
        {isSignedIn && user && (
          <div>
            <p>ID: {user.id}</p>
            <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
            <p>Nombre: {user.firstName} {user.lastName}</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
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
          <Button onClick={() => clerk.signOut()}>
            Cerrar sesión
          </Button>
        )}
      </div>
    </div>
  )
}
```

## Eliminación de la Capa de Compatibilidad

Una vez que todos los componentes hayan sido migrados a la API directa de Clerk, se puede eliminar la capa de compatibilidad.

### 1. Migrar a la API Directa de Clerk

```tsx
// Antes (con capa de compatibilidad)
import { useAuth } from '@/lib/clerk-client'

function MyComponent() {
  const { user, signIn } = useAuth()
  
  // ...
}

// Después (API directa de Clerk)
import { useUser, useClerk } from '@clerk/nextjs'

function MyComponent() {
  const { user } = useUser()
  const clerk = useClerk()
  
  // ...
}
```

### 2. Eliminar la Capa de Compatibilidad

Una vez completada la migración, se pueden eliminar los archivos relacionados con la capa de compatibilidad:

- `lib/clerk-client.tsx`
- Cualquier otro archivo relacionado con la capa de compatibilidad

### 3. Actualizar el Layout Principal

```tsx
// app/layout.tsx
import { ClerkProvider } from "@/components/clerk-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
```

## Conclusión

La migración a Clerk como proveedor de autenticación puede realizarse de manera gradual utilizando una capa de compatibilidad. Esta estrategia permite minimizar el impacto en el código existente y facilita la transición.

Una vez completada la migración, se recomienda eliminar la capa de compatibilidad y utilizar directamente la API de Clerk para aprovechar todas sus funcionalidades y mantener el código más limpio y actualizado.
