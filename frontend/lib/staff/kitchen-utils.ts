/**
 * Utility functions for kitchen dashboard functionality
 */

/**
 * Process orders and group them by status
 */
export function processKitchenOrders(orders: any[]) {
  return {
    pending: orders.filter(o => o.status === 'pending'),
    preparing: orders.filter(o => o.status === 'preparing'),
    ready: orders.filter(o => o.status === 'ready')
  }
}

/**
 * Calculate order priority based on waiting time
 */
export function getOrderPriority(order: any): 'low' | 'normal' | 'high' {
  const createdAt = new Date(order.created_at)
  const now = new Date()
  const minutesAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60)

  if (minutesAgo > 30) return 'high'
  if (minutesAgo > 15) return 'normal'
  return 'low'
}

/**
 * Format elapsed time since order creation
 */
export function getTimeElapsed(createdAt: string): string {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 60) return `${diffMinutes} min`

  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  return `${hours}h ${minutes}m`
}
