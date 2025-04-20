"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock, Plus, Settings, Users } from "lucide-react"

type TableStatus = "free" | "occupied" | "reserved" | "paying"

interface Table {
  id: number
  number: number
  status: TableStatus
  time?: string
  guests?: number
  capacity: number
  section: string
}

const tables: Table[] = [
  { id: 1, number: 1, status: "occupied", time: "45m", guests: 4, capacity: 4, section: "Interior" },
  { id: 2, number: 2, status: "free", capacity: 2, section: "Interior" },
  { id: 3, number: 3, status: "occupied", time: "12m", guests: 2, capacity: 2, section: "Interior" },
  { id: 4, number: 4, status: "paying", time: "1h 20m", guests: 6, capacity: 6, section: "Interior" },
  { id: 5, number: 5, status: "reserved", time: "18:30", guests: 2, capacity: 4, section: "Interior" },
  { id: 6, number: 6, status: "free", capacity: 4, section: "Interior" },
  { id: 7, number: 7, status: "occupied", time: "30m", guests: 3, capacity: 4, section: "Terraza" },
  { id: 8, number: 8, status: "free", capacity: 2, section: "Terraza" },
  { id: 9, number: 9, status: "reserved", time: "20:00", guests: 4, capacity: 4, section: "Terraza" },
  { id: 10, number: 10, status: "free", capacity: 6, section: "Terraza" },
  { id: 11, number: 11, status: "free", capacity: 2, section: "Barra" },
  { id: 12, number: 12, status: "occupied", time: "15m", guests: 1, capacity: 2, section: "Barra" },
]

