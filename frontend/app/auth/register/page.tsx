"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { NetworkStatus } from "@/components/network-status"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const { signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsLoading(true)

    // Verificar conexión a internet
    if (!navigator.onLine) {
      setError("No hay conexión a internet. Verifica tu conexión y vuelve a intentarlo.")
      setIsLoading(false)
      return
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      console.log('Intentando registrar usuario:', { email })

      // Intentar el registro con reintentos
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;

      while (attempts < maxAttempts) {
        try {
          const { data, error } = await signUp(email, password)

          if (error) {
            console.error(`Intento ${attempts + 1}: Error de Supabase durante el registro:`, error)
            lastError = error;
            attempts++;

            // Si es un error de red, esperar antes de reintentar
            if (error.message && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('conexión'))) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
              continue;
            } else if (error.message && error.message.includes('Database error saving new user')) {
              // Error específico del servidor de Supabase
              setError("Error en el servidor de Supabase. Por favor, intenta usar el modo offline o contacta al administrador.")
              setIsLoading(false)
              return;
            } else {
              // Si es otro tipo de error (validación, etc.), no reintentar
              setError(error.message || "Error al registrarse")
              setIsLoading(false)
              return;
            }
          }

          // Si llegamos aquí, el registro fue exitoso
          console.log('Registro exitoso:', data)
          setSuccessMessage("Registro exitoso. Por favor, verifica tu correo electrónico para confirmar tu cuenta.")

          // Redirigir al usuario a la página de inicio de sesión después de un breve retraso
          setTimeout(() => {
            router.push("/auth/login")
          }, 3000)

          setIsLoading(false)
          return;
        } catch (retryError) {
          console.error(`Intento ${attempts + 1}: Error inesperado durante el registro:`, retryError)
          lastError = retryError;
          attempts++;

          // Esperar antes de reintentar
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
          }
        }
      }

      // Si llegamos aquí, todos los intentos fallaron
      if (lastError instanceof Error) {
        setError(`Error después de ${maxAttempts} intentos: ${lastError.message}`)
      } else if (lastError instanceof Response) {
        setError(`Error de red después de ${maxAttempts} intentos: ${lastError.status} ${lastError.statusText}`)
      } else if (lastError && typeof lastError === 'object' && 'message' in lastError) {
        setError(`Error después de ${maxAttempts} intentos: ${lastError.message}`)
      } else {
        setError(`Ocurrió un error inesperado después de ${maxAttempts} intentos. Verifica tu conexión a internet.`)
      }
    } catch (err) {
      console.error('Error inesperado durante el registro:', err)
      // Mostrar un mensaje de error más detallado
      if (err instanceof Error) {
        setError(`Error: ${err.message}`)
      } else if (err instanceof Response) {
        setError(`Error de red: ${err.status} ${err.statusText}`)
      } else {
        setError("Ocurrió un error inesperado. Verifica tu conexión a internet.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para registrarte
          </CardDescription>
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
            <p className="font-semibold">Nota:</p>
            <p>
              Si tienes problemas para registrarte, puedes activar el modo offline haciendo clic en el botón "Modo Online" en la esquina inferior izquierda.
              En modo offline, usa cualquier correo con la contraseña "offline".
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!error && !successMessage && (
              <NetworkStatus />
            )}
            {successMessage && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  O continuar con
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={async () => {
                setError(null)
                setSuccessMessage(null)
                setIsLoading(true)
                try {
                  const { error } = await signInWithGoogle()
                  if (error) {
                    setError(error.message || "Error al iniciar sesión con Google")
                  }
                } catch (err) {
                  setError("Error al iniciar sesión con Google")
                  console.error(err)
                } finally {
                  setIsLoading(false)
                }
              }}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
