"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { generateCodeVerifier, saveCodeVerifier } from "@/lib/supabase"

export default function RecoveryPage() {
  const [status, setStatus] = useState<string>("Intentando recuperar la sesión...")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Obtener el código y state de la URL
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  useEffect(() => {
    const recoverSession = async () => {
      if (!code) {
        setError("No se proporcionó código de autorización")
        setIsLoading(false)
        return
      }

      try {
        setStatus("Generando nuevo code_verifier...")

        // Generar un nuevo code_verifier
        const newCodeVerifier = generateCodeVerifier()
        saveCodeVerifier(newCodeVerifier)

        // Esperar un momento para asegurarse de que el code_verifier se guarde correctamente
        await new Promise(resolve => setTimeout(resolve, 500))

        // Verificar que el code_verifier se haya guardado correctamente
        const storedCodeVerifier = localStorage.getItem('supabase.auth.code_verifier')
        if (!storedCodeVerifier) {
          console.error("El code_verifier no se guardó correctamente")
          // Intentar guardar nuevamente en diferentes ubicaciones
          localStorage.setItem('supabase.auth.code_verifier', newCodeVerifier)
          localStorage.setItem('sb-code-verifier', newCodeVerifier)
          localStorage.setItem('supabase-auth-code-verifier', newCodeVerifier)
          sessionStorage.setItem('supabase.auth.code_verifier', newCodeVerifier)
        }

        setStatus("Intentando intercambiar código por sesión...")

        // Intentar intercambiar el código por una sesión
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error("Error al recuperar la sesión:", error)

          // Si el error es sobre flow state o code_verifier, intentar soluciones alternativas
          if (error.message.includes('invalid flow state') ||
              error.message.includes('both auth code and code verifier should be non-empty')) {
            setStatus("Intentando solución alternativa...")

            // Intentar autenticación alternativa a través del servidor
            try {
              const response = await fetch(`/api/auth/callback-handler?code=${code}${state ? `&state=${state}` : ''}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              })

              const responseData = await response.json()

              if (responseData.error) {
                console.error('Error en autenticación alternativa:', responseData.error)

                // Si la API falla, intentar una solución más drástica
                setStatus("Intentando reiniciar el flujo de autenticación...")

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

                // Generar y guardar un nuevo code_verifier
                const newerCodeVerifier = generateCodeVerifier()
                saveCodeVerifier(newerCodeVerifier)

                // Si hay un state en la URL, guardarlo también
                if (state) {
                  saveFlowState(state)
                }

                // Esperar un momento para asegurar que todo se guarde correctamente
                await new Promise(resolve => setTimeout(resolve, 500))

                // Intentar nuevamente con el nuevo code_verifier
                setStatus("Reintentando con nuevo code_verifier...")
                const { data: retryData, error: retryError } = await supabase.auth.exchangeCodeForSession(code)

                if (retryError) {
                  console.error("Error en reintento final:", retryError)
                  setError(`Error en recuperación final: ${retryError.message}`)
                  setIsLoading(false)
                  return
                }

                setStatus("Sesión recuperada exitosamente después de reintentos")

                // Redirigir a la página principal después de un breve retraso
                setTimeout(() => {
                  window.location.href = '/'
                }, 1500)
                return
              }

              if (responseData.success) {
                console.log('Autenticación alternativa exitosa')
                setStatus("Autenticación alternativa exitosa")

                // Redirigir a la página principal después de un breve retraso
                setTimeout(() => {
                  window.location.href = '/'
                }, 1500)
                return
              }
            } catch (altErr) {
              console.error('Error en autenticación alternativa:', altErr)
            }
          }

          setError(`Error al recuperar la sesión: ${error.message}`)
          setIsLoading(false)
          return
        }

        setStatus("Sesión recuperada exitosamente")

        // Redirigir a la página principal después de un breve retraso
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } catch (err) {
        console.error("Error inesperado:", err)
        setError(`Error inesperado: ${err}`)
        setIsLoading(false)
      }
    }

    recoverSession()
  }, [code, state, router])

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Recuperando Sesión</CardTitle>
          <CardDescription>
            Estamos intentando recuperar tu sesión de autenticación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-center">{status}</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!isLoading && (
            <Button onClick={() => router.push("/auth/login")} variant="outline">
              Volver a Iniciar Sesión
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
