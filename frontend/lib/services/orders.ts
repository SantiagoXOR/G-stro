import { getSupabaseClient, type Database } from "@/lib/supabase-client"
import { isInOfflineMode, offlineData } from "@/lib/offline-mode"

// Helper function para obtener el cliente de Supabase de forma segura
async function getSupabase() {
  const client = await getSupabaseClient()
  if (!client) {
    throw new Error('Cliente de Supabase no disponible')
  }
  return client
}

export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
export type OrderWithCustomer = Order & { customer_name?: string }

/**
 * Obtiene todos los pedidos del usuario actual
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  // Temporalmente usar solo datos de ejemplo
  console.log('Devolviendo datos de ejemplo para pedidos del usuario:', userId)
  return offlineData.orders as unknown as Order[]
}

/**
 * Obtiene todos los pedidos (para administradores)
 */
export async function getAllOrders(): Promise<Order[]> {
  // Temporalmente usar solo datos de ejemplo
  console.log('Devolviendo datos de ejemplo para todos los pedidos')
  return offlineData.orders as unknown as Order[]
}

/**
 * Obtiene pedidos con información adicional del cliente
 */
export async function getOrdersWithCustomerInfo(): Promise<OrderWithCustomer[]> {
  // Temporalmente usar solo datos de ejemplo
  const orders = offlineData.orders as unknown as Order[]
  return orders.map(order => ({
    ...order,
    customer_name: "Cliente de ejemplo"
  }))
}

/**
 * Obtiene pedidos filtrados por estado
 */
export async function getOrdersByStatus(status: Order["status"]): Promise<Order[]> {
  // Temporalmente usar solo datos de ejemplo filtrados
  const orders = offlineData.orders as unknown as Order[]
  return orders.filter(order => order.status === status)
}

/**
 * Obtiene un pedido por su ID con sus elementos
 */
export async function getOrderWithItems(orderId: string): Promise<{ order: Order; items: OrderItem[] } | null> {
  // Temporalmente usar solo datos de ejemplo
  const orders = offlineData.orders as unknown as Order[]
  const order = orders.find(o => o.id === orderId)

  if (!order) {
    return null
  }

  // Simular elementos del pedido
  const items: OrderItem[] = []

  return { order, items }
}

/**
 * Crea un nuevo pedido
 */
export async function createOrder(
  order: Omit<Order, "id" | "created_at" | "updated_at" | "total_amount">,
  items: Omit<OrderItem, "id" | "created_at" | "updated_at" | "order_id">[]
): Promise<Order | null> {
  // Simular creación de pedido
  console.log('Simulando creación de pedido')
  const newOrder: Order = {
    ...order,
    id: `mock-order-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_amount: 0
  } as Order

  return newOrder
}

/**
 * Actualiza el estado de un pedido
 */
export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<Order | null> {
  // Simular actualización de estado
  console.log('Simulando actualización de estado del pedido')
  const orders = offlineData.orders as unknown as Order[]
  const order = orders.find(o => o.id === orderId)

  if (!order) {
    return null
  }

  return {
    ...order,
    status,
    updated_at: new Date().toISOString()
  }
}

/**
 * Cancela un pedido (solo si está pendiente)
 */
export async function cancelOrder(orderId: string): Promise<Order | null> {
  // Simular cancelación de pedido
  console.log('Simulando cancelación de pedido')
  return updateOrderStatus(orderId, "cancelled")
}
