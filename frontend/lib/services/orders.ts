import { supabase } from "@/lib/supabase"
import type { Database } from "../../../shared/types/database.types"
import { isInOfflineMode, offlineData } from "@/lib/offline-mode"

export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
export type OrderWithCustomer = Order & { customer_name?: string }

/**
 * Obtiene todos los pedidos del usuario actual
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  // Verificar si estamos en modo offline
  if (isInOfflineMode()) {
    console.log('Modo offline: devolviendo datos de ejemplo para pedidos')
    return offlineData.orders as unknown as Order[]
  }

  try {
    console.log('Obteniendo pedidos para el usuario:', userId)

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener pedidos del usuario:", error)
      throw error
    }

    console.log('Pedidos obtenidos:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error("Error inesperado al obtener pedidos:", error)
    // En caso de error, podemos devolver datos de ejemplo para no romper la UI
    return []
  }
}

/**
 * Obtiene todos los pedidos (para administradores)
 */
export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error al obtener todos los pedidos:", error)
    throw error
  }

  return data || []
}

/**
 * Obtiene pedidos con información adicional del cliente
 */
export async function getOrdersWithCustomerInfo(): Promise<OrderWithCustomer[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, customer:profiles(full_name)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error al obtener pedidos con info de cliente:", error)
    throw error
  }

  // Transformar los datos para incluir el nombre del cliente
  const ordersWithCustomer = data?.map(order => {
    const customerInfo = order.customer as any
    return {
      ...order,
      customer_name: customerInfo?.full_name || "Cliente anónimo"
    }
  }) || []

  return ordersWithCustomer
}

/**
 * Obtiene pedidos filtrados por estado
 */
export async function getOrdersByStatus(status: Order["status"]): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error al obtener pedidos con estado ${status}:`, error)
    throw error
  }

  return data || []
}

/**
 * Obtiene un pedido por su ID con sus elementos
 */
export async function getOrderWithItems(orderId: string): Promise<{ order: Order; items: OrderItem[] } | null> {
  // Obtener el pedido
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single()

  if (orderError) {
    console.error("Error al obtener pedido:", orderError)
    return null
  }

  // Obtener los elementos del pedido
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*, product:products(*)")
    .eq("order_id", orderId)

  if (itemsError) {
    console.error("Error al obtener elementos del pedido:", itemsError)
    return null
  }

  return { order, items: items || [] }
}

/**
 * Crea un nuevo pedido
 */
export async function createOrder(
  order: Omit<Order, "id" | "created_at" | "updated_at" | "total_amount">,
  items: Omit<OrderItem, "id" | "created_at" | "updated_at" | "order_id">[]
): Promise<Order | null> {
  // Iniciar una transacción
  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single()

  if (orderError) {
    console.error("Error al crear pedido:", orderError)
    return null
  }

  // Agregar el ID del pedido a cada elemento
  const itemsWithOrderId = items.map(item => ({
    ...item,
    order_id: newOrder.id
  }))

  // Insertar los elementos del pedido
  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsWithOrderId)

  if (itemsError) {
    console.error("Error al crear elementos del pedido:", itemsError)
    // Idealmente, deberíamos eliminar el pedido si falla la inserción de elementos
    // pero Supabase no soporta transacciones completas en el cliente
    return null
  }

  return newOrder
}

/**
 * Actualiza el estado de un pedido
 */
export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single()

  if (error) {
    console.error("Error al actualizar estado del pedido:", error)
    return null
  }

  return data
}

/**
 * Cancela un pedido (solo si está pendiente)
 */
export async function cancelOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("status", "pending") // Solo se pueden cancelar pedidos pendientes
    .select()
    .single()

  if (error) {
    console.error("Error al cancelar pedido:", error)
    return null
  }

  return data
}
