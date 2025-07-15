"use client"

import { useEffect, useState, Suspense } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useClerk } from "@clerk/nextjs"

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "verified" | "error">("loading")
  const [message, setMessage] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const clerk = useClerk()

  // Función para reenviar el correo de verificación
  const handleResendVerification = async () => {
    if (!email) {
      setMessage("Por favor, ingresa tu dirección de correo electrónico.")
      return
    }

    setIsResending(true)
    setResendSuccess(false)

    try {
      // Intentar reenviar el correo de verificación
      const signUp = clerk.client?.signUp
      if (signUp) {
        await signUp.prepareEmailAddressVerification({
          strategy: "email_link",
          redirectUrl: `${window.location.origin}/auth/verify-email`,
        })
      }

      setResendSuccess(true)
      setMessage("Hemos enviado un nuevo enlace de verificación a tu correo electrónico.")
    } catch (error) {
      console.error("Error al reenviar el correo de verificación:", error)
      setMessage("No pudimos enviar el correo de verificación. Por favor, verifica que la dirección sea correcta.")
    } finally {
      setIsResending(false)
    }
  }

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Verificar si hay un token en la URL
        const token = searchParams.get("token")

        // Obtener el email de los parámetros de búsqueda (si existe)
        const emailParam = searchParams.get("email")
        if (emailParam) {
          setEmail(emailParam)
        }

        if (!token) {
          // Si no hay token, mostrar mensaje de verificación pendiente
          setStatus("loading")
          setMessage("Por favor, verifica tu correo electrónico para continuar. Hemos enviado un enlace de verificación a tu dirección de correo.")
          return
        }

        // Intentar verificar el email con Clerk
        try {
          const signUp = clerk.client?.signUp
          if (signUp) {
            await signUp.attemptEmailAddressVerification({ code: token })
          }
          setStatus("verified")
          setMessage("¡Tu correo electrónico ha sido verificado correctamente!")

          // Redirigir después de 3 segundos
          setTimeout(() => {
            router.push("/")
          }, 3000)
        } catch (error) {
          console.error("Error al verificar el email:", error)
          setStatus("error")
          setMessage("No pudimos verificar tu correo electrónico. El enlace puede haber expirado o ser inválido.")
        }
      } catch (error) {
        console.error("Error inesperado:", error)
        setStatus("error")
        setMessage("Ocurrió un error inesperado. Por favor, intenta nuevamente.")
      }
    }

    verifyEmail()
  }, [searchParams, clerk.client, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="mb-8">
        <Image
          src="/logo-complete.svg"
          alt="Gëstro Logo"
          width={180}
          height={48}
          className="object-contain"
        />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Verificación de Email</CardTitle>
          <CardDescription className="text-center">
            {status === "loading" && "Verificando tu dirección de correo electrónico"}
            {status === "verified" && "¡Verificación exitosa!"}
            {status === "error" && "Error de verificación"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === "loading" && (
            <div className="text-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">{message}</p>

              {/* Formulario para reenviar el correo de verificación */}
              <div className="mt-6 max-w-sm mx-auto">
                <div className="space-y-4">
                  <div className="text-sm font-medium text-center">
                    ¿No recibiste el correo de verificación?
                  </div>

                  <div className="flex flex-col space-y-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ingresa tu correo electrónico"
                      className="px-3 py-2 border border-border rounded-md text-sm"
                      disabled={isResending}
                    />

                    <Button
                      onClick={handleResendVerification}
                      disabled={isResending || !email}
                      className="mt-2"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Reenviar correo de verificación"
                      )}
                    </Button>
                  </div>

                  {resendSuccess && (
                    <div className="text-sm text-green-600 text-center">
                      Hemos enviado un nuevo enlace de verificación a tu correo electrónico.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === "verified" && (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm mt-4">Serás redirigido automáticamente en unos segundos...</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <p className="text-muted-foreground">{message}</p>

              <div className="mt-6">
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending || !email}
                  variant="outline"
                  className="mt-2"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Intentar nuevamente"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === "loading" && (
            <Button variant="ghost" asChild>
              <Link href="/auth/sign-in">Volver a iniciar sesión</Link>
            </Button>
          )}

          {status === "error" && (
            <Button asChild>
              <Link href="/auth/sign-in">Volver a iniciar sesión</Link>
            </Button>
          )}

          {status === "verified" && (
            <Button asChild>
              <Link href="/">Ir a la página principal</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

// Componente principal con Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <div className="mb-8">
          <Image
            src="/logo-complete.svg"
            alt="Gëstro Logo"
            width={180}
            height={48}
            className="object-contain"
          />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Verificación de Email</CardTitle>
            <CardDescription className="text-center">
              Cargando...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Preparando verificación...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
