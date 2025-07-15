"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/clerk-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AuthStatus() {
  const { user, signOut } = useAuth()
  const [profileStatus, setProfileStatus] = useState<string>("Verificando...")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      checkProfileStatus()
    } else {
      setProfileStatus("No hay sesión activa")
    }
  }, [user])

  const checkProfileStatus = async () => {
    if (!user) return

    try {
      setProfileStatus("Verificando perfil...")

      // Simulamos una verificación de perfil
      await new Promise(resolve => setTimeout(resolve, 500))

      // En una implementación real, aquí se verificaría el perfil en la base de datos
      // Por ahora, simplemente asumimos que el perfil existe si el usuario está autenticado
      if (user) {
        setProfileStatus("Perfil encontrado")
      } else {
        setProfileStatus("Perfil no encontrado")
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setProfileStatus(`Error inesperado: ${err}`)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Estado de Autenticación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Usuario:</span> {user ? user.email : 'No autenticado'}
          </div>
          <div>
            <span className="font-semibold">ID:</span> {user ? user.id.substring(0, 8) + '...' : 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Estado del perfil:</span>{' '}
            <span className={
              profileStatus.includes('Error')
                ? 'text-red-500'
                : profileStatus === 'Perfil encontrado'
                  ? 'text-green-500'
                  : 'text-amber-500'
            }>
              {profileStatus}
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          {user ? (
            <>
              <Button
                onClick={checkProfileStatus}
                variant="outline"
                size="sm"
              >
                Verificar perfil
              </Button>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="default" size="sm">
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/register">Registrarse</Link>
              </Button>
            </>
          )}
          <Button asChild variant="link" size="sm">
            <Link href="/auth/debug">Diagnóstico de autenticación</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
