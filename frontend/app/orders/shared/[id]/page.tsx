"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Clock, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getOrderWithItems, Order, OrderItem } from "@/lib/services/orders"
import { toast } from "sonner"
import { OrderStatusBadge } from "@/components/ui/order-status-badge"
import { ShareOrderButton } from "@/components/share-order-button"

export default function SharedOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true)
        const result = await getOrderWithItems(params.id)

        if (!result) {
          toast.error("No se pudo cargar el pedido")
          router.push("/")
          return
        }

        setOrder(result.order)
        setOrderItems(result.items)
      } catch (error) {
        console.error("Error al cargar detalles del pedido:", error)
        toast.error("Error al cargar detalles del pedido")
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [params.id, router])

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
        <Link href="/">
          <Button>Ir al Inicio</Button>
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

  // Preparar items para compartir
  const shareItems = orderItems.map(item => ({
    name: (item.product as any)?.name || "Producto",
    quantity: item.quantity
  }))

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background pt-4 pb-2 px-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Pedido Compartido</h1>
        </div>
      </div>

      {/* Order Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-medium">Pedido #{order.id.substring(0, 8)}</h2>
            <p className="text-sm text-muted-foreground">{orderDate}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Restaurant Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Slainte Bar"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Slainte Bar</h3>
                <p className="text-sm text-muted-foreground">
                  Av. Corrientes 1234, Buenos Aires
                </p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Ver Menú
                  </Button>
                  <Button size="sm" className="h-8 text-xs">
                    Hacer un Pedido
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <h3 className="font-medium mb-3">Productos</h3>
        <div className="space-y-3 mb-6">
          {orderItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={(item.product as any)?.image_url || "/placeholder.svg"}
                      alt={(item.product as any)?.name || "Producto"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{(item.product as any)?.name || "Producto"}</h4>
                      <span className="font-medium">
                        ${Number(item.unit_price).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Cantidad: {item.quantity}</span>
                      <span>${(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <ShareOrderButton 
            order={order} 
            items={shareItems} 
            className="w-full"
          />
          <Button variant="default" className="w-full" onClick={() => router.push("/menu")}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Hacer un Pedido Similar
          </Button>
        </div>
      </div>
    </div>
  )
}