export default function TablesPage() {
  const [activeSection, setActiveSection] = useState("all")
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false)
  const [isNewTableOpen, setIsNewTableOpen] = useState(false)
  const [newTable, setNewTable] = useState({
    number: "",
    capacity: "4",
    section: "Interior",
  })

  // Obtener secciones únicas
  const sections = Array.from(new Set(tables.map((table) => table.section)))

  // Filtrar mesas por sección
  const filteredTables = activeSection === "all" ? tables : tables.filter((table) => table.section === activeSection)

  // Estadísticas de mesas
  const tableStats = {
    total: tables.length,
    free: tables.filter((t) => t.status === "free").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    paying: tables.filter((t) => t.status === "paying").length,
  }

  const handleTableClick = (table: Table) => {
    setSelectedTable(table)
    setIsTableDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewTable((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewTable((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar la nueva mesa
    console.log("Nueva mesa:", newTable)
    setIsNewTableOpen(false)
    // Resetear el formulario
    setNewTable({
      number: "",
      capacity: "4",
      section: "Interior",
    })
  }

  const changeTableStatus = (status: TableStatus) => {
    // Aquí iría la lógica para cambiar el estado de la mesa
    console.log(`Cambiar mesa ${selectedTable?.number} a estado: ${status}`)
    setIsTableDialogOpen(false)
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mesas</h1>
          <p className="text-muted-foreground">Gestión de mesas y ocupación</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isNewTableOpen} onOpenChange={setIsNewTableOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Nueva Mesa</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nueva Mesa</DialogTitle>
                <DialogDescription>Complete los datos para agregar una nueva mesa</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="number" className="text-right">
                      Número
                    </Label>
                    <Input
                      id="number"
                      name="number"
                      type="number"
                      value={newTable.number}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity" className="text-right">
                      Capacidad
                    </Label>
                    <Select value={newTable.capacity} onValueChange={(value) => handleSelectChange("capacity", value)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar capacidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 4, 6, 8, 10, 12].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "persona" : "personas"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="section" className="text-right">
                      Sección
                    </Label>
                    <Select value={newTable.section} onValueChange={(value) => handleSelectChange("section", value)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar sección" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section} value={section}>
                            {section}
                          </SelectItem>
                        ))}
                        <SelectItem value="Nueva">+ Nueva Sección</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Guardar Mesa</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>Estado actual de las mesas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total mesas:</span>
                <span className="font-medium">{tableStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Libres:</span>
                <span className="font-medium text-green-600">{tableStats.free}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ocupadas:</span>
                <span className="font-medium text-blue-600">{tableStats.occupied}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Reservadas:</span>
                <span className="font-medium text-amber-600">{tableStats.reserved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pagando:</span>
                <span className="font-medium text-purple-600">{tableStats.paying}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Distribución de Mesas</CardTitle>

              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  {sections.map((section) => (
                    <TabsTrigger key={section} value={section}>
                      {section}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredTables.map((table) => (
                <div
                  key={table.id}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md p-3 text-center border cursor-pointer transition-all hover:shadow-md",
                    table.status === "free" && "bg-green-50 border-green-200 text-green-700",
                    table.status === "occupied" && "bg-blue-50 border-blue-200 text-blue-700",
                    table.status === "reserved" && "bg-amber-50 border-amber-200 text-amber-700",
                    table.status === "paying" && "bg-purple-50 border-purple-200 text-purple-700",
                  )}
                  onClick={() => handleTableClick(table)}
                >
                  <span className="text-lg font-medium">Mesa {table.number}</span>
                  <span className="text-xs">{table.capacity} personas</span>

                  {table.status !== "free" && (
                    <>
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-2 text-xs",
                          table.status === "occupied" && "border-blue-200",
                          table.status === "reserved" && "border-amber-200",
                          table.status === "paying" && "border-purple-200",
                        )}
                      >
                        {table.status === "occupied" && `${table.time}`}
                        {table.status === "reserved" && `${table.time}`}
                        {table.status === "paying" && "Pagando"}
                      </Badge>
                      {table.guests && (
                        <div className="mt-1 text-xs flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{table.guests}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para gestionar mesa */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mesa {selectedTable?.number}</DialogTitle>
            <DialogDescription>
              {selectedTable?.section} - Capacidad: {selectedTable?.capacity} personas
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    selectedTable?.status === "free" && "bg-green-500",
                    selectedTable?.status === "occupied" && "bg-blue-500",
                    selectedTable?.status === "reserved" && "bg-amber-500",
                    selectedTable?.status === "paying" && "bg-purple-500",
                  )}
                />
                <span className="font-medium">
                  {selectedTable?.status === "free" && "Libre"}
                  {selectedTable?.status === "occupied" && "Ocupada"}
                  {selectedTable?.status === "reserved" && "Reservada"}
                  {selectedTable?.status === "paying" && "Pagando"}
                </span>
              </div>

              {selectedTable?.status !== "free" && selectedTable?.time && (
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{selectedTable.time}</span>
                </div>
              )}
            </div>

            {selectedTable?.status !== "free" && selectedTable?.guests && (
              <div className="flex items-center gap-2 mb-4 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{selectedTable.guests} personas</span>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Cambiar estado:</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                  onClick={() => changeTableStatus("free")}
                  disabled={selectedTable?.status === "free"}
                >
                  Liberar Mesa
                </Button>
                <Button
                  variant="outline"
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                  onClick={() => changeTableStatus("occupied")}
                  disabled={selectedTable?.status === "occupied"}
                >
                  Ocupar Mesa
                </Button>
                <Button
                  variant="outline"
                  className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                  onClick={() => changeTableStatus("reserved")}
                  disabled={selectedTable?.status === "reserved"}
                >
                  Reservar Mesa
                </Button>
                <Button
                  variant="outline"
                  className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:text-purple-800"
                  onClick={() => changeTableStatus("paying")}
                  disabled={selectedTable?.status === "paying"}
                >
                  Pagando
                </Button>
              </div>
            </div>

            {selectedTable?.status === "occupied" && (
              <div className="mt-4">
                <Button className="w-full">Ver Pedido Actual</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

