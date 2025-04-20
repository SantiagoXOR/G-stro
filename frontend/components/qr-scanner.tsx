"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, Camera, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface QRScannerProps {
  onScan?: (data: string) => void
  onClose?: () => void
  className?: string
}

export function QRScanner({ onScan, onClose, className = "" }: QRScannerProps) {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState(false)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scannerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Verificar si hay cámara disponible
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === "videoinput")
        setHasCamera(videoDevices.length > 0)
      } catch (error) {
        console.error("Error al verificar cámaras:", error)
        setHasCamera(false)
      }
    }

    checkCamera()
  }, [])

  // Iniciar/detener escáner
  useEffect(() => {
    if (isScanning) {
      startScanner()
    } else {
      stopScanner()
    }

    return () => {
      stopScanner()
    }
  }, [isScanning])

  // Iniciar escáner
  const startScanner = async () => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      // Solicitar permisos de cámara
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })

      // Guardar estado de permisos
      setHasCameraPermission(true)

      // Configurar video
      videoRef.current.srcObject = stream
      await videoRef.current.play()

      // Cargar biblioteca de escaneo QR
      const jsQR = (await import("jsqr")).default

      // Iniciar bucle de escaneo
      scannerIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return

        const canvas = canvasRef.current
        const video = videoRef.current
        const context = canvas.getContext("2d")

        if (!context) return

        // Ajustar tamaño del canvas al video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Dibujar frame actual en el canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Obtener datos de imagen
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

        // Escanear código QR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        })

        // Si se encuentra un código QR
        if (code) {
          // Detener escáner
          stopScanner()

          // Procesar resultado
          handleScanResult(code.data)
        }
      }, 200)
    } catch (error) {
      console.error("Error al iniciar escáner:", error)
      setHasCameraPermission(false)
      toast.error("No se pudo acceder a la cámara")
    }
  }

  // Detener escáner
  const stopScanner = () => {
    // Detener intervalo de escaneo
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current)
      scannerIntervalRef.current = null
    }

    // Detener stream de video
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }

    // Actualizar estado
    setIsScanning(false)
  }

  // Procesar resultado del escaneo
  const handleScanResult = (data: string) => {
    try {
      // Verificar si es una URL válida
      const url = new URL(data)

      // Verificar si es una URL de mesa
      const tableParam = url.searchParams.get("table")

      if (tableParam) {
        // Si hay un callback, llamarlo
        if (onScan) {
          onScan(data)
        } else {
          // Si no hay callback, redirigir a la URL
          router.push(data)
        }

        toast.success("Mesa escaneada correctamente")
      } else {
        // Si no es una URL de mesa, mostrar mensaje
        toast.error("El código QR no corresponde a una mesa")

        // Reiniciar escáner
        setIsScanning(true)
      }
    } catch (error) {
      console.error("Error al procesar código QR:", error)
      toast.error("El código QR no es válido")

      // Reiniciar escáner
      setIsScanning(true)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isScanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full hidden"
              />
              <div className="absolute inset-0 border-2 border-primary/50 rounded-lg m-4"></div>
              <div className="absolute top-4 right-4">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={() => stopScanner()}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-sm text-peach-cream-50 bg-black/50 mx-auto py-1 px-3 rounded-full inline-block backdrop-blur-sm">
                  Apunta a un código QR de mesa
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium text-lg mb-1">Escanear código QR</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Escanea el código QR de tu mesa para realizar un pedido
              </p>
              <Button
                onClick={() => setIsScanning(true)}
                disabled={!hasCamera}
                className="w-full"
              >
                <Camera className="h-4 w-4 mr-2" />
                {hasCameraPermission === false
                  ? "Permitir acceso a la cámara"
                  : "Iniciar escáner"}
              </Button>
              {!hasCamera && (
                <p className="text-xs text-red-500 mt-2">
                  No se detectó ninguna cámara en tu dispositivo
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {onClose && (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}
