import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../shared/types/database.types'

// Implementación simplificada de MCP sin dependencias externas
type MCPTool<T = any, R = any> = (params: T) => Promise<R>

type MCPServer = {
  tools: Record<string, MCPTool>
  handleRequest: (request: any) => Promise<any>
}

function createMCPServer(config: { tools: Record<string, MCPTool> }): MCPServer {
  return {
    tools: config.tools,
    handleRequest: async (request: any) => {
      try {
        const { tool, params } = request
        if (!tool || !config.tools[tool]) {
          return { error: 'Tool not found' }
        }

        const result = await config.tools[tool](params)
        return { result }
      } catch (error) {
        console.error('Error handling MCP request:', error)
        return { error: 'Error processing request' }
      }
    }
  }
}

// Obtener variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Crear cliente de Supabase con la clave de servicio para acceso completo
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Crear servidor MCP
export const mcpServer = createMCPServer({
  // Definir herramientas que el modelo puede usar
  tools: {
    // Herramienta para buscar productos
    searchProducts: async ({ query, category }: { query?: string; category?: string }) => {
      let productsQuery = supabase.from('products').select('*, category:categories(*)')

      if (query) {
        productsQuery = productsQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      }

      if (category) {
        productsQuery = productsQuery.eq('category_id', category)
      }

      const { data, error } = await productsQuery.order('name')

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        data,
        message: `Found ${data.length} products matching your criteria.`
      }
    },

    // Herramienta para obtener información de un producto específico
    getProductDetails: async ({ productId }: { productId: string }) => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', productId)
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        data,
        message: `Retrieved details for product: ${data.name}`
      }
    },

    // Herramienta para obtener categorías
    getCategories: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        data,
        message: `Retrieved ${data.length} categories.`
      }
    },

    // Herramienta para obtener pedidos de un usuario
    getUserOrders: async ({ userId }: { userId: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items:order_items(*, product:products(*))')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        data,
        message: `Retrieved ${data.length} orders for the user.`
      }
    },

    // Herramienta para crear un pedido
    createOrder: async ({
      userId,
      items,
      notes
    }: {
      userId: string;
      items: Array<{ productId: string; quantity: number; notes?: string }>;
      notes?: string
    }) => {
      // Verificar que el usuario existe
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (userError || !userData) {
        return { success: false, error: 'Usuario no encontrado' }
      }

      // Verificar que los productos existen y obtener sus precios
      const productIds = items.map(item => item.productId)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, price, name')
        .in('id', productIds)

      if (productsError || !productsData || productsData.length !== productIds.length) {
        return { success: false, error: 'Uno o más productos no encontrados' }
      }

      // Crear el pedido
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: userId,
          status: 'pending',
          notes: notes || null,
          total_amount: 0 // Se actualizará automáticamente con el trigger
        })
        .select()
        .single()

      if (orderError || !orderData) {
        return { success: false, error: 'Error al crear el pedido' }
      }

      // Crear los items del pedido
      const orderItems = items.map(item => {
        const product = productsData.find(p => p.id === item.productId)
        return {
          order_id: orderData.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: product?.price || 0,
          notes: item.notes || null
        }
      })

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        // Si hay un error al crear los items, eliminar el pedido
        await supabase.from('orders').delete().eq('id', orderData.id)
        return { success: false, error: 'Error al crear los items del pedido' }
      }

      // Obtener el pedido actualizado con el total
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .select('*, order_items:order_items(*, product:products(name))')
        .eq('id', orderData.id)
        .single()

      if (updateError) {
        return { success: false, error: 'Error al obtener el pedido actualizado' }
      }

      return {
        success: true,
        data: updatedOrder,
        message: `Pedido creado exitosamente con ID: ${orderData.id}`
      }
    },

    // Herramienta para obtener mesas disponibles
    getAvailableTables: async ({ date, startTime, endTime }: { date: string; startTime: string; endTime: string }) => {
      // Primero obtenemos todas las mesas disponibles
      const { data: allTables, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .eq('status', 'available')
        .order('table_number')

      if (tablesError) {
        return { success: false, error: tablesError.message }
      }

      // Luego obtenemos las reservas para esa fecha y hora
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('table_id')
        .eq('reservation_date', date)
        .in('status', ['pending', 'confirmed'])
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`)

      if (reservationsError) {
        return { success: false, error: reservationsError.message }
      }

      // Filtramos las mesas que ya están reservadas
      const reservedTableIds = reservations?.map(r => r.table_id) || []
      const availableTables = allTables?.filter(table => !reservedTableIds.includes(table.id)) || []

      return {
        success: true,
        data: availableTables,
        message: `Found ${availableTables.length} available tables for the requested time.`
      }
    },

    // Herramienta para crear una reserva
    createReservation: async ({
      userId,
      tableId,
      date,
      startTime,
      endTime,
      partySize,
      notes
    }: {
      userId: string;
      tableId: string;
      date: string;
      startTime: string;
      endTime: string;
      partySize: number;
      notes?: string
    }) => {
      // Verificar que la mesa está disponible - simplificado para evitar referencias circulares
      const { data: allTables, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .eq('status', 'available')
        .eq('id', tableId)

      if (tablesError || !allTables || allTables.length === 0) {
        return { success: false, error: 'La mesa no está disponible o no existe' }
      }

      // Crear la reserva
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          customer_id: userId,
          table_id: tableId,
          reservation_date: date,
          start_time: startTime,
          end_time: endTime,
          party_size: partySize,
          status: 'confirmed',
          notes: notes || null
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        data,
        message: `Reserva creada exitosamente para el ${date} de ${startTime} a ${endTime}.`
      }
    }
  }
})
