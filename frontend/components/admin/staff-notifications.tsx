"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Order } from "@/lib/services/orders"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { OrderStatusBadge } from "@/components/ui/order-status-badge"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  orderId?: string
  status?: Order["status"]
  timestamp: Date
  read: boolean
}

export function StaffNotifications() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(true)
  const [playSounds, setPlaySounds] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Inicializar audio
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.mp3")
    
    // Cargar configuración de localStorage
    const showNotificationsConfig = localStorage.getItem("staff-show-notifications")
    const playSoundsConfig = localStorage.getItem("staff-play-sounds")
    
    if (showNotificationsConfig !== null) {
      setShowNotifications(showNotificationsConfig === "true")
    }
    
    if (playSoundsConfig !== null) {
      setPlaySounds(playSoundsConfig === "true")
    }
  }, [])

  // Guardar configuración en localStorage
  useEffect(() => {
    localStorage.setItem("staff-show-notifications", showNotifications.toString())
    localStorage.setItem("staff-play-sounds", playSounds.toString())
  }, [showNotifications, playSounds])

  // Suscribirse a cambios en los pedidos
  useEffect(() => {
    // Suscribirse a nuevos pedidos
    const newOrdersSubscription = supabase
      .channel('new-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as Order
          
          // Crear notificación
          const notification: Notification = {
            id: `new-order-${newOrder.id}`,
            title: "Nuevo Pedido",
            message: `Se ha recibido un nuevo pedido #${newOrder.id.substring(0, 8)}`,
            type: "info",
            orderId: newOrder.id,
            status: newOrder.status,
            timestamp: new Date(),
            read: false
          }
          
          // Añadir notificación
          addNotification(notification)
          
          // Mostrar toast si está habilitado
          if (showNotifications) {
            toast.info("Nuevo pedido recibido", {
              description: `Pedido #${newOrder.id.substring(0, 8)}`,
              action: {
                label: "Ver",
                onClick: () => router.push(`/admin/orders?id=${newOrder.id}`)
              }
            })
          }
          
          // Reproducir sonido si está habilitado
          if (playSounds && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Error al reproducir sonido:", e))
          }
        }
      )
      .subscribe()

    // Suscribirse a cambios de estado en pedidos
    const orderStatusSubscription = supabase
      .channel('order-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'status=neq.status',
        },
        (payload) => {
          const updatedOrder = payload.new as Order
          const oldOrder = payload.old as Order
          
          // Solo notificar si el estado ha cambiado
          if (updatedOrder.status === oldOrder.status) return
          
          // Crear notificación
          const notification: Notification = {
            id: `status-change-${updatedOrder.id}-${Date.now()}`,
            title: "Estado de Pedido Actualizado",
            message: `El pedido #${updatedOrder.id.substring(0, 8)} ha cambiado a "${getStatusText(updatedOrder.status)}"`,
            type: getNotificationType(updatedOrder.status),
            orderId: updatedOrder.id,
            status: updatedOrder.status,
            timestamp: new Date(),
            read: false
          }
          
          // Añadir notificación
          addNotification(notification)
          
          // Mostrar toast si está habilitado
          if (showNotifications) {
            toast[getNotificationType(updatedOrder.status)]("Estado de pedido actualizado", {
              description: `Pedido #${updatedOrder.id.substring(0, 8)} → ${getStatusText(updatedOrder.status)}`,
              action: {
                label: "Ver",
                onClick: () => router.push(`/admin/orders?id=${updatedOrder.id}`)
              }
            })
          }
          
          // Reproducir sonido si está habilitado
          if (playSounds && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Error al reproducir sonido:", e))
          }
        }
      )
      .subscribe()

    // Limpiar suscripciones al desmontar
    return () => {
      newOrdersSubscription.unsubscribe()
      orderStatusSubscription.unsubscribe()
    }
  }, [router, showNotifications, playSounds])

  // Actualizar contador de no leídos
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  // Añadir notificación
  const addNotification = (notification: Notification) => {
    setNotifications(prev => {
      // Limitar a 50 notificaciones
      const updated = [notification, ...prev].slice(0, 50)
      return updated
    })
  }

  // Marcar notificación como leída
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  // Eliminar notificación
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Eliminar todas las notificaciones
  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Obtener texto del estado
  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "preparing":
        return "En preparación"
      case "ready":
        return "Listo para entregar"
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  // Obtener tipo de notificación según el estado
  const getNotificationType = (status: Order["status"]): Notification["type"] => {
    switch (status) {
      case "pending":
        return "info"
      case "preparing":
        return "info"
      case "ready":
        return "success"
      case "delivered":
        return "success"
      case "cancelled":
        return "error"
      default:
        return "info"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificaciones</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Marcar todas como leídas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              Limpiar
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No hay notificaciones
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${notification.read ? "" : "bg-muted/50"}`}
                onClick={() => {
                  markAsRead(notification.id)
                  if (notification.orderId) {
                    router.push(`/admin/orders?id=${notification.orderId}`)
                  }
                }}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{notification.title}</span>
                    <div className="flex items-center gap-2">
                      {notification.status && (
                        <OrderStatusBadge status={notification.status} className="text-[10px] py-0 px-2" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <div className={`h-4 w-4 rounded-sm border flex items-center justify-center ${showNotifications ? "bg-primary border-primary" : "border-input"}`}>
              {showNotifications && <span className="text-[10px] text-primary-foreground">✓</span>}
            </div>
            <span className="text-sm">Mostrar notificaciones</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setPlaySounds(!playSounds)}
          >
            <div className={`h-4 w-4 rounded-sm border flex items-center justify-center ${playSounds ? "bg-primary border-primary" : "border-input"}`}>
              {playSounds && <span className="text-[10px] text-primary-foreground">✓</span>}
            </div>
            <span className="text-sm">Reproducir sonidos</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Formatear tiempo relativo
function formatTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  
  if (diffMinutes < 1) {
    return "Ahora mismo"
  } else if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`
  } else if (diffMinutes < 24 * 60) {
    const hours = Math.floor(diffMinutes / 60)
    return `Hace ${hours} h`
  } else {
    return date.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
}
