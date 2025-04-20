"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface MercadoPagoPaymentFormProps {
  amount: number
  onSubmit: (paymentData: any) => Promise<void>
  onCancel: () => void
  isProcessing: boolean
}

export function MercadoPagoPaymentForm({
  amount,
  onSubmit,
  onCancel,
  isProcessing
}: MercadoPagoPaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("")
  const [cardholderName, setCardholderName] = useState("")
  const [expirationDate, setExpirationDate] = useState("")
  const [securityCode, setSecurityCode] = useState("")
  const [installments, setInstallments] = useState("1")
  const [email, setEmail] = useState("")
  const [paymentMethodId, setPaymentMethodId] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)
  const [cardToken, setCardToken] = useState("")
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)

  // Validar formulario
  useEffect(() => {
    const isValid = 
      cardNumber.length >= 15 &&
      cardholderName.length > 3 &&
      expirationDate.length === 5 &&
      securityCode.length >= 3 &&
      email.includes("@") &&
      installments !== ""
    
    setIsFormValid(isValid)
  }, [cardNumber, cardholderName, expirationDate, securityCode, email, installments])

  // Formatear número de tarjeta
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  // Formatear fecha de expiración
  const formatExpirationDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    
    return v
  }

  // Generar token de tarjeta
  const generateCardToken = async () => {
    if (!isFormValid) return

    setIsGeneratingToken(true)

    try {
      // En una implementación real, aquí se usaría el SDK de MercadoPago
      // para generar un token de tarjeta
      
      // Simulación de generación de token
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Token simulado
      const simulatedToken = `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
      setCardToken(simulatedToken)
      
      // Determinar el tipo de tarjeta basado en el número
      // En una implementación real, esto lo haría el SDK de MercadoPago
      let detectedPaymentMethodId = "visa"
      if (cardNumber.startsWith("5")) {
        detectedPaymentMethodId = "master"
      } else if (cardNumber.startsWith("3")) {
        detectedPaymentMethodId = "amex"
      }
      
      setPaymentMethodId(detectedPaymentMethodId)
      
      toast.success("Tarjeta validada correctamente")
      
      // Enviar datos al componente padre
      await onSubmit({
        method: "mercadopago",
        token: simulatedToken,
        paymentMethodId: detectedPaymentMethodId,
        installments: parseInt(installments),
        email
      })
    } catch (error) {
      console.error("Error al generar token de tarjeta:", error)
      toast.error("Error al procesar la tarjeta. Inténtalo de nuevo.")
    } finally {
      setIsGeneratingToken(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Número de tarjeta</Label>
        <Input
          id="cardNumber"
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          maxLength={19}
          disabled={isProcessing || isGeneratingToken}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cardholderName">Nombre del titular</Label>
        <Input
          id="cardholderName"
          placeholder="Como aparece en la tarjeta"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          disabled={isProcessing || isGeneratingToken}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expirationDate">Vencimiento (MM/YY)</Label>
          <Input
            id="expirationDate"
            placeholder="MM/YY"
            value={expirationDate}
            onChange={(e) => setExpirationDate(formatExpirationDate(e.target.value))}
            maxLength={5}
            disabled={isProcessing || isGeneratingToken}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="securityCode">Código de seguridad</Label>
          <Input
            id="securityCode"
            placeholder="CVV"
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, ""))}
            maxLength={4}
            type="password"
            disabled={isProcessing || isGeneratingToken}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isProcessing || isGeneratingToken}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="installments">Cuotas</Label>
        <Select
          value={installments}
          onValueChange={setInstallments}
          disabled={isProcessing || isGeneratingToken}
        >
          <SelectTrigger id="installments">
            <SelectValue placeholder="Selecciona las cuotas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 cuota</SelectItem>
            <SelectItem value="3">3 cuotas</SelectItem>
            <SelectItem value="6">6 cuotas</SelectItem>
            <SelectItem value="12">12 cuotas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing || isGeneratingToken}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={generateCardToken}
          disabled={!isFormValid || isProcessing || isGeneratingToken}
        >
          {isGeneratingToken ? "Procesando..." : `Pagar $${amount.toLocaleString()}`}
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground text-center pt-2">
        <p>Implementación de ejemplo. En producción, se utilizaría el SDK oficial de MercadoPago.</p>
      </div>
    </div>
  )
}
