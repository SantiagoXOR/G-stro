"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Order } from "@/lib/services/orders"
import { useRouter } from "next/navigation"

export function OrderNotifications() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) return

    // Suscribirse a cambios en los pedidos del usuario
    const subscription = supabase
      .channel('order-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedOrder = payload.new as Order
          
          // Mostrar notificación según el estado actualizado
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
      )
      .subscribe()

    // Limpiar suscripción al desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [user, router])

  // Este componente no renderiza nada, solo maneja las notificaciones
  return null
}
