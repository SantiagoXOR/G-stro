"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, VolumeX, Play, CheckCircle, XCircle } from "lucide-react"

/**
 * Componente para probar el sistema de notificaciones de sonido
 * Útil para verificar que el archivo de sonido se carga y reproduce correctamente
 */
export function SoundTest() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [canPlay, setCanPlay] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Inicializar audio
  const initializeAudio = () => {
    try {
      audioRef.current = new Audio("/sounds/notification.mp3")
      audioRef.current.preload = "auto"
      
      audioRef.current.addEventListener('canplaythrough', () => {
        setCanPlay(true)
        setError(null)
      })
      
      audioRef.current.addEventListener('error', (e) => {
        setCanPlay(false)
        setError("No se pudo cargar el archivo de sonido")
        console.error("Error cargando audio:", e)
      })
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
      })
      
    } catch (err) {
      setCanPlay(false)
      setError("Error inicializando audio")
      console.error("Error inicializando audio:", err)
    }
  }

  // Reproducir sonido
  const playSound = async () => {
    if (!audioRef.current) {
      initializeAudio()
      return
    }

    try {
      setIsPlaying(true)
      audioRef.current.currentTime = 0
      await audioRef.current.play()
    } catch (err) {
      setIsPlaying(false)
      setError("Error reproduciendo sonido")
      console.error("Error reproduciendo audio:", err)
    }
  }

  // Detener sonido
  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Prueba de Sonido
        </CardTitle>
        <CardDescription>
          Verifica que el sistema de notificaciones de sonido funcione correctamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado del archivo */}
        <div className="flex items-center gap-2 text-sm">
          {canPlay === null ? (
            <>
              <div className="h-4 w-4 rounded-full bg-gray-300 animate-pulse" />
              <span>Verificando archivo...</span>
            </>
          ) : canPlay ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-700">Archivo cargado correctamente</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">Error cargando archivo</span>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-2">
          <Button
            onClick={initializeAudio}
            variant="outline"
            size="sm"
            disabled={isPlaying}
          >
            Cargar Audio
          </Button>
          
          <Button
            onClick={playSound}
            variant="default"
            size="sm"
            disabled={isPlaying || canPlay === false}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isPlaying ? "Reproduciendo..." : "Probar Sonido"}
          </Button>
          
          {isPlaying && (
            <Button
              onClick={stopSound}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <VolumeX className="h-4 w-4" />
              Detener
            </Button>
          )}
        </div>

        {/* Información */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Archivo: /sounds/notification.mp3</p>
          <p>• Duración: 0.5 segundos</p>
          <p>• Frecuencia: 800 Hz</p>
          <p>• Usado en: Notificaciones de pedidos</p>
        </div>
      </CardContent>
    </Card>
  )
}
