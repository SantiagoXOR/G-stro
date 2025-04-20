"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { calculateEstimatedDeliveryTime, getDeliveryEstimate } from "@/lib/services/delivery-tracking"

interface DeliveryTimeEstimateProps {
  orderId: string
  orderCreatedAt: string
  className?: string
}

export default function DeliveryTimeEstimate({
  orderId,
  orderCreatedAt,
  className = ""
}: DeliveryTimeEstimateProps) {
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null)
  const [estimatedTime, setEstimatedTime] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar estimación inicial
  useEffect(() => {
    const loadEstimate = async () => {
      try {
        setIsLoading(true)
        const estimate = await getDeliveryEstimate(orderId)
        const { minutes, estimatedTime } = calculateEstimatedDeliveryTime(estimate, orderCreatedAt)
        
        setEstimatedMinutes(minutes)
        setEstimatedTime(estimatedTime)
      } catch (error) {
        console.error("Error al cargar estimación de entrega:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEstimate()
  }, [orderId, orderCreatedAt])

  // Actualizar cuenta regresiva cada minuto
  useEffect(() => {
    if (!estimatedTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const diffMs = estimatedTime.getTime() - now.getTime()
      const minutes = Math.max(0, Math.round(diffMs / 60000))
      
      setEstimatedMinutes(minutes)
    }, 60000)

    return () => clearInterval(interval)
  }, [estimatedTime])

  // Formatear hora estimada
  const formatEstimatedTime = (date: Date) => {
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
        <span className="text-sm">Calculando tiempo de entrega...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 bg-muted/50 p-3 rounded-lg ${className}`}>
      <Clock className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">Tiempo estimado de entrega</p>
        {estimatedMinutes !== null && estimatedTime ? (
          <p className="text-sm text-muted-foreground">
            {estimatedMinutes > 0 ? (
              <>
                <span className="font-medium text-primary">{estimatedMinutes} minutos</span> (aprox. {formatEstimatedTime(estimatedTime)})
              </>
            ) : (
              <span className="font-medium text-green-600">¡Tu pedido está por llegar!</span>
            )}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No disponible</p>
        )}
      </div>
    </div>
  )
}
