# Ejemplos de Uso de Clerk en Componentes de Gëstro

Este documento proporciona ejemplos prácticos de cómo utilizar Clerk directamente en diferentes componentes de la aplicación Gëstro, sin depender de la capa de compatibilidad.

## 1. Obtener Información del Usuario Actual

### Ejemplo con la Capa de Compatibilidad
```tsx
import { useAuth } from "@/lib/clerk-client"

function ProfileComponent() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <div>Cargando...</div>
  
  return (
    <div>
      <h1>Bienvenido, {user?.user_metadata?.name || 'Usuario'}</h1>
      <p>Email: {user?.email}</p>
      <p>Rol: {user?.app_metadata?.role || 'cliente'}</p>
    </div>
  )
}
```

### Ejemplo con Clerk Directamente
```tsx
import { useUser } from "@clerk/nextjs"

function ProfileComponent() {
  const { user, isLoaded } = useUser()
  
  if (!isLoaded) return <div>Cargando...</div>
  
  return (
    <div>
      <h1>Bienvenido, {user?.fullName || 'Usuario'}</h1>
      <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
      <p>Rol: {user?.unsafeMetadata?.role || 'cliente'}</p>
    </div>
  )
}
```

## 2. Iniciar Sesión con Email y Contraseña

### Ejemplo con la Capa de Compatibilidad
```tsx
import { useState } from "react"
import { useAuth } from "@/lib/clerk-client"
import { useRouter } from "next/navigation"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("Error al iniciar sesión")
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
    </form>
  )
}
```

### Ejemplo con Clerk Directamente
```tsx
import { useState } from "react"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })
      
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else {
        setError("Error al iniciar sesión")
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Error al iniciar sesión")
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
    </form>
  )
}
```

## 3. Registrar un Nuevo Usuario

### Ejemplo con la Capa de Compatibilidad
```tsx
import { useState } from "react"
import { useAuth } from "@/lib/clerk-client"
import { useRouter } from "next/navigation"

function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { signUp } = useAuth()
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await signUp(email, password, {
        options: {
          data: {
            name,
            role: 'customer'
          }
        }
      })
      
      if (error) {
        setError(error.message)
      } else {
        router.push("/auth/verify-email")
      }
    } catch (err) {
      setError("Error al registrarse")
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
    </form>
  )
}
```

### Ejemplo con Clerk Directamente
```tsx
import { useState } from "react"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { isLoaded, signUp } = useSignUp()
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    
    try {
      // Dividir el nombre en nombre y apellido
      const nameParts = name.split(" ")
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(" ")
      
      // Crear el usuario
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          role: 'customer'
        }
      })
      
      // Preparar la verificación de email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code"
      })
      
      router.push("/auth/verify-email")
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Error al registrarse")
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
    </form>
  )
}
```

## 4. Iniciar Sesión con Google

### Ejemplo con la Capa de Compatibilidad
```tsx
import { useAuth } from "@/lib/clerk-client"

function GoogleSignInButton() {
  const { signInWithGoogle } = useAuth()
  
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      // La redirección ocurrirá automáticamente
    } catch (err) {
      console.error("Error al iniciar sesión con Google:", err)
    }
  }
  
  return (
    <button onClick={handleGoogleSignIn}>
      Iniciar sesión con Google
    </button>
  )
}
```

### Ejemplo con Clerk Directamente
```tsx
import { useSignIn } from "@clerk/nextjs"

function GoogleSignInButton() {
  const { isLoaded, signIn } = useSignIn()
  
  const handleGoogleSignIn = async () => {
    if (!isLoaded) return
    
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth/sso-callback",
        redirectUrlComplete: "/"
      })
    } catch (err) {
      console.error("Error al iniciar sesión con Google:", err)
    }
  }
  
  return (
    <button onClick={handleGoogleSignIn}>
      Iniciar sesión con Google
    </button>
  )
}
```

## 5. Cerrar Sesión

### Ejemplo con la Capa de Compatibilidad
```tsx
import { useAuth } from "@/lib/clerk-client"
import { useRouter } from "next/navigation"

function LogoutButton() {
  const { signOut } = useAuth()
  const router = useRouter()
  
  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/auth/sign-in")
    } catch (err) {
      console.error("Error al cerrar sesión:", err)
    }
  }
  
  return (
    <button onClick={handleLogout}>
      Cerrar sesión
    </button>
  )
}
```

### Ejemplo con Clerk Directamente
```tsx
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

function LogoutButton() {
  const { signOut } = useClerk()
  const router = useRouter()
  
  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/auth/sign-in")
    } catch (err) {
      console.error("Error al cerrar sesión:", err)
    }
  }
  
  return (
    <button onClick={handleLogout}>
      Cerrar sesión
    </button>
  )
}
```

## 6. Verificar si el Usuario está Autenticado

### Ejemplo con la Capa de Compatibilidad
```tsx
import { useAuth } from "@/lib/clerk-client"

function ProtectedComponent() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return <div>Cargando...</div>
  }
  
  if (!user) {
    return <div>Debes iniciar sesión para ver este contenido</div>
  }
  
  return (
    <div>Contenido protegido</div>
  )
}
```

### Ejemplo con Clerk Directamente
```tsx
import { useAuth } from "@clerk/nextjs"

function ProtectedComponent() {
  const { isLoaded, isSignedIn } = useAuth()
  
  if (!isLoaded) {
    return <div>Cargando...</div>
  }
  
  if (!isSignedIn) {
    return <div>Debes iniciar sesión para ver este contenido</div>
  }
  
  return (
    <div>Contenido protegido</div>
  )
}
```
