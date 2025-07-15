"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Clock, MapPin, Receipt, ShoppingBag, Navigation } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getOrderWithItems, cancelOrder, Order, OrderItem } from "@/lib/services/orders"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import DeliveryMap from "@/components/delivery-map"
import DeliveryTimeEstimate from "@/components/delivery-time-estimate"
import { getOrderDriverLocation, simulateDriverMovement } from "@/lib/services/delivery-tracking"
import { ShareOrderButton } from "@/components/share-order-button"

// Componente para mostrar el estado del pedido
function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "ready":
        return "bg-green-100 text-green-800 border-green-200"
      case "delivered":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = () => {
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

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {getStatusText()}
    </span>
  )
}

// Componente para mostrar el seguimiento del pedido
function OrderTracking({ status }: { status: Order["status"] }) {
  const steps = [
    { id: "pending", label: "Recibido", icon: Receipt },
    { id: "preparing", label: "En preparación", icon: ShoppingBag },
    { id: "ready", label: "Listo", icon: Clock },
    { id: "delivered", label: "Entregado", icon: MapPin },
  ]

  // Determinar hasta qué paso ha llegado el pedido
  const getCurrentStepIndex = () => {
    if (status === "cancelled") return -1
    return steps.findIndex((step) => step.id === status)
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="my-6">
      <h3 className="font-medium mb-4">Seguimiento del pedido</h3>
      <div className="flex justify-between relative">
        {/* Línea de progreso */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-muted">
          <div
            className={`h-full bg-primary transition-all ${
              currentStepIndex < 0 ? "w-0" : `w-[${(currentStepIndex / (steps.length - 1)) * 100}%]`
            }`}
            style={{
              width: currentStepIndex < 0 ? "0%" : `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
          ></div>
        </div>

        {/* Pasos */}
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isActive = index <= currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <div key={step.id} className="flex flex-col items-center z-10 w-1/4">
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center mb-2 transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
              >
                <StepIcon className="h-4 w-4" />
              </div>
              <span className="text-xs text-center">{step.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useUser()
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [driverLocation, setDriverLocation] = useState(null)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user) {
        router.push("/auth/login")
        return
      }

      try {
        setIsLoading(true)
        const result = await getOrderWithItems(params.id)

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

        // Cargar ubicación del repartidor si el pedido está en camino
        if (result.order.status === "ready" || result.order.status === "delivered") {
          const location = await getOrderDriverLocation(params.id)
          setDriverLocation(location)
          setShowMap(true)

          // Para demostración: simular movimiento del repartidor si no hay ubicación
          if (!location && result.order.status === "ready") {
            // Coordenadas de ejemplo (Buenos Aires)
            simulateDriverMovement(
              params.id,
              -34.603722, // latitud inicial
              -58.381592, // longitud inicial
              -34.608722, // latitud final
              -58.371592, // longitud final
              5 // duración en minutos
            )
          }
        }
      } catch (error) {
        console.error("Error al cargar detalles del pedido:", error)
        toast.error("Error al cargar detalles del pedido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [params.id, router, user])

  const handleCancelOrder = async () => {
    if (!order || order.status !== "pending") return

    try {
      setIsCancelling(true)
      const result = await cancelOrder(order.id)

      if (result) {
        setOrder(result)
        toast.success("Pedido cancelado correctamente")
      } else {
        throw new Error("No se pudo cancelar el pedido")
      }
    } catch (error) {
      console.error("Error al cancelar el pedido:", error)
      toast.error("Error al cancelar el pedido")
    } finally {
      setIsCancelling(false)
    }
  }

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

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background pt-4 pb-2 px-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Detalles del Pedido</h1>
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

        {order.status === "cancelled" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pedido cancelado</AlertTitle>
            <AlertDescription>
              Este pedido ha sido cancelado y no será procesado.
            </AlertDescription>
          </Alert>
        )}

        {/* Order Tracking */}
        {order.status !== "cancelled" && <OrderTracking status={order.status} />}

        {/* Delivery Time Estimate */}
        {(order.status === "preparing" || order.status === "ready") && (
          <DeliveryTimeEstimate
            orderId={order.id}
            orderCreatedAt={order.created_at}
            className="mb-6 mt-2"
          />
        )}

        {/* Delivery Map */}
        {showMap && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Seguimiento en tiempo real</h3>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                <Navigation className="h-3 w-3 mr-1" />
                Ver en mapa completo
              </Button>
            </div>
            <DeliveryMap
              orderId={order.id}
              initialLocation={driverLocation}
              deliveryLocation={{
                lat: -34.608722,
                lng: -58.371592,
                name: "Tu ubicación"
              }}
            />
          </div>
        )}

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
                    {item.notes && <p className="text-xs italic mt-1">"{item.notes}"</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <h3 className="font-medium mb-3">Resumen</h3>
        <div className="bg-muted/50 rounded-lg p-4 space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${Number(order.total_amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Envío</span>
            <span>$0</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${Number(order.total_amount).toLocaleString()}</span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Notas</h3>
            <p className="text-sm bg-muted/50 p-3 rounded-lg">{order.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {order.status === "pending" && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelando..." : "Cancelar Pedido"}
            </Button>
          )}

          {/* Compartir pedido */}
          <ShareOrderButton
            order={order}
            items={orderItems.map(item => ({
              name: (item.product as any)?.name || "Producto",
              quantity: item.quantity
            }))}
            className="w-full"
          />

          <Button variant="outline" className="w-full" onClick={() => router.push("/menu")}>
            Realizar Otro Pedido
          </Button>
        </div>
      </div>
    </div>
  )
}
