"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { Order } from "@/lib/services/orders"
import { useRouter } from "next/navigation"

// Simulación de notificaciones de pedidos
export function OrderNotifications() {
  const { user } = useUser()
  const router = useRouter()
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    // Simulación de notificaciones de pedidos
    // En una implementación real, esto se conectaría a un sistema de notificaciones en tiempo real
    console.log('Simulando suscripción a notificaciones de pedidos para el usuario:', user.id)

    // Simulación de notificaciones periódicas para demostración
    const simulateNotification = () => {
      // Generar un ID de pedido aleatorio si no hay uno
      const orderId = lastOrderId || `order-${Math.random().toString(36).substring(2, 10)}`

      // Guardar el ID para futuras notificaciones
      if (!lastOrderId) {
        setLastOrderId(orderId)
      }

      // Estados posibles de un pedido
      const statuses = ['preparing', 'ready', 'delivered', 'cancelled']

      // Seleccionar un estado aleatorio
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

      // Simular un pedido actualizado
      const updatedOrder = {
        id: orderId,
        status: randomStatus,
        customer_id: user.id,
        // Otros campos que pueda tener un pedido...
      } as Order

      // Mostrar notificación según el estado simulado
      switch (updatedOrder.status) {
        case 'preparing':
          toast.info("Tu pedido está siendo preparado", {
            description: `Pedido #${updatedOrder.id.substring(0, 8)}`,
            action: {
              label: "Ver",
              onClick: () => router.push(`/orders/${updatedOrder.id}`)
            }
          })
          break
        case 'ready':
          toast.success("¡Tu pedido está listo!", {
            description: `Pedido #${updatedOrder.id.substring(0, 8)}`,
            action: {
              label: "Ver",
              onClick: () => router.push(`/orders/${updatedOrder.id}`)
            }
          })
          break
        case 'delivered':
          toast.success("Tu pedido ha sido entregado", {
            description: `Pedido #${updatedOrder.id.substring(0, 8)}`,
            action: {
              label: "Ver",
              onClick: () => router.push(`/orders/${updatedOrder.id}`)
            }
          })
          break
        case 'cancelled':
          toast.error("Tu pedido ha sido cancelado", {
            description: `Pedido #${updatedOrder.id.substring(0, 8)}`,
            action: {
              label: "Ver",
              onClick: () => router.push(`/orders/${updatedOrder.id}`)
            }
          })
          break
      }
    }

    // Comentado para evitar notificaciones molestas durante el desarrollo
    // const interval = setInterval(simulateNotification, 60000) // Cada minuto

    // Limpiar intervalo al desmontar
    return () => {
      // clearInterval(interval)
      console.log('Limpiando simulación de notificaciones')
    }
  }, [user, router, lastOrderId])

  // Este componente no renderiza nada, solo maneja las notificaciones
  return null
}
