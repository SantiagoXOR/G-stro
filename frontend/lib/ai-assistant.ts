// Importamos directamente las funciones que necesitamos
import { supabase } from './supabase'
import { generateResponse, generateActionResponse, Message, Context } from './ollama-service'

/**
 * Procesa una solicitud al asistente de IA
 */
export async function processAIRequest(messages: Message[], context: Context) {
  try {
    // Extraer la última consulta del usuario
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()

    if (!lastUserMessage) {
      return {
        response: "No se encontró ninguna consulta del usuario."
      }
    }

    // Analizar la consulta para determinar si es una acción especial
    const query = lastUserMessage.content.toLowerCase()

    // Verificar si es una acción especial (crear pedido, hacer reserva, etc.)
    if (query.includes('crear pedido') || query.includes('hacer pedido') || query.includes('ordenar')) {
      return await handleCreateOrder(query, context)
    } else if (query.includes('reservar') || query.includes('hacer reserva')) {
      return await handleCreateReservation(query, context)
    }

    // Si no es una acción especial, usar nuestra función simplificada para generar una respuesta
    const response = await generateResponse(messages, context);

    // Enriquecer el contexto con datos de la base de datos
    await enrichContextWithData(query, context)

    return { response }

  } catch (error) {
    console.error('Error processing AI request:', error)
    return {
      response: "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde."
    }
  }
}

/**
 * Enriquece el contexto con datos de la base de datos
 */
async function enrichContextWithData(query: string, context: Context) {
  try {
    // Buscar productos si la consulta es sobre el menú
    if (query.includes('menú') || query.includes('productos') || query.includes('carta')) {
      // Extraer posibles categorías
      let categoryFilter = ''
      if (query.includes('bebida')) categoryFilter = 'bebidas'
      else if (query.includes('entrada')) categoryFilter = 'entradas'
      else if (query.includes('postre')) categoryFilter = 'postres'
      else if (query.includes('principal')) categoryFilter = 'principales'

      // Buscar productos
      let { data: products } = await supabase.from('products').select('*')

      // Filtramos los resultados manualmente si hay una categoría
      if (categoryFilter && products) {
        products = products.filter(product => product.category_id === categoryFilter)
      }

      // Añadir productos al contexto
      context.products = products || []
    }

    // Buscar pedidos si la consulta es sobre pedidos
    if (context.userId && (query.includes('pedido') || query.includes('orden'))) {
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', context.userId)
        .order('created_at', { ascending: false })

      // Añadir pedidos al contexto
      context.orders = orders || []
    }

    // Buscar mesas disponibles si la consulta es sobre reservas
    if (query.includes('mesa') || query.includes('reserva')) {
      // Simulamos datos de mesas para pruebas
      const tables = [
        { id: '1', table_number: 1, capacity: 4, status: 'available' },
        { id: '2', table_number: 2, capacity: 6, status: 'available' },
        { id: '3', table_number: 3, capacity: 2, status: 'available' },
        { id: '4', table_number: 4, capacity: 8, status: 'available' }
      ]

      // Añadir mesas al contexto
      context.tables = tables
    }
  } catch (error) {
    console.error('Error enriching context with data:', error)
  }
}

/**
 * Maneja la creación de un pedido
 */
async function handleCreateOrder(query: string, context: Context) {
  if (!context.userId) {
    return {
      response: "Para realizar un pedido, necesitas iniciar sesión primero."
    }
  }

  // Simulamos la creación de un pedido
  const orderId = `ORD-${Math.floor(Math.random() * 10000)}`
  const items = [
    { name: 'Milanesa Napolitana', quantity: 1, price: 3800 },
    { name: 'Empanadas (6 unidades)', quantity: 1, price: 2800 }
  ]
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Generar respuesta con Gemini
  const response = await generateActionResponse('createOrder', {
    orderId,
    items,
    total
  }, context)

  return { response }
}



/**
 * Maneja la creación de una reserva
 */
async function handleCreateReservation(query: string, context: Context) {
  if (!context.userId) {
    return {
      response: "Para hacer una reserva, necesitas iniciar sesión primero."
    }
  }

  // Extraer fecha y hora de la consulta (simplificado)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Formateamos la fecha para la respuesta
  const formattedDate = tomorrow.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  // Simulamos la creación de una reserva
  const reservationId = `RES-${Math.floor(Math.random() * 10000)}`
  const tableNumber = 2
  const partySize = 4
  const startTime = '20:00'
  const endTime = '22:00'

  // Generar respuesta con Gemini
  const response = await generateActionResponse('createReservation', {
    reservationId,
    tableNumber,
    partySize,
    date: formattedDate,
    startTime,
    endTime
  }, context)

  return { response }
}

/**
 * Convierte el estado del pedido a texto legible
 */
function getOrderStatusText(status: string): string {
  switch (status) {
    case 'pending': return 'Pendiente'
    case 'preparing': return 'En preparación'
    case 'ready': return 'Listo para entregar'
    case 'delivered': return 'Entregado'
    case 'cancelled': return 'Cancelado'
    default: return status
  }
}
