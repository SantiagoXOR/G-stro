/**
 * Utility functions for real-time notifications
 */

export interface Order {
  id: string;
  table_number: number;
  status: string;
}

type NotificationType = 'new' | 'ready';

export interface Notification {
  type: 'new_order' | 'order_ready';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
}

/**
 * Generate notification for order events
 */
export function generateOrderNotification(order: Order, type: NotificationType): Notification {
  if (type === 'new') {
    return {
      type: 'new_order',
      title: 'Nuevo pedido recibido',
      message: `Mesa ${order.table_number} - Pedido ${order.id}`,
      priority: 'high'
    };
  } else {
    return {
      type: 'order_ready',
      title: 'Pedido listo para entregar',
      message: `Mesa ${order.table_number} - Pedido ${order.id}`,
      priority: 'normal'
    };
  }
}
