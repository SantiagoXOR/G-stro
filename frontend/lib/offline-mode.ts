/**
 * Utilidad para manejar el modo offline de la aplicación
 */

// Estado global para el modo offline
let isOfflineMode = false;

// Función para verificar si estamos en modo offline
export const isInOfflineMode = (): boolean => {
  return isOfflineMode || !navigator.onLine;
};

// Función para activar el modo offline
export const enableOfflineMode = (): void => {
  isOfflineMode = true;
  // Guardar en localStorage para persistir entre recargas
  localStorage.setItem('offlineMode', 'true');
  // Disparar un evento para que los componentes puedan reaccionar
  window.dispatchEvent(new CustomEvent('offlinemodechange', { detail: { isOffline: true } }));
};

// Función para desactivar el modo offline
export const disableOfflineMode = (): void => {
  isOfflineMode = false;
  // Eliminar de localStorage
  localStorage.removeItem('offlineMode');
  // Disparar un evento para que los componentes puedan reaccionar
  window.dispatchEvent(new CustomEvent('offlinemodechange', { detail: { isOffline: false } }));
};

// Función para alternar el modo offline
export const toggleOfflineMode = (): boolean => {
  if (isOfflineMode) {
    disableOfflineMode();
    return false;
  } else {
    enableOfflineMode();
    return true;
  }
};

// Inicializar el modo offline desde localStorage
export const initOfflineMode = (): void => {
  if (typeof window !== 'undefined') {
    const savedMode = localStorage.getItem('offlineMode');
    isOfflineMode = savedMode === 'true';
  }
};

// Datos de ejemplo para usar en modo offline
export const offlineData = {
  // Datos de ejemplo para productos
  products: [
    {
      id: 'offline-1',
      name: 'Milanesa Napolitana',
      description: 'Milanesa de carne con salsa de tomate, jamón y queso',
      price: 1200,
      category: { id: 'cat-1', name: 'Platos Principales' }
    },
    {
      id: 'offline-2',
      name: 'Empanadas (docena)',
      description: 'Docena de empanadas de carne cortada a cuchillo',
      price: 800,
      category: { id: 'cat-2', name: 'Entradas' }
    },
    {
      id: 'offline-3',
      name: 'Fernet con Coca',
      description: 'Clásico fernet con coca-cola',
      price: 600,
      category: { id: 'cat-3', name: 'Bebidas' }
    }
  ],
  
  // Datos de ejemplo para categorías
  categories: [
    { id: 'cat-1', name: 'Platos Principales' },
    { id: 'cat-2', name: 'Entradas' },
    { id: 'cat-3', name: 'Bebidas' },
    { id: 'cat-4', name: 'Postres' }
  ],
  
  // Datos de ejemplo para órdenes
  orders: [
    {
      id: 'order-1',
      customer_id: 'user-1',
      status: 'completed',
      total_amount: 2000,
      created_at: new Date().toISOString(),
      order_items: [
        {
          id: 'item-1',
          product: {
            id: 'offline-1',
            name: 'Milanesa Napolitana',
            price: 1200
          },
          quantity: 1,
          unit_price: 1200
        },
        {
          id: 'item-2',
          product: {
            id: 'offline-3',
            name: 'Fernet con Coca',
            price: 600
          },
          quantity: 2,
          unit_price: 600
        }
      ]
    }
  ],
  
  // Datos de ejemplo para usuarios
  users: [
    {
      id: 'user-1',
      email: 'usuario@ejemplo.com',
      name: 'Usuario de Ejemplo',
      role: 'customer'
    }
  ]
};
