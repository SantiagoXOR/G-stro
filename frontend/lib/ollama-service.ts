/**
 * Servicio para interactuar con Ollama (modelo Gemma local)
 */

// Tipo para los mensajes
export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Tipo para el contexto
export type Context = {
  userId?: string;
  [key: string]: any;
};

/**
 * Genera una respuesta utilizando el modelo Gemma local a través de Ollama
 */
export async function generateResponse(messages: Message[], context: Context): Promise<string> {
  try {
    // Verificar si estamos en el servidor o en el cliente
    const isServer = typeof window === 'undefined';

    // Si estamos en el servidor, usamos la respuesta de respaldo
    if (isServer) {
      console.log('Ejecutando en el servidor, usando respuesta de respaldo');
      return generateFallbackResponse(messages, context);
    }

    // Preparar el historial de chat
    const history = prepareHistory(messages, context);

    // Realizar la solicitud a la API de Ollama
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma:2b',
        messages: history,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.95,
          top_k: 40,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta de Ollama: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error('Error al generar respuesta con Ollama:', error);
    return generateFallbackResponse(messages, context);
  }
}

/**
 * Prepara el historial de chat para Ollama
 */
function prepareHistory(messages: Message[], context: Context): { role: string; content: string }[] {
  // Crear un mensaje de sistema con el contexto
  const systemMessage = createSystemMessage(context);

  // Convertir los mensajes al formato que espera Ollama
  return [
    { role: 'system', content: systemMessage },
    ...messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  ];
}

/**
 * Crea un mensaje de sistema con el contexto
 */
function createSystemMessage(context: Context): string {
  return `
Eres el asistente virtual de Slainte Bar, un bar/restaurante argentino. Tu objetivo es ayudar a los clientes a encontrar información sobre el menú, realizar pedidos y hacer reservas.

Información del usuario:
${context.userId ? `- ID de usuario: ${context.userId}` : '- Usuario no autenticado'}

Instrucciones:
1. Sé amable, profesional y servicial en todo momento.
2. Proporciona información precisa sobre los productos del menú.
3. Ayuda a los clientes a realizar pedidos y reservas.
4. Si no tienes la información solicitada, indícalo claramente y ofrece alternativas.
5. Mantén un tono conversacional y natural.
6. Responde en español.

Funcionalidades disponibles:
- Buscar productos en el menú
- Ver información detallada de productos
- Realizar pedidos
- Hacer reservas de mesas
- Ver el estado de pedidos anteriores

Responde de manera concisa y directa a las consultas del usuario.

${context.products ? `Productos disponibles: ${JSON.stringify(context.products.slice(0, 5))}` : ''}
${context.orders ? `Pedidos del usuario: ${JSON.stringify(context.orders.slice(0, 3))}` : ''}
${context.tables ? `Mesas disponibles: ${JSON.stringify(context.tables.slice(0, 5))}` : ''}
`;
}

/**
 * Genera una respuesta de respaldo cuando Ollama falla
 */
function generateFallbackResponse(messages: Message[], context: Context): string {
  // Obtener la última consulta del usuario
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');

  if (!lastUserMessage) {
    return "No se encontró ninguna consulta del usuario.";
  }

  // Analizar la consulta para determinar qué tipo de respuesta dar
  const query = lastUserMessage.content.toLowerCase();

  if (query.includes('menú') || query.includes('productos') || query.includes('platos') || query.includes('comida')) {
    return "Tenemos una variedad de platos deliciosos en nuestro menú, incluyendo milanesas, asados, empanadas y más. ¿Hay alguna categoría en particular que te interese?";
  }

  if (query.includes('bebida') || query.includes('tomar')) {
    return "Ofrecemos una amplia selección de bebidas, incluyendo vinos, cervezas, cócteles y opciones sin alcohol. ¿Qué tipo de bebida prefieres?";
  }

  if (query.includes('reserva') || query.includes('mesa')) {
    return "Puedes hacer una reserva para cualquier día de la semana. Tenemos mesas disponibles para grupos de diferentes tamaños. ¿Para cuántas personas necesitas la reserva?";
  }

  if (query.includes('horario') || query.includes('abierto')) {
    return "Nuestro horario de atención es de martes a domingo de 12:00 a 15:00 y de 20:00 a 00:00. Los lunes permanecemos cerrados.";
  }

  if (query.includes('ubicación') || query.includes('dirección') || query.includes('dónde')) {
    return "Estamos ubicados en Av. Corrientes 1234, Buenos Aires. Puedes llegar fácilmente en transporte público o en auto.";
  }

  if (query.includes('pedido') || query.includes('ordenar')) {
    if (!context.userId) {
      return "Para realizar un pedido, necesitas iniciar sesión primero.";
    }
    return "Puedes realizar un pedido seleccionando los productos que deseas y añadiéndolos a tu carrito. ¿Qué te gustaría ordenar?";
  }

  // Respuesta genérica si no se identifica ninguna consulta específica
  return "Soy el asistente virtual de Slainte Bar. Puedo ayudarte con información sobre nuestro menú, hacer reservas o responder preguntas sobre nuestro restaurante. ¿En qué puedo ayudarte hoy?";
}

