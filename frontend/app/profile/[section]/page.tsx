"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronLeft, CreditCard, MapPin, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ProfileSectionPage({ params }: { params: { section: string } }) {
  const { section } = params

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
          <h1 className="text-2xl font-bold">
            {section === "personal-info" && "Información Personal"}
            {section === "addresses" && "Direcciones Guardadas"}
            {section === "payment-methods" && "Métodos de Pago"}
            {section === "favorites" && "Favoritos"}
          </h1>
        </div>
      </div>

      <div className="p-4">
        {section === "personal-info" && <PersonalInfoForm />}
        {section === "addresses" && <AddressesForm />}
        {section === "payment-methods" && <PaymentMethodsForm />}
        {section === "favorites" && <FavoritesList />}
      </div>
    </div>
  )
}

function PersonalInfoForm() {
  const [formData, setFormData] = useState({
    fullName: "Martín Rodríguez",
    dni: "34567890",
    phone: "+5491123456789",
    email: "martin@example.com",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar los datos
    alert("Información guardada correctamente")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Datos Personales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre y Apellido</Label>
            <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              pattern="\d{8}"
              placeholder="12345678"
              required
            />
            <p className="text-xs text-muted-foreground">Formato: 8 dígitos sin puntos</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+5491123456789"
              required
            />
            <p className="text-xs text-muted-foreground">Formato: +549 seguido del número sin espacios</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} readOnly />
            <p className="text-xs text-muted-foreground">No se puede modificar el correo electrónico</p>
          </div>

          <Button type="submit" className="w-full">
            Guardar Cambios
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function AddressesForm() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      street: "Av. Corrientes 1234",
      floor: "5A",
      postalCode: "C1425",
      city: "CABA",
      province: "Buenos Aires",
      label: "Casa",
    },
  ])

  const [newAddress, setNewAddress] = useState({
    street: "",
    floor: "",
    postalCode: "",
    city: "",
    province: "Buenos Aires",
    label: "Casa",
  })

  const [isAdding, setIsAdding] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAddresses((prev) => [...prev, { id: Date.now(), ...newAddress }])
    setNewAddress({
      street: "",
      floor: "",
      postalCode: "",
      city: "",
      province: "Buenos Aires",
      label: "Casa",
    })
    setIsAdding(false)
  }

  const deleteAddress = (id: number) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id))
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <Card key={address.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{address.label}</h3>
                <p className="text-sm text-muted-foreground">{address.street}</p>
                {address.floor && <p className="text-sm text-muted-foreground">Piso/Depto: {address.floor}</p>}
                <p className="text-sm text-muted-foreground">
                  {address.postalCode}, {address.city}
                </p>
                <p className="text-sm text-muted-foreground">{address.province}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => deleteAddress(address.id)}>
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Nueva Dirección
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Calle y Número</Label>
                <Input
                  id="street"
                  name="street"
                  value={newAddress.street}
                  onChange={handleChange}
                  placeholder="Av. Corrientes 1234"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Piso/Departamento (opcional)</Label>
                <Input id="floor" name="floor" value={newAddress.floor} onChange={handleChange} placeholder="5A" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={newAddress.postalCode}
                  onChange={handleChange}
                  placeholder="C1425"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Localidad</Label>
                <Input
                  id="city"
                  name="city"
                  value={newAddress.city}
                  onChange={handleChange}
                  placeholder="CABA"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Provincia</Label>
                <Select value={newAddress.province} onValueChange={(value) => handleSelectChange("province", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                    <SelectItem value="CABA">CABA</SelectItem>
                    <SelectItem value="Córdoba">Córdoba</SelectItem>
                    <SelectItem value="Santa Fe">Santa Fe</SelectItem>
                    <SelectItem value="Mendoza">Mendoza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">Etiqueta</Label>
                <Select value={newAddress.label} onValueChange={(value) => handleSelectChange("label", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar etiqueta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Trabajo">Trabajo</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Guardar Dirección
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          Agregar Nueva Dirección
        </Button>
      )}
    </div>
  )
}

