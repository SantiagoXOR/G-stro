"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useClerk } from "@clerk/nextjs"

function ResetPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const clerk = useClerk()

  // Verificar si hay un token en la URL (para restablecer la contraseña)
  const token = searchParams.get("token")

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await clerk.client.signIn.create({
        identifier: email,
        strategy: 'reset_password_email_code',
      })

      setSuccess(true)
    } catch (error: any) {
      console.error("Error al enviar el correo de restablecimiento:", error)
      setError("Si existe una cuenta con ese correo, recibirás instrucciones para restablecer tu contraseña")
    } finally {
      setIsLoading(false)
    }
  }

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
          <CardTitle className="text-2xl text-center">Restablecer contraseña</CardTitle>
          <CardDescription className="text-center">
            {token
              ? "Ingresa tu nueva contraseña"
              : "Te enviaremos un correo para restablecer tu contraseña"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            // Formulario para solicitar el restablecimiento
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || success}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              {success ? (
                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
                  Hemos enviado un correo electrónico con instrucciones para restablecer tu contraseña.
                  Por favor, revisa tu bandeja de entrada.
                </div>
              ) : (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar instrucciones"
                  )}
                </Button>
              )}
            </form>
          ) : (
            // Redirect to Clerk's reset page or implement reset form
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                Redirigiendo a la página de restablecimiento...
              </p>
              {/* Redirect using useEffect */}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/auth/sign-in" className="text-primary hover:underline">
              Volver a iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
