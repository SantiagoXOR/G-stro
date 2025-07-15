'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ClerkTest() {
  const { isLoaded, isSignedIn, signOut } = useAuth()
  const { user } = useUser()

  if (!isLoaded) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Cargando...</CardTitle>
          <CardDescription>Verificando estado de autenticación</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isSignedIn) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>No autenticado</CardTitle>
          <CardDescription>Por favor, inicia sesión para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Usa los botones de autenticación para iniciar sesión con Google.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>¡Autenticación exitosa!</CardTitle>
        <CardDescription>Clerk está funcionando correctamente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Usuario:</p>
          <p className="text-sm text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Nombre:</p>
          <p className="text-sm text-muted-foreground">{user?.fullName || 'No disponible'}</p>
        </div>
        <div>
          <p className="text-sm font-medium">ID:</p>
          <p className="text-sm text-muted-foreground font-mono text-xs">{user?.id}</p>
        </div>
        <Button 
          onClick={() => signOut()} 
          variant="outline" 
          className="w-full"
        >
          Cerrar sesión
        </Button>
      </CardContent>
    </Card>
  )
}
