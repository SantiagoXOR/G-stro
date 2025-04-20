"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, CreditCard, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  getUserPaymentMethods,
  savePaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  PaymentMethod,
  initMercadoPago
} from "@/lib/services/mercadopago"

export default function PaymentMethodsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null)
  const [mercadoPagoSDK, setMercadoPagoSDK] = useState<any>(null)

  // Formulario para nuevo método de pago
  const [newPayment, setNewPayment] = useState({
    type: "credit_card" as const,
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    is_default: false
  })

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Inicializar MercadoPago
    const loadMercadoPago = async () => {
      const sdk = await initMercadoPago()
      setMercadoPagoSDK(sdk)
    }

    loadMercadoPago()

    // Cargar métodos de pago
    const fetchPaymentMethods = async () => {
      try {
        setIsLoading(true)
        const methods = await getUserPaymentMethods(user.id)
        setPaymentMethods(methods)
      } catch (error) {
        console.error("Error al cargar métodos de pago:", error)
        toast.error("Error al cargar métodos de pago")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewPayment((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: "credit_card" | "debit_card" | "mercadopago" | "cash" | "transfer") => {
    setNewPayment((prev) => ({ ...prev, type: value }))
  }

  const handleAddPaymentMethod = async () => {
    if (!user) return

    try {
      // Validar datos según el tipo
      if (newPayment.type === "credit_card" || newPayment.type === "debit_card") {
        if (!newPayment.cardNumber || !newPayment.cardName || !newPayment.expiry || !newPayment.cvv) {
          toast.error("Por favor, completa todos los campos")
          return
        }
      }

      // Procesar datos según el tipo
      let paymentMethodData: any = {
        type: newPayment.type,
        is_default: newPayment.is_default
      }

      if (newPayment.type === "credit_card" || newPayment.type === "debit_card") {
        // Extraer los últimos 4 dígitos
        const lastFour = newPayment.cardNumber.slice(-4)
        
        // Determinar la marca de la tarjeta (simplificado)
        let cardBrand = "Otra"
        if (newPayment.cardNumber.startsWith("4")) {
          cardBrand = "Visa"
        } else if (newPayment.cardNumber.startsWith("5")) {
          cardBrand = "Mastercard"
        } else if (newPayment.cardNumber.startsWith("3")) {
          cardBrand = "American Express"
        }

        paymentMethodData = {
          ...paymentMethodData,
          last_four: lastFour,
          card_brand: cardBrand,
          expiry_date: newPayment.expiry,
          cardholder_name: newPayment.cardName
        }
      }

      // Guardar el método de pago
      const result = await savePaymentMethod(user.id, paymentMethodData)

      if (result) {
        toast.success("Método de pago guardado correctamente")
        setPaymentMethods((prev) => [result, ...prev.filter(m => m.id !== result.id)])
        setIsAddDialogOpen(false)
        
        // Resetear el formulario
        setNewPayment({
          type: "credit_card",
          cardNumber: "",
          cardName: "",
          expiry: "",
          cvv: "",
          is_default: false
        })
      } else {
        throw new Error("Error al guardar método de pago")
      }
    } catch (error) {
      console.error("Error al guardar método de pago:", error)
      toast.error("Error al guardar método de pago")
    }
  }

  const handleSetDefault = async (id: string) => {
    if (!user) return

    try {
      const success = await setDefaultPaymentMethod(user.id, id)
      
      if (success) {
        // Actualizar la lista localmente
        setPaymentMethods((prev) =>
          prev.map((method) => ({
            ...method,
            is_default: method.id === id
          }))
        )
        
        toast.success("Método de pago predeterminado actualizado")
      } else {
        throw new Error("Error al actualizar método de pago predeterminado")
      }
    } catch (error) {
      console.error("Error al establecer método de pago predeterminado:", error)
      toast.error("Error al actualizar método de pago predeterminado")
    }
  }

  const handleDeleteClick = (id: string) => {
    setSelectedMethodId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!user || !selectedMethodId) return

    try {
      const success = await deletePaymentMethod(user.id, selectedMethodId)
      
      if (success) {
        // Actualizar la lista localmente
        setPaymentMethods((prev) => prev.filter((method) => method.id !== selectedMethodId))
        
        toast.success("Método de pago eliminado correctamente")
        setIsDeleteDialogOpen(false)
        setSelectedMethodId(null)
      } else {
        throw new Error("Error al eliminar método de pago")
      }
    } catch (error) {
      console.error("Error al eliminar método de pago:", error)
      toast.error("Error al eliminar método de pago")
    }
  }

  // Función para formatear la información de la tarjeta
  const formatCardInfo = (method: PaymentMethod) => {
    if (method.type === "credit_card" || method.type === "debit_card") {
      return `${method.card_brand || "Tarjeta"} terminada en ${method.last_four || "****"}`
    } else if (method.type === "mercadopago") {
      return "Cuenta de MercadoPago"
    } else if (method.type === "cash") {
      return "Efectivo"
    } else if (method.type === "transfer") {
      return "Transferencia bancaria"
    }
    return "Método de pago"
  }

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
          <h1 className="text-2xl font-bold">Métodos de Pago</h1>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Botón para agregar nuevo método */}
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Agregar Método de Pago
            </Button>

            {/* Lista de métodos de pago */}
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tienes métodos de pago guardados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <Card key={method.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {method.type === "credit_card" || method.type === "debit_card" ? (
                            <CreditCard className="h-5 w-5 text-primary" />
                          ) : method.type === "mercadopago" ? (
                            <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                              MP
                            </div>
                          ) : (
                            <div className="h-5 w-5 bg-muted rounded-full" />
                          )}
                          <div>
                            <p className="font-medium">{formatCardInfo(method)}</p>
                            <p className="text-xs text-muted-foreground">
                              {method.type === "credit_card"
                                ? "Tarjeta de crédito"
                                : method.type === "debit_card"
                                ? "Tarjeta de débito"
                                : method.type === "mercadopago"
                                ? "MercadoPago"
                                : method.type === "cash"
                                ? "Efectivo"
                                : "Transferencia"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteClick(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        {method.is_default ? (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Predeterminado
                          </span>
                        ) : (
                          <span></span>
                        )}
                        {!method.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleSetDefault(method.id)}
                          >
                            Establecer como predeterminado
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Diálogo para agregar método de pago */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Método de Pago</DialogTitle>
            <DialogDescription>
              Ingresa los datos de tu nuevo método de pago
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Método</Label>
              <RadioGroup
                value={newPayment.type}
                onValueChange={(value) => handleTypeChange(value as any)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card">Tarjeta de Crédito</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="debit_card" id="debit_card" />
                  <Label htmlFor="debit_card">Tarjeta de Débito</Label>
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

            {/* Campos específicos según el tipo */}
            {(newPayment.type === "credit_card" || newPayment.type === "debit_card") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={newPayment.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                  <Input
                    id="cardName"
                    name="cardName"
                    value={newPayment.cardName}
                    onChange={handleInputChange}
                    placeholder="NOMBRE APELLIDO"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Vencimiento (MM/AA)</Label>
                    <Input
                      id="expiry"
                      name="expiry"
                      value={newPayment.expiry}
                      onChange={handleInputChange}
                      placeholder="MM/AA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">Código de Seguridad</Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      value={newPayment.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      type="password"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Opción para establecer como predeterminado */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="is_default"
                checked={newPayment.is_default}
                onChange={(e) => setNewPayment((prev) => ({ ...prev, is_default: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="is_default" className="text-sm font-normal">
                Establecer como método de pago predeterminado
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPaymentMethod}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Método de Pago</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este método de pago? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
