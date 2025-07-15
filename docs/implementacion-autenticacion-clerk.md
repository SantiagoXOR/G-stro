# Implementación de Autenticación con Clerk en Gëstro: Guía Completa

## Índice

- [Implementación de Autenticación con Clerk en Gëstro: Guía Completa](#implementación-de-autenticación-con-clerk-en-gëstro-guía-completa)
  - [Índice](#índice)
  - [Comparativa: Clerk vs Supabase Auth](#comparativa-clerk-vs-supabase-auth)
    - [Diferencias Clave](#diferencias-clave)
    - [Ventajas de Migrar a Clerk](#ventajas-de-migrar-a-clerk)
  - [Configuración Completa](#configuración-completa)
    - [Variables de Entorno](#variables-de-entorno)
    - [Configuración del Dashboard de Clerk](#configuración-del-dashboard-de-clerk)
    - [Configuración del Webhook](#configuración-del-webhook)
  - [Arquitectura de Integración](#arquitectura-de-integración)
    - [Diagrama de Flujo de Autenticación](#diagrama-de-flujo-de-autenticación)
    - [Integración con la Arquitectura Actual](#integración-con-la-arquitectura-actual)
    - [Flujo de Datos](#flujo-de-datos)
  - [Flujos de Autenticación Detallados](#flujos-de-autenticación-detallados)
    - [Registro con Email/Contraseña](#registro-con-emailcontraseña)
    - [Verificación de Email](#verificación-de-email)
    - [Recuperación de Contraseña](#recuperación-de-contraseña)
    - [Inicio de Sesión con Google](#inicio-de-sesión-con-google)
  - [Protección de Rutas Avanzada](#protección-de-rutas-avanzada)
    - [Middleware con Protección por Roles](#middleware-con-protección-por-roles)
    - [Protección de Rutas API](#protección-de-rutas-api)

## Comparativa: Clerk vs Supabase Auth

### Diferencias Clave

| Característica | Supabase Auth | Clerk | Ventaja |
|----------------|---------------|-------|---------|
| **Modelo de autenticación** | Basado en JWT | Basado en sesiones | Clerk: Mayor seguridad y flexibilidad |
| **UI Components** | Limitados, requieren personalización | Completos y personalizables | Clerk: Menor tiempo de desarrollo |
| **Gestión de usuarios** | Básica, integrada con Supabase | Avanzada, con dashboard dedicado | Clerk: Mejores herramientas de gestión |
| **Verificación de email** | Manual, requiere configuración | Automática, con plantillas personalizables | Clerk: Implementación más sencilla |
| **OAuth Providers** | Configuración manual | Integración simplificada | Clerk: Más fácil de configurar |
| **Seguridad** | Buena, pero requiere configuración | Excelente, con MFA y detección de fraude | Clerk: Mayor seguridad por defecto |
| **Integración con DB** | Nativa con Supabase | Requiere integración manual | Supabase: Integración más directa |

### Ventajas de Migrar a Clerk

1. **Experiencia de usuario mejorada**:
   - Flujos de autenticación más intuitivos
   - Componentes UI modernos y personalizables
   - Soporte para múltiples factores de autenticación

2. **Seguridad reforzada**:
   - Detección de dispositivos sospechosos
   - Protección contra ataques de fuerza bruta
   - Gestión de sesiones más segura

3. **Desarrollo más eficiente**:
   - Menos código personalizado para autenticación
   - Componentes listos para usar
   - API más intuitiva y mejor documentada

4. **Escalabilidad**:
   - Mejor soporte para aplicaciones con muchos usuarios
   - Herramientas de análisis y monitoreo
   - Gestión de usuarios empresarial

5. **Mantenimiento simplificado**:
   - Menos código personalizado para mantener
   - Actualizaciones automáticas de seguridad
   - Mejor soporte técnico

## Configuración Completa

### Variables de Entorno

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_[TU_CLAVE_DE_DESARROLLO_AQUI]

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL=/

# Clerk Webhook
CLERK_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXX

# Supabase (para integración)
NEXT_PUBLIC_SUPABASE_URL=https://olxxrwdxsubpiujsxzxa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Configuración del Dashboard de Clerk

1. **Dominios permitidos**:
   - Configurar `localhost:3000` para desarrollo
   - Configurar el dominio de producción
   - Configurar dominios de staging si es necesario

2. **Configuración de OAuth**:
   - Google: Configurar Client ID y Client Secret
   - Configurar scopes: `email profile openid`
   - Configurar URLs de redirección

3. **Configuración de Webhooks**:
   - Crear un webhook endpoint: `https://tu-dominio.com/api/webhook/clerk`
   - Seleccionar eventos: `user.created`, `user.updated`, `user.deleted`
   - Copiar el webhook secret a las variables de entorno

4. **Configuración de Email**:
   - Personalizar plantillas de verificación de email
   - Personalizar plantillas de recuperación de contraseña
   - Configurar el nombre y email del remitente

### Configuración del Webhook

```typescript
// app/api/webhook/clerk/route.ts
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
    return new Response('Error de verificación de webhook', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 })
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
    return new Response('Error al verificar webhook', { status: 400 })
  }

  // Manejar diferentes eventos de Clerk
  const eventType = event.type
  console.log(`Webhook recibido: ${eventType}`)

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(event.data)
        break
      case 'user.updated':
        await handleUserUpdated(event.data)
        break
      case 'user.deleted':
        await handleUserDeleted(event.data)
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error al procesar webhook ${eventType}:`, error)
    return NextResponse.json({ error: 'Error al procesar webhook' }, { status: 500 })
  }
}

// Funciones para manejar eventos específicos
async function handleUserCreated(data: any) {
  const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = data

  // Crear perfil en Supabase
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
    throw error
  }
}

async function handleUserUpdated(data: any) {
  const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = data

  // Actualizar perfil en Supabase
  const { error } = await supabase
    .from('profiles')
    .update({
      email: email_addresses[0]?.email_address,
      name: `${first_name || ''} ${last_name || ''}`.trim(),
      role: unsafe_metadata?.role || 'customer',
      avatar_url: image_url
    })
    .eq('id', id)

  if (error) {
    console.error('Error al actualizar perfil en Supabase:', error)
    throw error
  }
}

async function handleUserDeleted(data: any) {
  const { id } = data

  // Eliminar perfil en Supabase
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error al eliminar perfil en Supabase:', error)
    throw error
  }
}
```

## Arquitectura de Integración

### Diagrama de Flujo de Autenticación

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Cliente    │◄────┤  Next.js    │◄────┤   Clerk     │
│  (Browser)  │     │  (Server)   │     │             │
│             │────►│             │────►│             │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │             │
                    │  Supabase   │
                    │  Database   │
                    │             │
                    └─────────────┘
```

### Integración con la Arquitectura Actual

1. **Capa de Presentación**:
   - Componentes de UI de Clerk reemplazan los formularios personalizados
   - Middleware de Clerk reemplaza la protección de rutas personalizada

2. **Capa de Lógica de Negocio**:
   - Hooks de Clerk (`useUser`, `useClerk`, `useAuth`) reemplazan los hooks personalizados
   - Webhooks de Clerk sincronizan datos con Supabase

3. **Capa de Datos**:
   - Supabase sigue siendo la base de datos principal
   - Clerk almacena datos de autenticación y sesiones
   - Se utiliza el ID de usuario de Clerk como clave externa en Supabase

### Flujo de Datos

1. **Registro de Usuario**:
   - Usuario se registra a través de Clerk
   - Clerk crea el usuario y envía un webhook
   - El webhook crea un perfil en Supabase

2. **Inicio de Sesión**:
   - Usuario inicia sesión a través de Clerk
   - Clerk valida credenciales y crea una sesión
   - La aplicación obtiene el token de sesión

3. **Acceso a Datos**:
   - La aplicación utiliza el ID de usuario de Clerk
   - Las consultas a Supabase incluyen el ID de usuario
   - Las políticas RLS de Supabase validan el acceso

## Flujos de Autenticación Detallados

### Registro con Email/Contraseña

```typescript
// Componente de registro
const handleSignUp = async () => {
  try {
    setIsLoading(true)
    setError(null)
    
    // Validar datos del formulario
    if (!email || !password || !name) {
      setError("Todos los campos son obligatorios")
      return
    }
    
    // Crear usuario en Clerk
    await clerk.signUp.create({
      emailAddress: email,
      password,
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' '),
      unsafeMetadata: {
        role: "customer"
      }
    })
    
    // Mostrar mensaje de éxito
    toast.success("Cuenta creada correctamente. Verifica tu correo electrónico.")
    
    // Redirigir a la página de verificación
    router.push("/auth/verify-email")
  } catch (error: any) {
    // Manejar errores específicos
    if (error.errors?.[0]?.code === "form_identifier_exists") {
      setError("Este email ya está registrado")
    } else if (error.errors?.[0]?.code === "form_password_pwned") {
      setError("Esta contraseña no es segura. Por favor, elige otra.")
    } else {
      setError(error.errors?.[0]?.message || "Error al registrarse")
    }
    console.error("Error al registrarse:", error)
  } finally {
    setIsLoading(false)
  }
}
```

### Verificación de Email

Clerk maneja automáticamente la verificación de email. Cuando un usuario se registra, Clerk envía un email de verificación. El usuario debe hacer clic en el enlace para verificar su email.

Para personalizar este flujo:

```typescript
// Página de verificación de email
export default function VerifyEmailPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  
  useEffect(() => {
    // Redirigir si el usuario ya está verificado
    if (isLoaded && isSignedIn && user?.emailAddresses[0]?.verification.status === "verified") {
      router.push("/")
    }
  }, [isLoaded, isSignedIn, user, router])
  
  if (!isLoaded || !isSignedIn) {
    return <div>Cargando...</div>
  }
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Verifica tu email</h1>
      <p>
        Hemos enviado un email de verificación a{" "}
        <strong>{user?.emailAddresses[0]?.emailAddress}</strong>.
      </p>
      <p className="mt-2">
        Haz clic en el enlace del email para verificar tu cuenta.
      </p>
      <Button
        onClick={() => window.location.reload()}
        className="mt-4"
      >
        Ya he verificado mi email
      </Button>
    </div>
  )
}
```

### Recuperación de Contraseña

```typescript
// Componente de recuperación de contraseña
const handleResetPassword = async () => {
  try {
    setIsLoading(true)
    setError(null)
    
    // Validar email
    if (!email) {
      setError("El email es obligatorio")
      return
    }
    
    // Enviar email de recuperación
    await clerk.signIn.create({
      strategy: "reset_password_email_code",
      identifier: email
    })
    
    // Mostrar mensaje de éxito
    toast.success("Hemos enviado un email con instrucciones para recuperar tu contraseña")
    
    // Redirigir a la página de verificación
    router.push("/auth/reset-password-verification")
  } catch (error: any) {
    setError(error.errors?.[0]?.message || "Error al enviar el email de recuperación")
    console.error("Error al enviar email de recuperación:", error)
  } finally {
    setIsLoading(false)
  }
}
```

### Inicio de Sesión con Google

```typescript
const handleGoogleSignIn = async () => {
  try {
    setIsLoading(true)
    setError(null)
    
    // Iniciar flujo de autenticación con Google
    await clerk.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/auth/sso-callback",
      redirectUrlComplete: "/"
    })
    
    // No es necesario hacer nada más aquí, ya que la redirección
    // se maneja automáticamente
  } catch (error: any) {
    setError("Error al iniciar sesión con Google")
    console.error("Error al iniciar sesión con Google:", error)
    setIsLoading(false)
  }
}
```

## Protección de Rutas Avanzada

### Middleware con Protección por Roles

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher, getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Rutas públicas que no requieren autenticación
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/sso-callback',
  '/auth/reset-password',
  '/menu',
  '/menu/:id',
  '/search',
  '/cart',
  '/api/webhook/clerk',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
])

// Rutas que requieren rol de administrador
const isAdminRoute = createRouteMatcher([
  '/admin',
  '/admin/:path*',
  '/api/admin/:path*',
])

// Rutas que requieren rol de staff
const isStaffRoute = createRouteMatcher([
  '/staff',
  '/staff/:path*',
  '/api/staff/:path*',
])

// Rutas que deben ignorarse
const isIgnoredRoute = createRouteMatcher([
  '/_next/:path*',
  '/api/health',
])

export default clerkMiddleware(async (auth, req) => {
  // Ignorar rutas específicas
  if (isIgnoredRoute(req)) {
    return NextResponse.next()
  }

  // Permitir rutas públicas
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Verificar autenticación para rutas protegidas
  const { userId } = auth
  
  if (!userId) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url))
  }

  // Verificar roles para rutas específicas
  if (isAdminRoute(req) || isStaffRoute(req)) {
    try {
      const user = await auth.user
      const role = user?.unsafeMetadata?.role as string | undefined
      
      // Verificar rol de administrador
      if (isAdminRoute(req) && role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
      
      // Verificar rol de staff
      if (isStaffRoute(req) && role !== 'admin' && role !== 'staff') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    } catch (error) {
      console.error('Error al verificar rol:', error)
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### Protección de Rutas API

Para proteger rutas API específicas, puedes usar el helper `auth()` de Clerk:

```typescript
// app/api/protected/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { userId } = auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  
  return NextResponse.json({ message: 'Datos protegidos', userId })
}
```

Para rutas API que requieren roles específicos:

```typescript
// app/api/admin/users/route.ts
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { userId } = auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  
  // Verificar rol de administrador
  const user = await currentUser()
  const role = user?.unsafeMetadata?.role as string | undefined
  
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }
  
  // Lógica para obtener usuarios
  return NextResponse.json({ message: 'Lista de usuarios' })
}
```
