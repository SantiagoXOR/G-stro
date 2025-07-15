import { initMercadoPago, processPayment } from '@/lib/services/mercadopago'

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  }
}))

// Mock fetch
global.fetch = jest.fn()

describe('MercadoPago Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initMercadoPago', () => {
    it('returns null when window is undefined', async () => {
      // Simular entorno de servidor
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      
      const result = await initMercadoPago()
      
      expect(result).toBeNull()
      
      // Restaurar window
      global.window = originalWindow
    })

    it('initializes MercadoPago SDK when in browser environment', async () => {
      // Mock de importación dinámica
      const mockInitMercadoPago = jest.fn()
      jest.mock('@mercadopago/sdk-react', () => ({
        initMercadoPago: mockInitMercadoPago
      }), { virtual: true })
      
      // Ejecutar la función
      const result = await initMercadoPago()
      
      // Verificar resultado
      expect(result).not.toBeNull()
    })
  })

  describe('processPayment', () => {
    it('calls the payment API with correct parameters', async () => {
      // Mock de fetch
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          status: 'approved',
          redirectUrl: '/orders/confirmation'
        })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      
      // Datos de prueba
      const transactionId = 'test-transaction-id'
      const paymentData = {
        method: 'mercadopago',
        token: 'test-token',
        installments: 1,
        email: 'test@example.com'
      }
      
      // Ejecutar la función
      const result = await processPayment(transactionId, paymentData)
      
      // Verificar que se llamó a fetch con los parámetros correctos
      expect(global.fetch).toHaveBeenCalledWith('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId,
          paymentData
        })
      })
      
      // Verificar resultado
      expect(result).toEqual({
        success: true,
        status: 'approved',
        redirectUrl: '/orders/confirmation'
      })
    })

    it('handles API errors correctly', async () => {
      // Mock de fetch con error
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          message: 'Error al procesar el pago'
        })
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      
      // Datos de prueba
      const transactionId = 'test-transaction-id'
      const paymentData = {
        method: 'mercadopago',
        token: 'test-token'
      }
      
      // Ejecutar la función
      const result = await processPayment(transactionId, paymentData)
      
      // Verificar resultado
      expect(result).toEqual({
        success: false,
        error: 'Error al procesar el pago'
      })
    })

    it('handles network errors correctly', async () => {
      // Mock console.error para evitar ruido en los tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock de fetch con excepción
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      // Datos de prueba
      const transactionId = 'test-transaction-id'
      const paymentData = {
        method: 'mercadopago',
        token: 'test-token'
      }

      // Ejecutar la función
      const result = await processPayment(transactionId, paymentData)

      // Verificar resultado
      expect(result).toEqual({
        success: false,
        error: 'Error de conexión al procesar el pago'
      })

      // Verificar que se registró el error
      expect(consoleSpy).toHaveBeenCalledWith('Error al procesar pago:', expect.any(Error))

      // Restaurar console.error
      consoleSpy.mockRestore()
    })
  })
})
