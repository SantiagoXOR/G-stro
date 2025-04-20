import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { updateTransactionStatus } from '@/lib/services/mercadopago'
import { MercadoPagoConfig, Payment } from 'mercadopago'

// Configuración de Supabase y MercadoPago
import { SUPABASE_URL, SUPABASE_ANON_KEY, MERCADOPAGO_ACCESS_TOKEN } from '@/lib/supabase-config'

// Clave de servicio para acceso completo (debe estar en variables de entorno)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Configuración de MercadoPago
const mercadopago = new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN })

export async function POST(request: NextRequest) {
  try {
    // Verificar que tenemos las credenciales necesarias
    if (!SUPABASE_URL || !supabaseServiceKey || !MERCADOPAGO_ACCESS_TOKEN) {
      console.error('Faltan variables de entorno necesarias')
      return NextResponse.json({ success: false, message: 'Configuración incompleta' }, { status: 500 })
    }

    // Crear cliente de Supabase con la clave de servicio para acceso completo
    const supabase = createClient(SUPABASE_URL, supabaseServiceKey)

    // Obtener datos de la notificación
    const data = await request.json()

    // Verificar tipo de notificación
    if (data.type !== 'payment' || !data.data || !data.data.id) {
      return NextResponse.json({ success: true, message: 'Notificación ignorada' })
    }

    // Obtener detalles del pago desde MercadoPago
    const payment = new Payment(mercadopago)
    const paymentInfo = await payment.get({ id: data.data.id })

    if (!paymentInfo || !paymentInfo.external_reference) {
      return NextResponse.json({ success: false, message: 'Información de pago incompleta' }, { status: 400 })
    }

    // La referencia externa debe ser el ID de la transacción
    const transactionId = paymentInfo.external_reference

    // Buscar la transacción en nuestra base de datos
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transactionId)
      .single()

    if (transactionError || !transaction) {
      console.error('Transacción no encontrada:', transactionId)
      return NextResponse.json({ success: false, message: 'Transacción no encontrada' }, { status: 404 })
    }

    // Mapear el estado de MercadoPago a nuestro estado
    let status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'cancelled'

    switch (paymentInfo.status) {
      case 'approved':
        status = 'approved'
        break
      case 'rejected':
        status = 'rejected'
        break
      case 'refunded':
        status = 'refunded'
        break
      case 'cancelled':
        status = 'cancelled'
        break
      default:
        status = 'pending'
    }

    // Actualizar el estado de la transacción
    await updateTransactionStatus(transactionId, status, {
      transactionId: paymentInfo.id.toString(),
      status: paymentInfo.status,
      response: paymentInfo
    })

    return NextResponse.json({ success: true, message: 'Notificación procesada correctamente' })
  } catch (error) {
    console.error('Error al procesar webhook de MercadoPago:', error)
    return NextResponse.json({ success: false, message: 'Error al procesar la notificación' }, { status: 500 })
  }
}
