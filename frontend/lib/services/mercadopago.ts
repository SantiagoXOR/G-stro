import { getSupabaseClient } from "@/lib/supabase"
import type { Database } from "../../../shared/types/database.types"
import { MERCADOPAGO_PUBLIC_KEY, isMercadoPagoConfigValid } from "@/lib/supabase-config"

// Tipos
export type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"]
export type PaymentTransaction = Database["public"]["Tables"]["payment_transactions"]["Row"]

// Verificar que la configuración de MercadoPago sea válida
const configCheck = isMercadoPagoConfigValid()
if (!configCheck.valid && process.env.NODE_ENV !== 'test') {
  console.error(`Faltan variables de entorno de MercadoPago: ${configCheck.missingVars.join(', ')}`)
}

/**
 * Inicializa el SDK de MercadoPago
 * Esta función debe ser llamada en el cliente antes de usar cualquier funcionalidad de MercadoPago
 */
export async function initMercadoPago() {
  if (typeof window === 'undefined') return null

  try {
    // Importar dinámicamente el SDK de MercadoPago (solo en el cliente)
    const mercadopago = await import('@mercadopago/sdk-react')

    // Inicializar el SDK
    mercadopago.initMercadoPago(MERCADOPAGO_PUBLIC_KEY, {
      locale: 'es-AR'
    })

    return mercadopago
  } catch (error) {
    console.error('Error al inicializar MercadoPago:', error)
    return null
  }
}

/**
 * Obtiene los métodos de pago guardados del usuario
 */
export async function getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  const supabase = await getSupabaseClient()
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error al obtener métodos de pago:', error)
    throw error
  }

  return data || []
}

/**
 * Guarda un nuevo método de pago
 */
export async function savePaymentMethod(
  userId: string,
  paymentMethod: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<PaymentMethod | null> {
  const supabase = await getSupabaseClient()

  // Si es el primer método de pago, establecerlo como predeterminado
  const { count } = await supabase
    .from('payment_methods')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const isDefault = count === 0 ? true : paymentMethod.is_default

  // Insertar el nuevo método de pago
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      ...paymentMethod,
      user_id: userId,
      is_default: isDefault
    })
    .select()
    .single()

  if (error) {
    console.error('Error al guardar método de pago:', error)
    return null
  }

  // Si se establece como predeterminado, actualizar los demás métodos
  if (isDefault) {
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId)
      .neq('id', data.id)
  }

  return data
}

/**
 * Establece un método de pago como predeterminado
 */
export async function setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
  const supabase = await getSupabaseClient()

  // Primero, establecer todos los métodos como no predeterminados
  const { error: error1 } = await supabase
    .from('payment_methods')
    .update({ is_default: false })
    .eq('user_id', userId)

  if (error1) {
    console.error('Error al actualizar métodos de pago:', error1)
    return false
  }

  // Luego, establecer el método seleccionado como predeterminado
  const { error: error2 } = await supabase
    .from('payment_methods')
    .update({ is_default: true })
    .eq('id', paymentMethodId)
    .eq('user_id', userId)

  if (error2) {
    console.error('Error al establecer método de pago predeterminado:', error2)
    return false
  }

  return true
}

/**
 * Elimina un método de pago
 */
export async function deletePaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
  const supabase = await getSupabaseClient()

  // Verificar si es el método predeterminado
  const { data: method, error: fetchError } = await supabase
    .from('payment_methods')
    .select('is_default')
    .eq('id', paymentMethodId)
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    console.error('Error al verificar método de pago:', fetchError)
    return false
  }

  // Eliminar el método de pago
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', paymentMethodId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error al eliminar método de pago:', error)
    return false
  }

  // Si era el método predeterminado, establecer otro como predeterminado
  if (method.is_default) {
    const { data: methods, error: listError } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (!listError && methods.length > 0) {
      await setDefaultPaymentMethod(userId, methods[0].id)
    }
  }

  return true
}

/**
 * Crea una transacción de pago
 */
export async function createPaymentTransaction(
  orderId: string,
  amount: number,
  paymentMethodId?: string
): Promise<PaymentTransaction | null> {
  const supabase = await getSupabaseClient()

  // Crear la transacción de pago
  const { data, error } = await supabase
    .from('payment_transactions')
    .insert({
      order_id: orderId,
      payment_method_id: paymentMethodId || null,
      amount,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Error al crear transacción de pago:', error)
    return null
  }

  // Actualizar el pedido con la referencia a la transacción
  await supabase
    .from('orders')
    .update({
      payment_transaction_id: data.id,
      payment_status: 'pending'
    })
    .eq('id', orderId)

  return data
}

/**
 * Procesa un pago con MercadoPago
 * Esta función debe ser llamada desde el cliente
 */
export async function processPayment(
  transactionId: string,
  paymentData: any
): Promise<{ success: boolean; error?: string; redirectUrl?: string }> {
  try {
    // Llamar a la API para procesar el pago
    const response = await fetch('/api/payments/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transactionId,
        paymentData
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.message || 'Error al procesar el pago'
      }
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error al procesar pago:', error)
    return {
      success: false,
      error: 'Error de conexión al procesar el pago'
    }
  }
}

/**
 * Obtiene el estado de una transacción
 */
export async function getTransactionStatus(transactionId: string): Promise<PaymentTransaction | null> {
  const supabase = await getSupabaseClient()
  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (error) {
    console.error('Error al obtener estado de transacción:', error)
    return null
  }

  return data
}

/**
 * Actualiza el estado de una transacción
 * Esta función es para uso interno, normalmente llamada desde la API
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: PaymentTransaction['status'],
  providerData?: {
    transactionId?: string;
    status?: string;
    response?: any;
  }
): Promise<PaymentTransaction | null> {
  const supabase = await getSupabaseClient()

  // Actualizar la transacción
  const { data, error } = await supabase
    .from('payment_transactions')
    .update({
      status,
      provider_transaction_id: providerData?.transactionId,
      provider_status: providerData?.status,
      provider_response: providerData?.response
    })
    .eq('id', transactionId)
    .select()
    .single()

  if (error) {
    console.error('Error al actualizar estado de transacción:', error)
    return null
  }

  // Actualizar el estado de pago en el pedido
  await supabase
    .from('orders')
    .update({
      payment_status: status
    })
    .eq('payment_transaction_id', transactionId)

  return data
}