/**
 * Genera una respuesta para realizar acciones específicas
 */
export async function generateActionResponse(
  action: string,
  parameters: any,
  context: Context
): Promise<string> {
  try {
    // Verificar si estamos en el servidor o en el cliente
    const isServer = typeof window === 'undefined';

    // Si estamos en el servidor, usamos la respuesta predefinida
    if (isServer) {
      console.log('Ejecutando en el servidor, usando respuesta predefinida para acción');
      // Respuestas predefinidas para acciones específicas
      switch (action) {
        case 'createOrder':
          return `¡Pedido creado con éxito! \n\nDetalles del pedido:\n${parameters.items.map((item: any) => `- ${item.quantity}x ${item.name} ($${item.price})`).join('\n')}\n\nTotal: $${parameters.total}\n\nTu número de pedido es: ${parameters.orderId}\nTiempo estimado de preparación: 20-30 minutos\n\n¡Gracias por tu pedido! ¿Puedo ayudarte con algo más?`;

        case 'createReservation':
          return `¡Reserva confirmada! \n\nDetalles de la reserva:\nFecha: ${parameters.date}\nHora: ${parameters.startTime} - ${parameters.endTime}\nMesa: #${parameters.tableNumber}\nPersonas: ${parameters.partySize}\n\nTu número de reserva es: ${parameters.reservationId}\n\nRecuerda que puedes cancelar hasta 2 horas antes sin cargo.\n\n¡Gracias por tu reserva! Te esperamos.`;

        default:
          return "No se pudo generar una respuesta para la acción especificada.";
      }
    }

    // Crear un prompt específico para la acción
    let prompt = '';

    switch (action) {
      case 'createOrder':
        prompt = `
Actúa como el asistente virtual de Slainte Bar y genera una respuesta para confirmar la creación de un pedido con los siguientes detalles:

Productos:
${parameters.items.map((item: any) => `- ${item.quantity}x ${item.name} ($${item.price})`).join('\n')}

Total: $${parameters.total}

La respuesta debe:
1. Confirmar que el pedido ha sido creado exitosamente
2. Mencionar el número de pedido (${parameters.orderId})
3. Indicar el tiempo estimado de preparación (20-30 minutos)
4. Agradecer al cliente por su pedido
5. Ofrecer ayuda adicional

Responde de manera amigable y profesional.
`;
        break;

      case 'createReservation':
        prompt = `
Actúa como el asistente virtual de Slainte Bar y genera una respuesta para confirmar la creación de una reserva con los siguientes detalles:

Fecha: ${parameters.date}
Hora: ${parameters.startTime} - ${parameters.endTime}
Mesa: #${parameters.tableNumber}
Personas: ${parameters.partySize}
${parameters.notes ? `Notas: ${parameters.notes}` : ''}

La respuesta debe:
1. Confirmar que la reserva ha sido creada exitosamente
2. Mencionar el número de reserva (${parameters.reservationId})
3. Recordar al cliente la fecha y hora de la reserva
4. Mencionar la política de cancelación (hasta 2 horas antes)
5. Agradecer al cliente por su reserva
6. Ofrecer ayuda adicional

Responde de manera amigable y profesional.
`;
        break;

      default:
        return "No se pudo generar una respuesta para la acción especificada.";
    }

    // Realizar la solicitud a la API de Ollama
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma:2b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta de Ollama: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error al generar respuesta de acción con Ollama:', error);

    // Respuestas predefinidas para acciones específicas
    switch (action) {
      case 'createOrder':
        return `¡Pedido creado con éxito! \n\nDetalles del pedido:\n${parameters.items.map((item: any) => `- ${item.quantity}x ${item.name} ($${item.price})`).join('\n')}\n\nTotal: $${parameters.total}\n\nTu número de pedido es: ${parameters.orderId}\nTiempo estimado de preparación: 20-30 minutos\n\n¡Gracias por tu pedido! ¿Puedo ayudarte con algo más?`;

      case 'createReservation':
        return `¡Reserva confirmada! \n\nDetalles de la reserva:\nFecha: ${parameters.date}\nHora: ${parameters.startTime} - ${parameters.endTime}\nMesa: #${parameters.tableNumber}\nPersonas: ${parameters.partySize}\n\nTu número de reserva es: ${parameters.reservationId}\n\nRecuerda que puedes cancelar hasta 2 horas antes sin cargo.\n\n¡Gracias por tu reserva! Te esperamos.`;

      default:
        return "No se pudo generar una respuesta para la acción especificada.";
    }
  }
}
