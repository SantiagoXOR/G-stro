"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, CreditCard, Minus, Plus, Trash2, Wallet, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCartStore, CartItem } from "@/lib/store/cart-store"
import { createOrder } from "@/lib/services/orders"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { getUserPaymentMethods, createPaymentTransaction, processPayment, initMercadoPago } from "@/lib/services/mercadopago"
import { getTableByNumber } from "@/lib/services/tables"
import { MercadoPagoPaymentForm } from "@/components/mercadopago-payment-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"



// Tipos de métodos de pago disponibles
const paymentMethodTypes = [
  { id: "mercadopago", name: "MercadoPago", icon: "https://www.mercadopago.com/favicon.ico" },
  { id: "credit_card", name: "Tarjeta de Crédito", icon: CreditCard },
  { id: "debit_card", name: "Tarjeta de Débito", icon: CreditCard },
  { id: "cash", name: "Efectivo", icon: Wallet },
]

export default function CartPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get("table")
  const { user } = useAuth()
  const cartItems = useCartStore((state) => state.items)
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotal = useCartStore((state) => state.getTotal)
  const [selectedPayment, setSelectedPayment] = useState("mercadopago")
  const [isProcessing, setIsProcessing] = useState(false)
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([])
  const [selectedSavedMethod, setSelectedSavedMethod] = useState(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [mercadoPagoSDK, setMercadoPagoSDK] = useState(null)
  const [tableInfo, setTableInfo] = useState<{ id: string; number: number; location?: string } | null>(null)

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    updateItemQuantity(id, newQuantity)
  }

  const handleRemoveItem = (id: string) => {
    removeItem(id)
  }

  // Cargar métodos de pago guardados y SDK de MercadoPago
  useEffect(() => {
    if (!user) return

    // Inicializar MercadoPago
    const loadMercadoPago = async () => {
      const sdk = await initMercadoPago()
      setMercadoPagoSDK(sdk)
    }

    loadMercadoPago()

    // Cargar métodos de pago guardados
    const fetchPaymentMethods = async () => {
      try {
        const methods = await getUserPaymentMethods(user.id)
        setSavedPaymentMethods(methods)

        // Seleccionar el método predeterminado si existe
        const defaultMethod = methods.find(m => m.is_default)
        if (defaultMethod) {
          setSelectedSavedMethod(defaultMethod.id)
          setSelectedPayment(defaultMethod.type)
        }
      } catch (error) {
        console.error("Error al cargar métodos de pago:", error)
      }
    }

    fetchPaymentMethods()
  }, [user])

  // Cargar información de la mesa si se proporciona un número de mesa
  useEffect(() => {
    const fetchTableInfo = async () => {
      if (!tableNumber) return

      try {
        const tableNumberInt = parseInt(tableNumber)
        if (isNaN(tableNumberInt)) return

        const table = await getTableByNumber(tableNumberInt)
        if (table) {
          setTableInfo({
            id: table.id,
            number: table.table_number,
            location: table.location || undefined
          })
        }
      } catch (error) {
        console.error("Error al cargar información de la mesa:", error)
      }
    }

    fetchTableInfo()
  }, [tableNumber])

  const handleCheckout = async () => {
    if (!user) {
      // Si el usuario no está autenticado, redirigir al inicio de sesión
      toast.error("Debes iniciar sesión para realizar un pedido", {
        action: {
          label: "Iniciar Sesión",
          onClick: () => router.push("/auth/login")
        }
      })
      return
    }

    setIsProcessing(true)

    try {
      // Crear el pedido en la base de datos
      const order = {
        customer_id: user.id,
        status: "pending" as const,
        notes: tableInfo ? `Pedido realizado desde la mesa ${tableInfo.number}` : "Pedido realizado desde la app",
        table_number: tableInfo ? tableInfo.number : null
      }

      // Convertir los items del carrito a items de pedido
      const orderItems = cartItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        notes: item.notes
      }))

      // Crear el pedido
      const result = await createOrder(order, orderItems)

      if (result) {
        // Crear transacción de pago
        const transaction = await createPaymentTransaction(
          result.id,
          calculateTotal(),
          selectedSavedMethod
        )

        if (transaction) {
          // Abrir diálogo de pago o procesar directamente según el método
          if (selectedPayment === "cash") {
            // Para pagos en efectivo, procesar directamente
            const paymentResult = await processPayment(transaction.id, {
              method: "cash"
            })

            if (paymentResult.success) {
              // Limpiar el carrito
              clearCart()

              // Mostrar mensaje de éxito
              toast.success("Pedido realizado con éxito", {
                description: `Tu pedido #${result.id.substring(0, 8)} ha sido recibido.`,
                action: {
                  label: "Ver Detalles",
                  onClick: () => router.push(`/orders/${result.id}`)
                }
              })

              // Redirigir a la página de confirmación
              router.push(paymentResult.redirectUrl || `/orders/confirmation?id=${result.id}`)
            } else {
              throw new Error(paymentResult.error || "Error al procesar el pago")
            }
          } else {
            // Para otros métodos, abrir diálogo de pago
            setIsPaymentDialogOpen(true)
            setIsProcessing(false)
          }
        } else {
          throw new Error("Error al crear la transacción de pago")
        }
      } else {
        throw new Error("Error al crear el pedido")
      }
    } catch (error) {
      console.error("Error al procesar el pedido:", error)
      toast.error("Error al procesar el pedido. Inténtalo de nuevo.")
      setIsProcessing(false)
    }
  }

  // Procesar pago con MercadoPago
  const handleProcessPayment = async (paymentData) => {
    setIsProcessing(true)

    try {
      // Obtener el ID de la transacción del pedido actual
      const orderId = cartItems[0]?.orderId // Esto debería venir de algún lugar después de crear el pedido
      const transactionId = "transaction-id" // Esto debería venir de algún lugar después de crear la transacción

      // Procesar el pago
      const paymentResult = await processPayment(transactionId, {
        method: selectedPayment,
        ...paymentData
      })

      if (paymentResult.success) {
        // Limpiar el carrito
        clearCart()

        // Cerrar diálogo
        setIsPaymentDialogOpen(false)

        // Mostrar mensaje de éxito
        toast.success("Pago procesado correctamente", {
          description: `Tu pedido ha sido confirmado.`
        })

        // Redirigir a la página de confirmación
        router.push(paymentResult.redirectUrl)
      } else {
        throw new Error(paymentResult.error || "Error al procesar el pago")
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error)
      toast.error("Error al procesar el pago. Inténtalo de nuevo.")
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateSubtotal = () => {
    return getTotal()
  }

  const calculateDelivery = () => {
    return 500 // Fixed delivery fee
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDelivery()
  }

  return (
    <div className="flex flex-col pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background pt-4 pb-2 px-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/menu">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Tu Pedido</h1>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
          <div className="bg-muted rounded-full p-6 mb-4">
            <Wallet className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Tu carrito está vacío</h2>
          <p className="text-muted-foreground mb-6">Agregá productos del menú para comenzar tu pedido</p>
          <Link href="/menu">
            <Button>Ver Menú</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Información de la mesa */}
          {tableInfo && (
            <Card className="mb-4 mx-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Mesa {tableInfo.number}</h3>
                    {tableInfo.location && (
                      <p className="text-xs text-muted-foreground">{tableInfo.location}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cart Items */}
          <div className="p-4 space-y-3">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.options}</p>
                      {item.notes && <p className="text-xs italic text-muted-foreground mt-1">"{item.notes}"</p>}
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-medium text-primary">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2 font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Method */}
          <div className="p-4">
            <h2 className="text-lg font-bold mb-3">Método de Pago</h2>

            {/* Métodos guardados */}
            {savedPaymentMethods.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Tus métodos guardados</h3>
                <div className="space-y-2">
                  {savedPaymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSavedMethod === method.id ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => {
                        setSelectedSavedMethod(method.id)
                        setSelectedPayment(method.type)
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {method.type === "credit_card" || method.type === "debit_card" ? (
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                        ) : method.type === "mercadopago" ? (
                          <div className="relative h-6 w-6">
                            <Image
                              src="https://www.mercadopago.com/favicon.ico"
                              alt="MercadoPago"
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <Wallet className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <span>{method.type === "credit_card" ? "Tarjeta terminada en " + method.last_four :
                                 method.type === "debit_card" ? "Débito terminada en " + method.last_four :
                                 method.type === "mercadopago" ? "MercadoPago" : "Efectivo"}</span>
                          {method.is_default && (
                            <span className="text-xs text-primary ml-2">(Predeterminado)</span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                          selectedSavedMethod === method.id ? "border-primary bg-primary text-white" : "border-muted-foreground"
                        }`}
                      >
                        {selectedSavedMethod === method.id && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separador */}
            {savedPaymentMethods.length > 0 && (
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">O SELECCIONA OTRO MÉTODO</span>
                </div>
              </div>
            )}

            {/* Otros métodos de pago */}
            <div className="space-y-2">
              {paymentMethodTypes.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPayment === method.id && !selectedSavedMethod ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => {
                    setSelectedPayment(method.id)
                    setSelectedSavedMethod(null)
                  }}
                >
                  <div className="flex items-center gap-3">
                    {typeof method.icon === "string" ? (
                      <div className="relative h-6 w-6">
                        <Image
                          src={method.icon || "/placeholder.svg"}
                          alt={method.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <method.icon className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span>{method.name}</span>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                      selectedPayment === method.id && !selectedSavedMethod ? "border-primary bg-primary text-white" : "border-muted-foreground"
                    }`}
                  >
                    {selectedPayment === method.id && !selectedSavedMethod && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Enlace a gestión de métodos de pago */}
            <Button
              variant="link"
              className="w-full mt-2 text-sm"
              onClick={() => router.push("/profile/payment-methods")}
            >
              Gestionar métodos de pago
            </Button>
          </div>

          {/* Order Summary */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 max-w-md mx-auto">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span>${calculateDelivery().toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${calculateTotal().toLocaleString()}</span>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || isProcessing}
            >
              {isProcessing ? "Procesando..." : "Confirmar Pedido"}
            </Button>
          </div>
        </>
      )}

      {/* Diálogo de pago con MercadoPago */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesar Pago</DialogTitle>
            <DialogDescription>
              Completa los datos para procesar tu pago
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPayment === "mercadopago" && (
              <MercadoPagoPaymentForm
                amount={calculateTotal()}
                onSubmit={handleProcessPayment}
                onCancel={() => setIsPaymentDialogOpen(false)}
                isProcessing={isProcessing}
              />
            )}
            {selectedPayment !== "mercadopago" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Esta es una implementación de ejemplo para {paymentMethodTypes.find(m => m.id === selectedPayment)?.name}.
                </p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} disabled={isProcessing}>
                    Cancelar
                  </Button>
                  <Button onClick={() => handleProcessPayment({})} disabled={isProcessing}>
                    {isProcessing ? "Procesando..." : "Pagar"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
