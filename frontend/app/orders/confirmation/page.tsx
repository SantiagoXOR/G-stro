"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, ChevronRight, Clock, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getOrderWithItems, Order, OrderItem } from "@/lib/services/orders"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { ShareOrderButton } from "@/components/share-order-button"

function OrderConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")
  const { user } = useUser()
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user) {
        router.push("/auth/login")
        return
      }

      if (!orderId) {
        router.push("/profile")
        return
      }

      try {
        setIsLoading(true)
        const result = await getOrderWithItems(orderId)

        if (!result) {
          toast.error("No se pudo cargar el pedido")
          router.push("/profile")
          return
        }

        // Verificar que el pedido pertenece al usuario actual
        if (result.order.customer_id !== user.id) {
          toast.error("No tienes permiso para ver este pedido")
          router.push("/profile")
          return
        }

        setOrder(result.order)
        setOrderItems(result.items)
      } catch (error) {
        console.error("Error al cargar detalles del pedido:", error)
        toast.error("Error al cargar detalles del pedido")
        router.push("/profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, router, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Pedido no encontrado</h1>
        <p className="text-muted-foreground mb-6">El pedido que buscas no existe o ha sido eliminado.</p>
        <Link href="/profile">
          <Button>Volver al Perfil</Button>
        </Link>
      </div>
    )
  }

  // Formatear fecha
  const orderDate = new Date(order.created_at).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  // Calcular tiempo estimado de entrega (20-30 minutos desde la creación)
  const orderCreatedAt = new Date(order.created_at)
  const estimatedMinTime = new Date(orderCreatedAt.getTime() + 20 * 60000)
  const estimatedMaxTime = new Date(orderCreatedAt.getTime() + 30 * 60000)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const estimatedTimeRange = `${formatTime(estimatedMinTime)} - ${formatTime(estimatedMaxTime)}`

  return (
    <div className="flex flex-col items-center p-4 pt-8">
      <div className="bg-green-100 rounded-full p-4 mb-4">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold mb-2 text-center">¡Pedido Confirmado!</h1>
      <p className="text-center text-muted-foreground mb-6">
        Tu pedido ha sido recibido y está siendo procesado
      </p>

      {/* Order Summary Card */}
      <Card className="w-full mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-medium">Pedido #{order.id.substring(0, 8)}</h2>
              <p className="text-sm text-muted-foreground">{orderDate}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Pendiente
            </span>
          </div>

          <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Tiempo estimado de preparación</p>
              <p className="text-sm text-muted-foreground">{estimatedTimeRange}</p>
            </div>
          </div>

          <div className="pt-2">
            <p className="font-medium mb-2">Resumen del pedido</p>
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {(item.product as any)?.name || "Producto"}
                  </span>
                  <span>${(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span>${Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3 w-full">
        <Link href={`/orders/${order.id}`}>
          <Button className="w-full flex justify-between items-center">
            <span>Ver Detalles del Pedido</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>

        {/* Compartir pedido */}
        <ShareOrderButton
          order={order}
          items={orderItems.map(item => ({
            name: (item.product as any)?.name || "Producto",
            quantity: item.quantity
          }))}
          className="w-full"
        />

        <Link href="/menu">
          <Button variant="outline" className="w-full">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Seguir Comprando
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Componente principal con Suspense boundary
export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando confirmación...</p>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
