import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react"

export default function DashboardMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas del Día</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45.680</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            <span className="text-green-500 font-medium">+12%</span> vs. ayer
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">38</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            <span className="text-green-500 font-medium">+5</span> vs. ayer
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$1.202</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            <span className="text-green-500 font-medium">+8%</span> vs. semana pasada
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground mt-1">Este mes: 86 clientes</p>
        </CardContent>
      </Card>
    </div>
  )
}

