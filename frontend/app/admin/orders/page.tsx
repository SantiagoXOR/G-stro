"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "@/components/ui/order-status-badge"
import { getAllOrders, updateOrderStatus, Order, OrderItem, getOrderWithItems } from "@/lib/services/orders"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([])
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<Order["status"]>("pending")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTimeRange, setFilterTimeRange] = useState("all")
  const [filterTable, setFilterTable] = useState("all")
  const [showNotifications, setShowNotifications] = useState(true)
  const [showSounds, setShowSounds] = useState(true)

  // Cargar pedidos
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const data = await getAllOrders()
        setOrders(data)
        setFilteredOrders(data)
      } catch (error) {
        console.error("Error al cargar pedidos:", error)
        toast.error("Error al cargar pedidos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()

    // Configurar actualización periódica
    const interval = setInterval(fetchOrders, 30000) // Actualizar cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  // Filtrar y ordenar pedidos
  useEffect(() => {
    if (!orders.length) return

    let result = [...orders]

    // Filtrar por pestaña activa
    if (activeTab !== "all") {
      result = result.filter((order) => order.status === activeTab)
    }

    // Filtrar por estado
    if (filterStatus !== "all") {
      result = result.filter((order) => order.status === filterStatus)
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.customer_id && order.customer_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.notes && order.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filtrar por rango de tiempo
    if (filterTimeRange !== "all") {
      const now = new Date()
      const timeRanges = {
        "1h": 60 * 60 * 1000,
        "4h": 4 * 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
      }
      
      const timeLimit = now.getTime() - (timeRanges[filterTimeRange as keyof typeof timeRanges] || 0)
      
      result = result.filter((order) => new Date(order.created_at).getTime() > timeLimit)
    }

    // Filtrar por mesa
    if (filterTable !== "all") {
      result = result.filter((order) => 
        order.table_number === parseInt(filterTable)
      )
    }

    // Ordenar
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      
      if (sortBy === "newest") {
        return dateB - dateA
      } else if (sortBy === "oldest") {
        return dateA - dateB
      } else if (sortBy === "highest") {
        return b.total_amount - a.total_amount
      } else if (sortBy === "lowest") {
        return a.total_amount - b.total_amount
      }
      
      return 0
    })

    setFilteredOrders(result)
  }, [orders, activeTab, searchQuery, filterStatus, filterTimeRange, filterTable, sortBy])

  // Cargar detalles de un pedido
  const handleViewOrderDetails = async (order: Order) => {
    try {
      setSelectedOrder(order)
      setIsOrderDetailsOpen(true)
      
      const result = await getOrderWithItems(order.id)
      if (result) {
        setSelectedOrderItems(result.items)
      }
    } catch (error) {
      console.error("Error al cargar detalles del pedido:", error)
      toast.error("Error al cargar detalles del pedido")
    }
  }

  // Abrir diálogo para cambiar estado
  const handleOpenStatusUpdate = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setIsStatusUpdateOpen(true)
  }

  // Actualizar estado de un pedido
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return

    try {
      setIsUpdatingStatus(true)
      const result = await updateOrderStatus(selectedOrder.id, newStatus)
      
      if (result) {
        // Actualizar la lista de pedidos
        setOrders((prev) =>
          prev.map((order) => (order.id === selectedOrder.id ? result : order))
        )
        
        toast.success(`Estado del pedido actualizado a "${getStatusText(newStatus)}"`)
        setIsStatusUpdateOpen(false)
      } else {
        throw new Error("Error al actualizar estado del pedido")
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      toast.error("Error al actualizar estado del pedido")
    } finally {
      setIsUpdatingStatus(false)
    }
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

  // Formatear tiempo relativo
  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es })
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Gestión de pedidos del restaurante</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className="h-3.5 w-3.5" />
            <span>Filtros</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => {
            setIsLoading(true)
            getAllOrders().then(data => {
              setOrders(data)
              setFilteredOrders(data)
              setIsLoading(false)
            })
          }}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="preparing">En preparación</TabsTrigger>
            <TabsTrigger value="ready">Listos</TabsTrigger>
            <TabsTrigger value="delivered">Entregados</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar pedidos..."
                className="w-[200px] pl-8 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="oldest">Más antiguos</SelectItem>
                <SelectItem value="highest">Mayor importe</SelectItem>
                <SelectItem value="lowest">Menor importe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros avanzados */}
        {isFilterOpen && (
          <Card className="mb-4">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Estado</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="preparing">En preparación</SelectItem>
                    <SelectItem value="ready">Listos</SelectItem>
                    <SelectItem value="delivered">Entregados</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Rango de tiempo</label>
                <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquier fecha</SelectItem>
                    <SelectItem value="1h">Última hora</SelectItem>
                    <SelectItem value="4h">Últimas 4 horas</SelectItem>
                    <SelectItem value="24h">Últimas 24 horas</SelectItem>
                    <SelectItem value="7d">Últimos 7 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Mesa</label>
                <Select value={filterTable} onValueChange={setFilterTable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las mesas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las mesas</SelectItem>
                    <SelectItem value="1">Mesa 1</SelectItem>
                    <SelectItem value="2">Mesa 2</SelectItem>
                    <SelectItem value="3">Mesa 3</SelectItem>
                    <SelectItem value="4">Mesa 4</SelectItem>
                    <SelectItem value="5">Mesa 5</SelectItem>
                    <SelectItem value="6">Mesa 6</SelectItem>
                    <SelectItem value="7">Mesa 7</SelectItem>
                    <SelectItem value="8">Mesa 8</SelectItem>
                    <SelectItem value="9">Mesa 9</SelectItem>
                    <SelectItem value="10">Mesa 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3 flex justify-between items-center pt-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notifications" 
                      checked={showNotifications} 
                      onCheckedChange={(checked) => setShowNotifications(checked as boolean)} 
                    />
                    <label htmlFor="notifications" className="text-sm">Mostrar notificaciones</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sounds" 
                      checked={showSounds} 
                      onCheckedChange={(checked) => setShowSounds(checked as boolean)} 
                    />
                    <label htmlFor="sounds" className="text-sm">Reproducir sonidos</label>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  setFilterStatus("all")
                  setFilterTimeRange("all")
                  setFilterTable("all")
                  setSearchQuery("")
                  setSortBy("newest")
                }}>
                  Limpiar filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de pedidos */}
        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted rounded-full p-6 mb-4">
                <Clock className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-2">No hay pedidos</h2>
              <p className="text-muted-foreground mb-6">
                No se encontraron pedidos con los filtros seleccionados
              </p>
              <Button onClick={() => {
                setActiveTab("all")
                setFilterStatus("all")
                setFilterTimeRange("all")
                setFilterTable("all")
                setSearchQuery("")
              }}>
                Ver todos los pedidos
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((order) => (
                <Card key={order.id} className={`
                  ${order.status === "pending" ? "border-yellow-300" : ""}
                  ${order.status === "preparing" ? "border-blue-300" : ""}
                  ${order.status === "ready" ? "border-green-300" : ""}
                `}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Pedido #{order.id.substring(0, 8)}</h3>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(order.created_at)}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {order.customer_id ? order.customer_id.substring(0, 2).toUpperCase() : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {order.customer_id ? `Cliente #${order.customer_id.substring(0, 6)}` : "Cliente anónimo"}
                      </span>
                    </div>
                    
                    {order.table_number && (
                      <div className="mb-3">
                        <Badge variant="outline" className="text-xs">
                          Mesa {order.table_number}
                        </Badge>
                      </div>
                    )}
                    
                    <Separator className="my-3" />
                    
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">
                        ${Number(order.total_amount).toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs"
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          Ver detalles
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleOpenStatusUpdate(order)}>
                              Cambiar estado
                            </DropdownMenuItem>
                            <DropdownMenuItem>Imprimir ticket</DropdownMenuItem>
                            <DropdownMenuItem>Enviar notificación</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo de detalles del pedido */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <div className="flex items-center gap-2 mt-1">
                  <span>Pedido #{selectedOrder.id.substring(0, 8)}</span>
                  <span>•</span>
                  <span>{new Date(selectedOrder.created_at).toLocaleString("es-AR")}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="font-medium mb-3">Productos</h3>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {selectedOrderItems.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-3">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">{(item.product as any)?.name || "Producto"}</h4>
                              <div className="flex text-sm text-muted-foreground">
                                <span>Cantidad: {item.quantity}</span>
                              </div>
                              {item.notes && <p className="text-xs italic mt-1">"{item.notes}"</p>}
                            </div>
                            <div className="text-right">
                              <span className="font-medium">${Number(item.unit_price).toLocaleString()}</span>
                              <div className="text-sm text-muted-foreground">
                                ${(Number(item.unit_price) * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Información</h3>
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <div className="mt-1">
                        <OrderStatusBadge status={selectedOrder.status} />
                      </div>
                    </div>
                    
                    {selectedOrder.table_number && (
                      <div>
                        <p className="text-sm text-muted-foreground">Mesa</p>
                        <p className="font-medium">Mesa {selectedOrder.table_number}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-medium">
                        {selectedOrder.customer_id 
                          ? `Cliente #${selectedOrder.customer_id.substring(0, 8)}`
                          : "Cliente anónimo"
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-bold text-primary">${Number(selectedOrder.total_amount).toLocaleString()}</p>
                    </div>
                    
                    {selectedOrder.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground">Notas</p>
                        <p className="text-sm bg-muted/50 p-2 rounded-md mt-1">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="mt-4 space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setIsOrderDetailsOpen(false)
                      handleOpenStatusUpdate(selectedOrder)
                    }}
                  >
                    Cambiar estado
                  </Button>
                  <Button variant="outline" className="w-full">Imprimir ticket</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para cambiar estado */}
      <Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado del Pedido</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo estado para el pedido #{selectedOrder?.id.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado actual</label>
              <div>
                {selectedOrder && <OrderStatusBadge status={selectedOrder.status} />}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nuevo estado</label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as Order["status"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="preparing">En preparación</SelectItem>
                  <SelectItem value="ready">Listo para entregar</SelectItem>
                  <SelectItem value="delivered">Entregado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusUpdateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdatingStatus}>
              {isUpdatingStatus ? "Actualizando..." : "Actualizar estado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
