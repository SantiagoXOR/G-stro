"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Filter, Search, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getUserOrders, Order } from "@/lib/services/orders"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { isInOfflineMode, offlineData } from "@/lib/offline-mode"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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

export default function OrderHistoryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        console.log('No hay usuario autenticado, redirigiendo a login')
        router.push("/auth/login")
        return
      }

      try {
        setIsLoading(true)
        console.log('Obteniendo pedidos para el usuario:', user.id)

        // Verificar si estamos en modo offline
        if (isInOfflineMode()) {
          console.log('Modo offline: usando datos de ejemplo para pedidos')
          const offlineOrdersData = offlineData.orders as unknown as Order[]
          setOrders(offlineOrdersData)
          setFilteredOrders(offlineOrdersData)

          if (offlineOrdersData.length === 0) {
            toast.info('No hay pedidos disponibles en modo offline')
          }
        } else {
          // Modo online: intentar obtener los pedidos del usuario
          console.log('Modo online: obteniendo pedidos de la base de datos')
          const ordersData = await getUserOrders(user.id)

          console.log('Pedidos obtenidos:', ordersData.length)
          setOrders(ordersData)
          setFilteredOrders(ordersData)

          // Si no hay pedidos pero no hubo error, mostrar un mensaje informativo
          if (ordersData.length === 0) {
            toast.info('No tienes pedidos en tu historial')
          }
        }
      } catch (error) {
        console.error("Error al cargar pedidos:", error)
        toast.error("Error al cargar el historial de pedidos")

        // En caso de error, intentar usar datos de ejemplo
        console.log('Usando datos de ejemplo como fallback')
        const fallbackData = offlineData.orders as unknown as Order[]
        setOrders(fallbackData)
        setFilteredOrders(fallbackData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [router, user])

  // Aplicar filtros cuando cambian
  useEffect(() => {
    if (!orders.length) return

    let result = [...orders]

    // Filtrar por estado
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter)
    }

    // Filtrar por búsqueda (ID del pedido)
    if (searchQuery) {
      result = result.filter((order) =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredOrders(result)
  }, [orders, statusFilter, searchQuery])

  // Agrupar pedidos por mes
  const groupOrdersByMonth = () => {
    const grouped: Record<string, Order[]> = {}

    filteredOrders.forEach((order) => {
      const date = new Date(order.created_at)
      const monthYear = date.toLocaleDateString("es-AR", {
        month: "long",
        year: "numeric",
      })

      if (!grouped[monthYear]) {
        grouped[monthYear] = []
      }

      grouped[monthYear].push(order)
    })

    return grouped
  }

  const groupedOrders = groupOrdersByMonth()

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
          <h1 className="text-2xl font-bold">Historial de Pedidos</h1>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID de pedido"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={isFilterOpen ? "bg-muted" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {isFilterOpen && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado del pedido</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="preparing">En preparación</SelectItem>
                  <SelectItem value="ready">Listo para entregar</SelectItem>
                  <SelectItem value="delivered">Entregado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted rounded-full p-6 mb-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">No hay pedidos</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== "all"
                ? "No se encontraron pedidos con los filtros seleccionados"
                : "Aún no has realizado ningún pedido"}
            </p>
            <Link href="/menu">
              <Button>Ver Menú</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedOrders).map(([monthYear, monthOrders]) => (
              <div key={monthYear}>
                <Accordion type="single" collapsible defaultValue={Object.keys(groupedOrders)[0]}>
                  <AccordionItem value={monthYear} className="border-none">
                    <AccordionTrigger className="py-2 text-lg font-medium">
                      {monthYear} ({monthOrders.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {monthOrders.map((order) => (
                          <Link href={`/orders/${order.id}`} key={order.id}>
                            <Card className="transition-colors hover:bg-muted/50">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3 className="font-medium">Pedido #{order.id.substring(0, 8)}</h3>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(order.created_at).toLocaleDateString("es-AR", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                  <OrderStatusBadge status={order.status} />
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-primary">
                                    ${Number(order.total_amount).toLocaleString()}
                                  </span>
                                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                                    Ver Detalles
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