function PaymentMethodsForm() {
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "mercadopago", label: "MercadoPago", default: true },
    { id: 2, type: "credit", label: "Visa terminada en 4567", default: false },
  ])

  const [isAdding, setIsAdding] = useState(false)
  const [newPayment, setNewPayment] = useState({
    type: "credit",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    cbu: "",
    alias: "",
    changeAmount: "0",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewPayment((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: string) => {
    setNewPayment((prev) => ({ ...prev, type: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let label = ""
    if (newPayment.type === "credit" || newPayment.type === "debit") {
      const lastFour = newPayment.cardNumber.slice(-4)
      label = `${newPayment.type === "credit" ? "Tarjeta de crédito" : "Tarjeta de débito"} terminada en ${lastFour}`
    } else if (newPayment.type === "mercadopago") {
      label = "MercadoPago"
    } else if (newPayment.type === "cash") {
      label = `Efectivo (vuelto para $${newPayment.changeAmount})`
    } else if (newPayment.type === "transfer") {
      label = `Transferencia a ${newPayment.alias || newPayment.cbu}`
    }

    setPaymentMethods((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: newPayment.type,
        label,
        default: false,
      },
    ])

    setNewPayment({
      type: "credit",
      cardNumber: "",
      cardName: "",
      expiry: "",
      cvv: "",
      cbu: "",
      alias: "",
      changeAmount: "0",
    })

    setIsAdding(false)
  }

  const deletePaymentMethod = (id: number) => {
    setPaymentMethods((prev) => prev.filter((method) => method.id !== id))
  }

  const setDefaultPaymentMethod = (id: number) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        default: method.id === id,
      })),
    )
  }

  return (
    <div className="space-y-4">
      {paymentMethods.map((method) => (
        <Card key={method.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                {method.type === "credit" || method.type === "debit" ? (
                  <CreditCard className="h-5 w-5 text-primary" />
                ) : method.type === "mercadopago" ? (
                  <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    MP
                  </div>
                ) : (
                  <div className="h-5 w-5 bg-muted rounded-full" />
                )}
                <div>
                  <h3 className="font-medium">{method.label}</h3>
                  {method.default && <span className="text-xs text-primary">Método predeterminado</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {!method.default && (
                  <Button variant="outline" size="sm" onClick={() => setDefaultPaymentMethod(method.id)}>
                    Predeterminado
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => deletePaymentMethod(method.id)}>
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Nuevo Método de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Pago</Label>
                <RadioGroup
                  value={newPayment.type}
                  onValueChange={handleTypeChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit">Tarjeta de Crédito</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debit" id="debit" />
                    <Label htmlFor="debit">Tarjeta de Débito</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mercadopago" id="mercadopago" />
                    <Label htmlFor="mercadopago">MercadoPago</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Efectivo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer">Transferencia Bancaria</Label>
                  </div>
                </RadioGroup>
              </div>

              {(newPayment.type === "credit" || newPayment.type === "debit") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={newPayment.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                    <Input
                      id="cardName"
                      name="cardName"
                      value={newPayment.cardName}
                      onChange={handleChange}
                      placeholder="MARTIN RODRIGUEZ"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Vencimiento (MM/AA)</Label>
                      <Input
                        id="expiry"
                        name="expiry"
                        value={newPayment.expiry}
                        onChange={handleChange}
                        placeholder="12/25"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv">Código de Seguridad</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        value={newPayment.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {newPayment.type === "cash" && (
                <div className="space-y-2">
                  <Label htmlFor="changeAmount">Vuelto para</Label>
                  <div className="flex items-center">
                    <span className="mr-2">$</span>
                    <Input
                      id="changeAmount"
                      name="changeAmount"
                      type="number"
                      value={newPayment.changeAmount}
                      onChange={handleChange}
                      placeholder="5000"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Déjalo en 0 si no necesitas vuelto</p>
                </div>
              )}

              {newPayment.type === "transfer" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cbu">CBU</Label>
                    <Input
                      id="cbu"
                      name="cbu"
                      value={newPayment.cbu}
                      onChange={handleChange}
                      placeholder="0000000000000000000000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alias">Alias</Label>
                    <Input
                      id="alias"
                      name="alias"
                      value={newPayment.alias}
                      onChange={handleChange}
                      placeholder="martin.rodriguez.mp"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Completa al menos uno de los dos campos</p>
                </>
              )}

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Guardar Método de Pago
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          Agregar Nuevo Método de Pago
        </Button>
      )}
    </div>
  )
}

function FavoritesList() {
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      name: "Milanesa Napolitana",
      description: "Milanesa de ternera con salsa de tomate, jamón y queso, acompañada de papas fritas.",
      price: 6000,
      image: "https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?q=80&w=2070&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Asado de Tira",
      description: "Tierno asado de tira a la parrilla con chimichurri casero.",
      price: 7500,
      image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=2031&auto=format&fit=crop",
    },
  ])

  const removeFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id))
  }

  return (
    <div className="space-y-4">
      {favorites.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No tienes platos favoritos guardados</p>
          <Link href="/menu">
            <Button className="mt-4">Explorar Menú</Button>
          </Link>
        </div>
      ) : (
        favorites.map((favorite) => (
          <Card key={favorite.id} className="overflow-hidden">
            <div className="flex">
              <div className="relative h-24 w-24 flex-shrink-0">
                <img
                  src={favorite.image || "/placeholder.svg"}
                  alt={favorite.name}
                  className="object-cover h-full w-full"
                />
              </div>
              <CardContent className="p-3 flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{favorite.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{favorite.description}</p>
                    <p className="font-bold text-primary mt-1">${favorite.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link href={`/menu/${favorite.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Detalle
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => removeFavorite(favorite.id)}>
                    Quitar
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

