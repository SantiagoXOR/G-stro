"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { signInWithEmail } from "@/lib/auth"
import { supabase, startOAuthFlow } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Obtener el error de la URL si existe
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  // Si hay un error en la URL, mostrarlo
  useEffect(() => {
    if (urlError) {
      const decodedError = decodeURIComponent(urlError)
      console.error('Error de autenticación:', decodedError)

      // Formatear mensajes de error comunes para hacerlos más amigables
      if (decodedError.includes('invalid request: both auth code and code verifier should be non-empty')) {
        setError('Error en el proceso de autenticación con Google. Por favor, intente nuevamente.')
      } else if (decodedError.includes('No se proporcion')) {
        setError('No se pudo completar la autenticación. Por favor, intente nuevamente.')
      } else {
        setError(decodedError)
      }

      // Desactivar el estado de carga si estaba activo
      setIsLoading(false)
    }
  }, [urlError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      console.log('Iniciando sesión con email:', email)
      const { error } = await signInWithEmail(email, password)

      if (error) {
        console.error('Error al iniciar sesión:', error)
        setError(error.message || "Error al iniciar sesión")
        return
      }

      console.log('Inicio de sesión exitoso, redirigiendo...')
      // Redirigir al usuario a la página principal
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error('Error inesperado al iniciar sesión:', err)
      setError("Ocurrió un error inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="/auth/reset-password" className="text-sm text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
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
                setIsLoading(true)
                try {
                  // Usar directamente la API de Supabase para la autenticación con Google
                  // Siempre usar la URL de callback local para desarrollo
                  const redirectTo = `${window.location.origin}/auth/callback`;

                  console.log('URL de redirección:', redirectTo);

                  // Limpiar cualquier sesión anterior para evitar problemas
                  await supabase.auth.signOut();

                  // Verificar el estado actual del localStorage antes de iniciar la autenticación
                  console.log('Estado de localStorage antes de iniciar autenticación:')
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)
                    console.log(`- ${key}: ${key && localStorage.getItem(key) ? 'tiene valor' : 'vacío'}`)
                  }

                  // Guardar una marca de tiempo para depuración
                  localStorage.setItem('auth_google_start_time', new Date().toISOString())

                  // Limpiar localStorage y sessionStorage de valores relacionados con el flujo
                  const projectRef = window.location.hostname.includes('localhost')
                    ? 'localhost'
                    : window.location.hostname.split('.')[0]

                  // Limpiar todas las posibles claves relacionadas con el flujo
                  const keysToRemove = [
                    'supabase.auth.flow-state',
                    `sb-${projectRef}-auth-flow-state`,
                    'supabase.auth.code_verifier',
                    'supabase-auth-code-verifier-backup',
                    'sb-code-verifier',
                    `sb-${projectRef}-auth-code-verifier`
                  ]

                  keysToRemove.forEach(key => {
                    localStorage.removeItem(key)
                    sessionStorage.removeItem(key)
                  })

                  // Usar nuestra función mejorada para iniciar el flujo de autenticación
                  console.log('Iniciando flujo de autenticación con Google...')
                  const { success, data, error } = await startOAuthFlow('google', {
                    // Asegurarse de que la URL de redirección sea correcta
                    redirectTo: redirectTo,
                    // Solicitar scopes adicionales si es necesario
                    scopes: 'email profile openid',
                  })

                  // Verificar si se generó un code_verifier
                  const codeVerifier = localStorage.getItem('supabase.auth.code_verifier')
                  console.log('Code verifier generado:', codeVerifier ? 'Sí' : 'No')

                  if (!success || error) {
                    throw error || new Error('Error al iniciar el flujo de autenticación')
                  }

                  // Guardar información adicional para depuración
                  if (data?.url) {
                    console.log('URL de OAuth generada:', data.url.substring(0, 50) + '...')

                    // Extraer y guardar el state de la URL
                    const url = new URL(data.url)
                    const state = url.searchParams.get('state')
                    if (state) {
                      console.log('Estado del flujo en URL:', state.substring(0, 10) + '...')
                    }
                  }

                  // La redirección ocurre automáticamente
                  console.log('Autenticación con Google iniciada correctamente')
                } catch (err) {
                  console.error('Error al iniciar sesión con Google:', err)
                  setError('Error al iniciar sesión con Google')
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
            ¿No tienes una cuenta?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Regístrate
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
