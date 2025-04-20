"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [showAlert, setShowAlert] = useState<boolean>(false)

  useEffect(() => {
    // Función para actualizar el estado de la conexión
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      
      // Mostrar alerta solo cuando cambia a offline
      if (!online) {
        setShowAlert(true)
        // Ocultar la alerta después de 5 segundos
        setTimeout(() => setShowAlert(false), 5000)
      }
    }

    // Verificar el estado inicial
    updateOnlineStatus()

    // Agregar event listeners para cambios en la conexión
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Limpiar event listeners
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // No mostrar nada si está online y no hay alerta
  if (isOnline && !showAlert) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!isOnline && (
        <Alert variant="destructive" className="w-auto max-w-md">
          <WifiOff className="h-4 w-4 mr-2" />
          <AlertDescription>
            No hay conexión a internet. Algunas funciones pueden no estar disponibles.
          </AlertDescription>
        </Alert>
      )}
      {isOnline && showAlert && (
        <Alert className="bg-green-50 text-green-800 border-green-200 w-auto max-w-md">
          <Wifi className="h-4 w-4 mr-2" />
          <AlertDescription>
            Conexión a internet restablecida.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
