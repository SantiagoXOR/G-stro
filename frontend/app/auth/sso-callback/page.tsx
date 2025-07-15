'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useClerk } from '@clerk/nextjs'
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

function SSOCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleRedirectCallback } = useClerk()

  useEffect(() => {
    // Manejar la redirección de OAuth
    const handleCallback = async () => {
      try {
        // Verificar si hay un error en los parámetros de búsqueda
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          console.error('Error en el callback de SSO:', error, errorDescription)
          router.push(`/auth/sign-in?error=${encodeURIComponent(errorDescription || error)}`)
          return
        }

        // Procesar el callback de OAuth con Clerk
        await handleRedirectCallback({
          redirectUrl: "/auth/sso-callback",
          afterSignInUrl: "/",
          afterSignUpUrl: "/",
        })
} catch (error) {
        console.error("Error al procesar el callback de OAuth:", error)
       // Redirigir a la página de inicio de sesión con mensaje de error
       const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
       router.push(`/auth/sign-in?error=${encodeURIComponent(errorMessage)}`)
      }
    }

    handleCallback()
  }, [handleRedirectCallback, router, searchParams])

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
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          <h1 className="text-xl font-semibold mb-2">Procesando autenticación...</h1>
          <p className="text-center text-muted-foreground">
            Serás redirigido automáticamente.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente principal con Suspense boundary
export default function SSOCallbackPage() {
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
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <h1 className="text-xl font-semibold mb-2">Cargando...</h1>
            <p className="text-center text-muted-foreground">
              Preparando autenticación...
            </p>
          </CardContent>
        </Card>
      </div>
    }>
      <SSOCallbackContent />
    </Suspense>
  )
}
