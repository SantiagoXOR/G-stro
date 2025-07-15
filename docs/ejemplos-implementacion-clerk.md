# Ejemplos de Implementación de Clerk en Gëstro

Este documento proporciona ejemplos detallados de cómo implementar y utilizar Clerk en diferentes escenarios dentro de la aplicación Gëstro.

## Índice

1. [Componentes de Autenticación](#componentes-de-autenticación)
2. [Hooks y Funciones](#hooks-y-funciones)
3. [Protección de Rutas](#protección-de-rutas)
4. [Integración con Modo Offline](#integración-con-modo-offline)
5. [Integración con Supabase](#integración-con-supabase)
6. [Casos de Uso Avanzados](#casos-de-uso-avanzados)

## Componentes de Autenticación

### Formulario de Inicio de Sesión Personalizado

```tsx
// frontend/components/auth-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function AuthForm({ isLogin = true }) {
  const router = useRouter()
  const clerk = useClerk()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (isLogin) {
        // Iniciar sesión
        await clerk.signIn.create({
          identifier: email,
          password,
        })

        toast.success("Inicio de sesión exitoso")
        router.push("/")
      } else {
        // Registrarse
        await clerk.signUp.create({
          emailAddress: email,
          password,
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
          unsafeMetadata: {
            role: "customer"
          }
        })

        toast.success("Cuenta creada correctamente. Verifica tu correo electrónico.")
      }
    } catch (error: any) {
      toast.error(error?.errors?.[0]?.message || "Error en la autenticación")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Nombre completo</label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Procesando..." : isLogin ? "Iniciar sesión" : "Registrarse"}
      </Button>
    </form>
  )
}
```

### Botón de Inicio de Sesión con Google

```tsx
// frontend/components/auth/GoogleLoginButton.jsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useClerk } from "@clerk/nextjs"
import { toast } from "sonner"

export function GoogleLoginButton({ onSuccess, className }) {
  const clerk = useClerk()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleLogin = async () => {
    try {
      setErrorMessage(null)
      setIsLoading(true)
      console.log("Iniciando proceso de login con Google...")

      // Guardar timestamp para depuración
      localStorage.setItem('auth_google_button_click_time', new Date().toISOString())

      // Usar la API de Clerk para autenticar con Google
      await clerk.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth/sso-callback",
        redirectUrlComplete: "/"
      })

      // Llamar al callback de éxito si existe
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error)
      setErrorMessage(error.message || "Error al iniciar sesión con Google")
      toast.error("Error al iniciar sesión con Google")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={`w-full flex items-center justify-center gap-2 ${className}`}
        onClick={handleLogin}
        disabled={isLoading}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Logo de Google SVG */}
          <path d="M19.9895 10.1871C19.9895 9.36767 19.9214 8.76973 19.7742 8.14966H10.1992V11.848H15.8195C15.7062 12.7671 15.0943 14.1512 13.7346 15.0813L13.7155 15.2051L16.7429 17.4969L16.9527 17.5174C18.879 15.7789 19.9895 13.221 19.9895 10.1871Z" fill="#4285F4"/>
          <path d="M10.1993 19.9313C12.9527 19.9313 15.2643 19.0454 16.9527 17.5174L13.7346 15.0813C12.8734 15.6682 11.7176 16.0779 10.1993 16.0779C7.50243 16.0779 5.21352 14.3395 4.39759 11.9366L4.27799 11.9466L1.13003 14.3273L1.08887 14.4391C2.76588 17.6945 6.21061 19.9313 10.1993 19.9313Z" fill="#34A853"/>
          <path d="M4.39748 11.9366C4.18219 11.3166 4.05759 10.6521 4.05759 9.96565C4.05759 9.27909 4.18219 8.61473 4.38615 7.99466L4.38045 7.8626L1.19304 5.44366L1.08875 5.49214C0.397576 6.84305 0.000976562 8.36008 0.000976562 9.96565C0.000976562 11.5712 0.397576 13.0882 1.08875 14.4391L4.39748 11.9366Z" fill="#FBBC05"/>
          <path d="M10.1993 3.85336C12.1142 3.85336 13.406 4.66168 14.1425 5.33717L17.0207 2.59107C15.253 0.985496 12.9527 0 10.1993 0C6.2106 0 2.76588 2.23672 1.08887 5.49214L4.38626 7.99466C5.21352 5.59183 7.50242 3.85336 10.1993 3.85336Z" fill="#EB4335"/>
        </svg>
        {isLoading ? "Procesando..." : "Continuar con Google"}
      </Button>
      {errorMessage && (
        <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
      )}
    </>
  )
}
```

## Hooks y Funciones

### Verificación de Autenticación en Componente

```tsx
// frontend/components/protected-component.tsx
"use client"

import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function ProtectedComponent({ children }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return <div>Cargando...</div>
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div>
      <h1>Bienvenido, {user?.firstName || "Usuario"}</h1>
      {children}
    </div>
  )
}
```

### Obtener Datos del Usuario

```tsx
// frontend/components/user-profile.tsx
"use client"

import { useUser } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UserProfile() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return <div>Cargando perfil...</div>
  }

  if (!user) {
    return <div>No se encontró información del usuario</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil de Usuario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={user.imageUrl} alt={user.firstName || "Usuario"} />
            <AvatarFallback>{user.firstName?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
            <p className="text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">Información adicional</h3>
          <p>ID: {user.id}</p>
          <p>Creado: {new Date(user.createdAt).toLocaleDateString()}</p>
          <p>Rol: {user.unsafeMetadata?.role || "No especificado"}</p>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Protección de Rutas

### Middleware Personalizado

```tsx
// frontend/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Definir rutas públicas que no requieren autenticación
const isPublicRoute = createRouteMatcher([
  // Rutas principales
  '/',

  // Rutas de autenticación
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/sso-callback',
  '/auth/test',
  '/auth/test-clerk',
  '/auth/test-compatibility',
  '/auth/test-flows',
  '/auth/test-users',
  '/api/webhook/clerk',

  // Rutas de diagnóstico
  '/diagnostico',
  '/diagnostico/auth',

  // Rutas de navegación y productos (públicas)
  '/menu',
  '/menu/:id',
  '/menu/:path*',
  '/search',
  '/cart',

  // Rutas de recursos estáticos
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
])

// Definir rutas que deben ser ignoradas por el middleware
const isIgnoredRoute = createRouteMatcher([
  '/_next(.*)',
  '/api/health',
])

// Configurar el middleware de Clerk
export default clerkMiddleware(
  async (auth, req) => {
    // Proteger rutas que no son públicas ni ignoradas
    if (!isPublicRoute(req) && !isIgnoredRoute(req)) {
      await auth.protect()
    }
  }
)

// Configurar el matcher para el middleware
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

## Integración con Modo Offline

### Verificación de Modo Offline en Servicios

```tsx
// frontend/lib/services/profiles.ts
import { supabase } from "@/lib/supabase"
import { isInOfflineMode, offlineData } from "@/lib/offline-mode"

export async function getProfile(userId: string) {
  // Verificar si estamos en modo offline
  if (isInOfflineMode()) {
    console.log('Modo offline: devolviendo datos de ejemplo para perfil')
    // Devolver un perfil de ejemplo del modo offline
    return offlineData.users.find(user => user.id === userId) || {
      id: userId,
      email: 'usuario@ejemplo.com',
      name: 'Usuario Offline',
      role: 'customer'
    }
  }

  // Si no estamos en modo offline, obtener el perfil de Supabase
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error al obtener perfil:', error)
    throw error
  }

  return data
}
```

## Integración con Supabase

### Crear Perfil en Supabase al Registrarse

```tsx
// frontend/app/api/auth/create-profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    // Obtener el ID de usuario de Clerk del cuerpo de la solicitud
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Se requiere userId' }, { status: 400 })
    }

    // Obtener el usuario de Clerk
    const user = await clerkClient.users.getUser(userId)

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Crear perfil en Supabase
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: user.primaryEmailAddress?.emailAddress,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        role: user.unsafeMetadata?.role || 'customer',
        avatar_url: user.imageUrl
      })
      .select()
      .single()

    if (error) {
      console.error('Error al crear perfil en Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error: any) {
    console.error('Error inesperado al crear perfil:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

## Casos de Uso Avanzados

### Webhook de Clerk para Sincronización con Supabase

```tsx
// frontend/app/api/webhook/clerk/route.ts
import { WebhookEvent } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { supabase } from '@/lib/supabase-server'

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
  console.log(`Webhook recibido: ${eventType}`)

  if (eventType === 'user.created') {
    // Crear perfil en Supabase cuando se crea un usuario en Clerk
    const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = event.data

    const { error } = await supabase
      .from('profiles')
      .insert({
        id,
        email: email_addresses[0]?.email_address,
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        role: unsafe_metadata?.role || 'customer',
        avatar_url: image_url
      })

    if (error) {
      console.error('Error al crear perfil en Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
```
