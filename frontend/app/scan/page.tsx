"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { QRScanner } from "@/components/qr-scanner"

export default function ScanPage() {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(true)

  // Manejar resultado del escaneo
  const handleScan = (data: string) => {
    try {
      // Verificar si es una URL válida
      const url = new URL(data)
      
      // Redirigir a la URL
      router.push(data)
    } catch (error) {
      console.error("Error al procesar URL:", error)
      setIsScanning(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background pt-4 pb-2 px-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Escanear Mesa</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="max-w-md mx-auto w-full">
          <QRScanner
            onScan={handleScan}
            onClose={() => router.push("/")}
            className="mb-6"
          />
          
          <div className="space-y-4">
            <h2 className="text-lg font-medium">¿Cómo funciona?</h2>
            <ol className="space-y-3 list-decimal pl-5">
              <li>
                <p>Busca el código QR en tu mesa</p>
                <p className="text-sm text-muted-foreground">Cada mesa tiene un código QR único</p>
              </li>
              <li>
                <p>Escanea el código con la cámara</p>
                <p className="text-sm text-muted-foreground">Apunta la cámara directamente al código QR</p>
              </li>
              <li>
                <p>Explora el menú y realiza tu pedido</p>
                <p className="text-sm text-muted-foreground">Tu pedido será enviado directamente a la cocina</p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
