"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Download, TrendingDown, TrendingUp } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Datos de ejemplo para análisis
const salesData = [
  { name: "Lun", ventas: 32000, pedidos: 24, costos: 18000 },
  { name: "Mar", ventas: 28000, pedidos: 21, costos: 16000 },
  { name: "Mié", ventas: 35000, pedidos: 29, costos: 19500 },
  { name: "Jue", ventas: 42000, pedidos: 36, costos: 22000 },
  { name: "Vie", ventas: 58000, pedidos: 45, costos: 28000 },
  { name: "Sáb", ventas: 72000, pedidos: 60, costos: 34000 },
  { name: "Dom", ventas: 48000, pedidos: 38, costos: 24000 },
]

const monthlyData = [
  { name: "Ene", ventas: 850000, pedidos: 720, costos: 450000 },
  { name: "Feb", ventas: 920000, pedidos: 780, costos: 480000 },
  { name: "Mar", ventas: 980000, pedidos: 820, costos: 510000 },
  { name: "Abr", ventas: 1050000, pedidos: 880, costos: 540000 },
  { name: "May", ventas: 1120000, pedidos: 920, costos: 570000 },
  { name: "Jun", ventas: 1250000, pedidos: 1020, costos: 620000 },
  { name: "Jul", ventas: 1380000, pedidos: 1150, costos: 680000 },
  { name: "Ago", ventas: 1420000, pedidos: 1180, costos: 700000 },
  { name: "Sep", ventas: 1350000, pedidos: 1120, costos: 670000 },
  { name: "Oct", ventas: 1280000, pedidos: 1050, costos: 640000 },
  { name: "Nov", ventas: 1180000, pedidos: 980, costos: 600000 },
  { name: "Dic", ventas: 1320000, pedidos: 1100, costos: 660000 },
]

const categoryData = [
  { name: "Parrilla", value: 35 },
  { name: "Pastas", value: 20 },
  { name: "Pizzas", value: 18 },
  { name: "Entradas", value: 12 },
  { name: "Postres", value: 8 },
  { name: "Bebidas", value: 7 },
]

const hourlyData = [
  { hour: "12:00", ventas: 12000, pedidos: 10 },
  { hour: "13:00", ventas: 18000, pedidos: 15 },
  { hour: "14:00", ventas: 22000, pedidos: 18 },
  { hour: "15:00", ventas: 15000, pedidos: 12 },
  { hour: "16:00", ventas: 8000, pedidos: 7 },
  { hour: "17:00", ventas: 6000, pedidos: 5 },
  { hour: "18:00", ventas: 10000, pedidos: 8 },
  { hour: "19:00", ventas: 16000, pedidos: 13 },
  { hour: "20:00", ventas: 24000, pedidos: 20 },
  { hour: "21:00", ventas: 32000, pedidos: 26 },
  { hour: "22:00", ventas: 28000, pedidos: 23 },
  { hour: "23:00", ventas: 18000, pedidos: 15 },
]

export default function AnalyticsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })

  const [timeframe, setTimeframe] = useState("week")
  const [chartType, setChartType] = useState("sales")

  // Datos según el timeframe seleccionado
  const chartData = timeframe === "month" ? monthlyData : salesData

  // Métricas de resumen
  const totalSales = chartData.reduce((sum, item) => sum + item.ventas, 0)
  const totalOrders = chartData.reduce((sum, item) => sum + item.pedidos, 0)
  const totalCosts = chartData.reduce((sum, item) => sum + item.costos, 0)
  const profit = totalSales - totalCosts
  const profitMargin = ((profit / totalSales) * 100).toFixed(1)

  // Comparación con período anterior (simulado)
  const prevSales = totalSales * 0.92
  const salesChange = ((totalSales - prevSales) / prevSales) * 100
  const prevOrders = totalOrders * 0.94
  const ordersChange = ((totalOrders - prevOrders) / prevOrders) * 100
  const prevProfit = profit * 0.9
  const profitChange = ((profit - prevProfit) / prevProfit) * 100

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análisis</h1>
          <p className="text-muted-foreground">Estadísticas y métricas del negocio</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("justify-start text-left font-normal w-[240px]", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd/MM/yyyy", { locale: es })} -{" "}
                      {format(date.to, "dd/MM/yyyy", { locale: es })}
                    </>
                  ) : (
                    format(date.from, "dd/MM/yyyy", { locale: es })
                  )
                ) : (
                  <span>Seleccionar período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {salesChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">+{salesChange.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500 font-medium">{salesChange.toFixed(1)}%</span>
                </>
              )}{" "}
              vs. período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {ordersChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">+{ordersChange.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500 font-medium">{ordersChange.toFixed(1)}%</span>
                </>
              )}{" "}
              vs. período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${profit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {profitChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">+{profitChange.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500 font-medium">{profitChange.toFixed(1)}%</span>
                </>
              )}{" "}
              vs. período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Análisis de Ventas</CardTitle>
              <CardDescription>Tendencias de ventas y pedidos</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={timeframe} onValueChange={setTimeframe}>
                <TabsList className="h-8">
                  <TabsTrigger value="week" className="text-xs">
                    Semana
                  </TabsTrigger>
                  <TabsTrigger value="month" className="text-xs">
                    Mes
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="Tipo de gráfico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Ventas</SelectItem>
                  <SelectItem value="orders">Pedidos</SelectItem>
                  <SelectItem value="profit">Ganancia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "sales" ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="ventas" name="Ventas" fill="#8884d8" />
                    <Bar dataKey="costos" name="Costos" fill="#82ca9d" />
                  </BarChart>
                ) : chartType === "orders" ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pedidos" name="Pedidos" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="ventas" name="Ventas" fill="#8884d8" />
                    <Bar dataKey="costos" name="Costos" fill="#82ca9d" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
            <CardDescription>Distribución porcentual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Sector
                        key={`cell-${index}`}
                        fill={["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658"][index % 7]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Hora</CardTitle>
            <CardDescription>Distribución horaria de ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "ventas" ? `$${value.toLocaleString()}` : value,
                      name === "ventas" ? "Ventas" : "Pedidos",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="ventas" name="Ventas" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas Clave</CardTitle>
            <CardDescription>Indicadores de rendimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Ticket Promedio</span>
                  <span className="text-sm font-medium">${(totalSales / totalOrders).toFixed(0)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "75%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Margen de Ganancia</span>
                  <span className="text-sm font-medium">{profitMargin}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${profitMargin}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Costo por Pedido</span>
                  <span className="text-sm font-medium">${(totalCosts / totalOrders).toFixed(0)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "60%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Tasa de Ocupación</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "78%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Rotación de Mesas</span>
                  <span className="text-sm font-medium">3.2 veces/día</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "65%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

