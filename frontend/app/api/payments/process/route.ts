import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { updateTransactionStatus } from '@/lib/services/mercadopago'

// Importar MercadoPago SDK para el servidor
import { MercadoPagoConfig, Payment } from 'mercadopago'

// Configuración de MercadoPago
import { MERCADOPAGO_ACCESS_TOKEN, isMercadoPagoConfigValid } from '@/lib/supabase-config'
const mercadopago = new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN })

export async function POST(request: NextRequest) {
  try {
    // Obtener datos de la solicitud
    const { transactionId, paymentData } = await request.json()

    if (!transactionId || !paymentData) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Crear cliente de Supabase
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore.toString())

    // Verificar que la transacción existe
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*, order:orders(*)')
      .eq('id', transactionId)
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json(
        { success: false, message: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la transacción está pendiente
    if (transaction.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'La transacción ya ha sido procesada' },
        { status: 400 }
      )
    }

    // Procesar el pago según el método seleccionado
    if (paymentData.method === 'mercadopago') {
      // Crear pago con MercadoPago
      const payment = new Payment(mercadopago)

      const paymentResult = await payment.create({
        body: {
          transaction_amount: Number(transaction.amount),
          token: paymentData.token,
          description: `Pedido #${transaction.order.id.substring(0, 8)}`,
          installments: paymentData.installments || 1,
          payment_method_id: paymentData.paymentMethodId,
          payer: {
            email: paymentData.email
          }
        }
      })

      // Actualizar estado de la transacción
      const status = paymentResult.status === 'approved' ? 'approved' : 'pending'

      await updateTransactionStatus(transactionId, status, {
        transactionId: paymentResult.id.toString(),
        status: paymentResult.status,
        response: paymentResult
      })

      // Responder con el resultado
      return NextResponse.json({
        success: true,
        status: status,
        paymentId: paymentResult.id,
        redirectUrl: `/orders/confirmation?id=${transaction.order.id}`
      })
    } else if (paymentData.method === 'cash') {
      // Para pagos en efectivo, simplemente marcar como pendiente
      await updateTransactionStatus(transactionId, 'pending', {
        status: 'pending',
        response: { method: 'cash' }
      })

      return NextResponse.json({
        success: true,
        status: 'pending',
        redirectUrl: `/orders/confirmation?id=${transaction.order.id}`
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Método de pago no soportado' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error al procesar pago:', error)
    return NextResponse.json(
      { success: false, message: 'Error al procesar el pago' },
      { status: 500 }
    )
  }
}
