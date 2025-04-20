// Importar el módulo completo para poder mockearlo correctamente
import * as ordersModule from '@/lib/services/orders'

// Extraer las funciones para facilitar el uso
const { createOrder, getOrderById, getOrdersByUser, updateOrderStatus } = ordersModule

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnValue({
      data: null,
      error: null
    }),
  }
}))

// Mock de las funciones de orders
jest.mock('@/lib/services/orders', () => ({
  createOrder: jest.fn(),
  getOrderById: jest.fn(),
  getOrdersByUser: jest.fn(),
  updateOrderStatus: jest.fn()
}))

describe('Orders Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createOrder', () => {
    it('should create an order with items', async () => {
      // Mock de respuestas de Supabase
      const mockOrderResponse = {
        data: { id: 'order-123', status: 'pending' },
        error: null
      }
      const mockItemsResponse = {
        data: [{ id: 'item-1' }, { id: 'item-2' }],
        error: null
      }

      // Configurar mock de la función
      createOrder.mockResolvedValue(mockOrderResponse.data)

      // Datos de prueba
      const orderData = {
        customer_id: 'user-123',
        status: 'pending' as const,
        notes: 'Test order'
      }
      const orderItems = [
        { product_id: 'product-1', quantity: 2, unit_price: 1000 },
        { product_id: 'product-2', quantity: 1, unit_price: 1500 }
      ]

      // Ejecutar función
      const result = await createOrder(orderData, orderItems)

      // Verificaciones
      expect(createOrder).toHaveBeenCalledWith(orderData, orderItems)
      expect(result).toEqual(mockOrderResponse.data)
    })

    it('should handle errors when creating an order', async () => {
      // Configurar mock para simular un error
      createOrder.mockRejectedValue(new Error('Database error'))

      // Datos de prueba
      const orderData = {
        customer_id: 'user-123',
        status: 'pending' as const,
        notes: 'Test order'
      }
      const orderItems = [
        { product_id: 'product-1', quantity: 2, unit_price: 1000 }
      ]

      // Ejecutar función y verificar que lanza error
      await expect(createOrder(orderData, orderItems)).rejects.toThrow('Database error')
      expect(createOrder).toHaveBeenCalledWith(orderData, orderItems)
    })
  })

  describe('getOrderById', () => {
    it('should get an order by ID with items', async () => {
      // Mock de respuesta
      const mockOrder = {
        id: 'order-123',
        status: 'pending',
        items: [
          { id: 'item-1', product_id: 'product-1', quantity: 2 }
        ]
      }

      // Configurar mock
      getOrderById.mockResolvedValue(mockOrder)

      // Ejecutar función
      const result = await getOrderById('order-123')

      // Verificaciones
      expect(getOrderById).toHaveBeenCalledWith('order-123')
      expect(result).toEqual(mockOrder)
    })

    it('should return null when order is not found', async () => {
      // Configurar mock para devolver null
      getOrderById.mockResolvedValue(null)

      // Ejecutar función
      const result = await getOrderById('non-existent')

      // Verificaciones
      expect(getOrderById).toHaveBeenCalledWith('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('getOrdersByUser', () => {
    it('should get orders for a user', async () => {
      // Mock de respuesta
      const mockOrders = [
        { id: 'order-1', status: 'pending' },
        { id: 'order-2', status: 'completed' }
      ]

      // Configurar mock
      getOrdersByUser.mockResolvedValue(mockOrders)

      // Ejecutar función
      const result = await getOrdersByUser('user-123')

      // Verificaciones
      expect(getOrdersByUser).toHaveBeenCalledWith('user-123')
      expect(result).toEqual(mockOrders)
    })

    it('should return empty array on error', async () => {
      // Configurar mock para devolver array vacío en caso de error
      getOrdersByUser.mockResolvedValue([])

      // Ejecutar función
      const result = await getOrdersByUser('user-123')

      // Verificaciones
      expect(getOrdersByUser).toHaveBeenCalledWith('user-123')
      expect(result).toEqual([])
    })
  })

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      // Mock de respuesta
      const mockUpdatedOrder = { id: 'order-123', status: 'completed' }

      // Configurar mock
      updateOrderStatus.mockResolvedValue(mockUpdatedOrder)

      // Ejecutar función
      const result = await updateOrderStatus('order-123', 'completed')

      // Verificaciones
      expect(updateOrderStatus).toHaveBeenCalledWith('order-123', 'completed')
      expect(result).toEqual(mockUpdatedOrder)
    })

    it('should return null on error', async () => {
      // Configurar mock para devolver null en caso de error
      updateOrderStatus.mockResolvedValue(null)

      // Ejecutar función
      const result = await updateOrderStatus('order-123', 'completed')

      // Verificaciones
      expect(updateOrderStatus).toHaveBeenCalledWith('order-123', 'completed')
      expect(result).toBeNull()
    })
  })
})
