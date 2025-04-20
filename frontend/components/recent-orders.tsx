import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type OrderStatus = "pending" | "preparing" | "ready" | "delivered"

interface Order {
  id: string
  table: number
  items: string
  status: OrderStatus
  time: string
}

const orders: Order[] = [
  {
    id: "ORD-001",
    table: 1,
    items: "2 Milanesas, 1 Ensalada",
    status: "preparing",
    time: "15:30",
  },
  {
    id: "ORD-002",
    table: 3,
    items: "1 Pizza, 2 Gaseosas",
    status: "ready",
    time: "15:45",
  },
  {
    id: "ORD-003",
    table: 4,
    items: "4 Hamburguesas, 2 Papas",
    status: "pending",
    time: "16:00",
  },
  {
    id: "ORD-004",
    table: 7,
    items: "2 Cafés, 1 Tostado",
    status: "delivered",
    time: "15:20",
  },
]

export default function RecentOrders() {
  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
          <div className="flex flex-col">
            <span className="font-medium">Mesa {order.table}</span>
            <span className="text-xs text-muted-foreground">{order.items}</span>
          </div>
          <div className="flex flex-col items-end">
            <Badge
              className={cn(
                order.status === "pending" && "bg-amber-100 text-amber-700 hover:bg-amber-100",
                order.status === "preparing" && "bg-blue-100 text-blue-700 hover:bg-blue-100",
                order.status === "ready" && "bg-green-100 text-green-700 hover:bg-green-100",
                order.status === "delivered" && "bg-gray-100 text-gray-700 hover:bg-gray-100",
              )}
              variant="outline"
            >
              {order.status === "pending" && "Pendiente"}
              {order.status === "preparing" && "Preparando"}
              {order.status === "ready" && "Listo"}
              {order.status === "delivered" && "Entregado"}
            </Badge>
            <span className="mt-1 text-xs text-muted-foreground">{order.time}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

