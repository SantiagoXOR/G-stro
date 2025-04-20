import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardMetrics from "@/components/dashboard-metrics"
import TableGrid from "@/components/table-grid"
import RecentOrders from "@/components/recent-orders"
import InventoryAlerts from "@/components/inventory-alerts"
import SalesChart from "@/components/sales-chart"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Download, RefreshCw } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de operaciones del restaurante</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Actualizar</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Download className="h-3.5 w-3.5" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>12 de Marzo, 2025</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Última actualización: 17:28</span>
        </div>
      </div>

      <DashboardMetrics />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Ventas y Pedidos</CardTitle>
              <CardDescription>Comparativa de la última semana</CardDescription>
            </div>
            <Tabs defaultValue="week">
              <TabsList className="h-8">
                <TabsTrigger value="day" className="text-xs">
                  Día
                </TabsTrigger>
                <TabsTrigger value="week" className="text-xs">
                  Semana
                </TabsTrigger>
                <TabsTrigger value="month" className="text-xs">
                  Mes
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[350px] w-full">
              <SalesChart />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Estado de Mesas</CardTitle>
            <CardDescription>Vista general de ocupación</CardDescription>
          </CardHeader>
          <CardContent>
            <TableGrid />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>Últimos pedidos recibidos</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Alertas de Inventario</CardTitle>
            <CardDescription>Insumos con stock bajo</CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryAlerts />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

