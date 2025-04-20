"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ArrowUpDown, Download, PackagePlus, Search } from "lucide-react"

// Datos de ejemplo para inventario
const inventoryItems = [
  {
    id: 1,
    name: "Carne molida",
    category: "Carnes",
    current: 2.5,
    unit: "kg",
    threshold: 5,
    status: "low",
    lastUpdated: "10/03/2025",
    supplier: "Frigorífico El Toro",
  },
  {
    id: 2,
    name: "Aceite de oliva",
    category: "Aceites",
    current: 0.5,
    unit: "l",
    threshold: 2,
    status: "critical",
    lastUpdated: "11/03/2025",
    supplier: "Distribuidora Gourmet",
  },
  {
    id: 3,
    name: "Queso mozzarella",
    category: "Lácteos",
    current: 1,
    unit: "kg",
    threshold: 3,
    status: "low",
    lastUpdated: "09/03/2025",
    supplier: "Lácteos del Sur",
  },
  {
    id: 4,
    name: "Tomates",
    category: "Verduras",
    current: 8,
    unit: "kg",
    threshold: 5,
    status: "ok",
    lastUpdated: "12/03/2025",
    supplier: "Verdulería Don Pedro",
  },
  {
    id: 5,
    name: "Harina 000",
    category: "Secos",
    current: 15,
    unit: "kg",
    threshold: 10,
    status: "ok",
    lastUpdated: "05/03/2025",
    supplier: "Distribuidora Alimentos SRL",
  },
  {
    id: 6,
    name: "Papas",
    category: "Verduras",
    current: 20,
    unit: "kg",
    threshold: 15,
    status: "ok",
    lastUpdated: "11/03/2025",
    supplier: "Verdulería Don Pedro",
  },
  {
    id: 7,
    name: "Vino Malbec",
    category: "Bebidas",
    current: 12,
    unit: "botellas",
    threshold: 6,
    status: "ok",
    lastUpdated: "01/03/2025",
    supplier: "Distribuidora de Bebidas",
  },
  {
    id: 8,
    name: "Café en grano",
    category: "Bebidas",
    current: 1.2,
    unit: "kg",
    threshold: 2,
    status: "low",
    lastUpdated: "08/03/2025",
    supplier: "Café Importado SA",
  },
]

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)

  const [isNewItemOpen, setIsNewItemOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    current: "",
    unit: "kg",
    threshold: "",
    supplier: "",
  })

  // Función para manejar el ordenamiento
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Función para filtrar y ordenar los items
  const getFilteredAndSortedItems = () => {
    let filteredItems = [...inventoryItems]

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filteredItems = filteredItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Aplicar filtro de categoría
    if (categoryFilter !== "all") {
      filteredItems = filteredItems.filter((item) => item.category === categoryFilter)
    }

    // Aplicar filtro de estado
    if (statusFilter !== "all") {
      filteredItems = filteredItems.filter((item) => item.status === statusFilter)
    }

    // Aplicar ordenamiento
    if (sortConfig !== null) {
      filteredItems.sort((a, b) => {
        if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    return filteredItems
  }

  const filteredAndSortedItems = getFilteredAndSortedItems()

  // Obtener categorías únicas para el filtro
  const categories = Array.from(new Set(inventoryItems.map((item) => item.category)))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewItem((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewItem((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar el nuevo item
    console.log("Nuevo item:", newItem)
    setIsNewItemOpen(false)
    // Resetear el formulario
    setNewItem({
      name: "",
      category: "",
      current: "",
      unit: "kg",
      threshold: "",
      supplier: "",
    })
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">Gestión de insumos y stock</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <PackagePlus className="h-4 w-4" />
                <span>Nuevo Insumo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nuevo Insumo</DialogTitle>
                <DialogDescription>Complete los datos para agregar un nuevo insumo al inventario</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nombre
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={newItem.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Categoría
                    </Label>
                    <Select value={newItem.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                        <SelectItem value="Nueva">+ Nueva Categoría</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="current" className="text-right">
                      Cantidad
                    </Label>
                    <Input
                      id="current"
                      name="current"
                      type="number"
                      step="0.1"
                      value={newItem.current}
                      onChange={handleInputChange}
                      className="col-span-2"
                      required
                    />
                    <Select value={newItem.unit} onValueChange={(value) => handleSelectChange("unit", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="unidades">unidades</SelectItem>
                        <SelectItem value="botellas">botellas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="threshold" className="text-right">
                      Mínimo
                    </Label>
                    <Input
                      id="threshold"
                      name="threshold"
                      type="number"
                      step="0.1"
                      value={newItem.threshold}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="supplier" className="text-right">
                      Proveedor
                    </Label>
                    <Input
                      id="supplier"
                      name="supplier"
                      value={newItem.supplier}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Guardar Insumo</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Lista de Insumos</CardTitle>
              <CardDescription>Total: {inventoryItems.length} insumos en inventario</CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar insumo..."
                  className="pl-8 h-9 sm:w-[200px] md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="ok">Stock normal</SelectItem>
                  <SelectItem value="low">Stock bajo</SelectItem>
                  <SelectItem value="critical">Stock crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <Button
                      variant="ghost"
                      className="p-0 font-medium flex items-center gap-1"
                      onClick={() => requestSort("name")}
                    >
                      Nombre
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-medium flex items-center gap-1"
                      onClick={() => requestSort("category")}
                    >
                      Categoría
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      className="p-0 font-medium flex items-center gap-1 ml-auto"
                      onClick={() => requestSort("current")}
                    >
                      Stock Actual
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Mínimo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Actualización</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No se encontraron insumos que coincidan con los filtros
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">
                        {item.current} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.threshold} {item.unit}
                      </TableCell>
                      <TableCell>
                        <InventoryStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>{item.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                          <Button variant="outline" size="sm">
                            Reponer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Insumos Críticos</CardTitle>
            <CardDescription>Insumos que requieren reposición urgente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryItems
                .filter((item) => item.status === "critical")
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Quedan: {item.current} {item.unit} (Min: {item.threshold} {item.unit})
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Pedir
                    </Button>
                  </div>
                ))}

              {inventoryItems.filter((item) => item.status === "critical").length === 0 && (
                <div className="text-center py-4 text-muted-foreground">No hay insumos en estado crítico</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proveedores</CardTitle>
            <CardDescription>Lista de proveedores activos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(inventoryItems.map((item) => item.supplier))).map((supplier) => (
                <div key={supplier} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{supplier}</div>
                    <div className="text-xs text-muted-foreground">
                      {inventoryItems.filter((item) => item.supplier === supplier).length} insumos
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Ver Detalles
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InventoryStatusBadge({ status }: { status: string }) {
  let color = ""
  let label = ""

  switch (status) {
    case "ok":
      color = "bg-green-100 text-green-800 border-green-200"
      label = "Normal"
      break
    case "low":
      color = "bg-amber-100 text-amber-800 border-amber-200"
      label = "Bajo"
      break
    case "critical":
      color = "bg-red-100 text-red-800 border-red-200"
      label = "Crítico"
      break
    default:
      color = "bg-gray-100 text-gray-800 border-gray-200"
      label = status
  }

  return (
    <Badge variant="outline" className={`${color}`}>
      {label}
    </Badge>
  )
}

