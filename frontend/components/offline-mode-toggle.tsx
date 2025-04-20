"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { isInOfflineMode, toggleOfflineMode, initOfflineMode } from "@/lib/offline-mode"

export function OfflineModeToggle() {
  const [isOffline, setIsOffline] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Inicializar el modo offline
    initOfflineMode()
    
    // Verificar el estado inicial
    setIsOffline(isInOfflineMode())
    
    // Escuchar cambios en el modo offline
    const handleOfflineModeChange = (event: Event) => {
      const customEvent = event as CustomEvent
      setIsOffline(customEvent.detail.isOffline)
    }
    
    // Escuchar cambios en la conexión
    const handleOnlineStatusChange = () => {
      setIsOffline(isInOfflineMode())
    }
    
    window.addEventListener('offlinemodechange', handleOfflineModeChange)
    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)
    
    return () => {
      window.removeEventListener('offlinemodechange', handleOfflineModeChange)
      window.removeEventListener('online', handleOnlineStatusChange)
      window.removeEventListener('offline', handleOnlineStatusChange)
    }
  }, [])
  
  const handleToggle = () => {
    const newState = toggleOfflineMode()
    setIsOffline(newState)
  }
  
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsVisible(true)}
          className={isOffline ? "bg-amber-100 text-amber-900 border-amber-300" : ""}
        >
          {isOffline ? <WifiOff className="h-4 w-4 mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
          {isOffline ? "Modo Offline" : "Modo Online"}
        </Button>
      </div>
    )
  }
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="w-72">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex justify-between">
            <span>Modo de Conexión</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="offline-mode" 
              checked={isOffline}
              onCheckedChange={handleToggle}
            />
            <Label htmlFor="offline-mode" className="flex items-center">
              {isOffline ? (
                <>
                  <WifiOff className="h-4 w-4 mr-2 text-amber-500" />
                  <span>Modo Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2 text-green-500" />
                  <span>Modo Online</span>
                </>
              )}
            </Label>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {isOffline ? (
              <p>
                Modo offline activado. La aplicación usará datos de ejemplo y no intentará
                conectarse al servidor.
              </p>
            ) : (
              <p>
                Modo online activado. La aplicación intentará conectarse al servidor para
                obtener datos en tiempo real.
              </p>
            )}
          </div>
          
          {!navigator.onLine && !isOffline && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              <p className="font-semibold">¡Advertencia!</p>
              <p>
                No hay conexión a internet, pero el modo offline no está activado.
                Algunas funciones pueden no estar disponibles.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
