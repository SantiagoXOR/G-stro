"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function NetworkStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Intentar una operación simple para verificar la conexión
        const { error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error al verificar la conexión con Supabase:', error)
          setStatus('error')
          setErrorMessage(`Error de conexión: ${error.message}`)
          return
        }
        
        setStatus('connected')
      } catch (err) {
        console.error('Error inesperado al verificar la conexión:', err)
        setStatus('error')
        if (err instanceof Error) {
          setErrorMessage(`Error de red: ${err.message}`)
        } else {
          setErrorMessage('No se pudo conectar con el servidor. Verifica tu conexión a internet.')
        }
      }
    }

    checkConnection()
  }, [])

  if (status === 'checking') {
    return <div className="text-sm text-gray-500">Verificando conexión...</div>
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{errorMessage || 'Error de conexión con el servidor'}</AlertDescription>
      </Alert>
    )
  }

  return null
}
