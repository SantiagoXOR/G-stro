"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarPlus, Clock, Download, Filter, Phone, Search, User, Users } from "lucide-react"

// Datos de ejemplo para reservas
const reservations = [
  {
    id: "RES-001",
    name: "Martín García",
    phone: "+5491123456789",
    date: "12/03/2025",
    time: "20:30",
    guests: 4,
    table: 5,
    status: "confirmed",
    notes: "Prefiere mesa alejada de la cocina",
  },
  {
    id: "RES-002",
    name: "Laura Fernández",
    phone: "+5491187654321",
    date: "12/03/2025",
    time: "21:00",
    guests: 2,
    table: 3,
    status: "confirmed",
    notes: "",
  },
  {
    id: "RES-003",
    name: "Carlos Rodríguez",
    phone: "+5491145678923",
    date: "13/03/2025",
    time: "13:30",
    guests: 6,
    table: 9,
    status: "pending",
    notes: "Celebración de cumpleaños",
  },
  {
    id: "RES-004",
    name: "Sofía Martínez",
    phone: "+5491156781234",
    date: "13/03/2025",
    time: "20:00",
    guests: 3,
    table: 4,
    status: "confirmed",
    notes: "",
  },
  {
    id: "RES-005",
    name: "Diego López",
    phone: "+5491178901234",
    date: "14/03/2025",
    time: "21:30",
    guests: 2,
    table: 2,
    status: "cancelled",
    notes: "Canceló por motivos personales",
  },
]

export default function ReservationsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false)
  const [newReservation, setNewReservation] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    table: "",
    notes: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewReservation((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewReservation((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar la reserva
    console.log("Nueva reserva:", newReservation)
    setIsNewReservationOpen(false)
    // Resetear el formulario
    setNewReservation({
      name: "",
      phone: "",
      date: "",
      time: "",
      guests: "2",
      table: "",
      notes: "",
    })
  }

  // Filtrar reservas por la fecha seleccionada
  const filteredReservations = reservations.filter(
    (res) => res.date === date?.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }),
  )

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground">Gestión de reservas del restaurante</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isNewReservationOpen} onOpenChange={setIsNewReservationOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <CalendarPlus className="h-4 w-4" />
                <span>Nueva Reserva</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nueva Reserva</DialogTitle>
                <DialogDescription>Complete los datos para crear una nueva reserva</DialogDescription>
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
                      value={newReservation.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={newReservation.phone}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Fecha
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={newReservation.date}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="time" className="text-right">
                      Hora
                    </Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={newReservation.time}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="guests" className="text-right">
                      Comensales
                    </Label>
                    <Select
                      value={newReservation.guests}
                      onValueChange={(value) => handleSelectChange("guests", value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "persona" : "personas"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="table" className="text-right">
                      Mesa
                    </Label>
                    <Select value={newReservation.table} onValueChange={(value) => handleSelectChange("table", value)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Asignar mesa" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            Mesa {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notas
                    </Label>
                    <Input
                      id="notes"
                      name="notes"
                      value={newReservation.notes}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Guardar Reserva</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
            <CardDescription>Seleccione una fecha para ver las reservas</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />

            <div className="mt-6 space-y-2">
              <h3 className="font-medium text-sm">Resumen del día</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Total reservas:</span>
                  <span className="font-medium">{filteredReservations.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Comensales:</span>
                  <span className="font-medium">{filteredReservations.reduce((sum, res) => sum + res.guests, 0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Confirmadas:</span>
                  <span className="font-medium">
                    {filteredReservations.filter((res) => res.status === "confirmed").length}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Pendientes:</span>
                  <span className="font-medium">
                    {filteredReservations.filter((res) => res.status === "pending").length}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Reservas del día</CardTitle>
                <CardDescription>
                  {date?.toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </CardDescription>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Buscar reserva..." className="pl-8 h-9 md:w-[200px] lg:w-[300px]" />
                </div>

                <Button variant="outline" size="sm" className="h-9 gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden md:inline">Filtrar</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmadas</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {filteredReservations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No hay reservas para esta fecha</div>
                ) : (
                  <div className="space-y-4">
                    {filteredReservations.map((reservation) => (
                      <ReservationCard key={reservation.id} reservation={reservation} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="confirmed" className="mt-4">
                {filteredReservations.filter((r) => r.status === "confirmed").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay reservas confirmadas para esta fecha
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReservations
                      .filter((r) => r.status === "confirmed")
                      .map((reservation) => (
                        <ReservationCard key={reservation.id} reservation={reservation} />
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                {filteredReservations.filter((r) => r.status === "pending").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay reservas pendientes para esta fecha
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReservations
                      .filter((r) => r.status === "pending")
                      .map((reservation) => (
                        <ReservationCard key={reservation.id} reservation={reservation} />
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="mt-4">
                {filteredReservations.filter((r) => r.status === "cancelled").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay reservas canceladas para esta fecha
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReservations
                      .filter((r) => r.status === "cancelled")
                      .map((reservation) => (
                        <ReservationCard key={reservation.id} reservation={reservation} />
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ReservationCard({ reservation }: { reservation: any }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="bg-muted rounded-full p-2">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">{reservation.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{reservation.phone}</span>
            </div>
          </div>
        </div>

        <StatusBadge status={reservation.status} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{reservation.time}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{reservation.guests} personas</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-medium">Mesa {reservation.table}</span>
        </div>
      </div>

      {reservation.notes && (
        <div className="mt-2 text-sm">
          <span className="text-muted-foreground italic">"{reservation.notes}"</span>
        </div>
      )}

      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm">
          Editar
        </Button>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-600 hover:bg-red-50">
          Cancelar
        </Button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let color = ""
  let label = ""

  switch (status) {
    case "confirmed":
      color = "bg-green-100 text-green-800 border-green-200"
      label = "Confirmada"
      break
    case "pending":
      color = "bg-amber-100 text-amber-800 border-amber-200"
      label = "Pendiente"
      break
    case "cancelled":
      color = "bg-red-100 text-red-800 border-red-200"
      label = "Cancelada"
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

