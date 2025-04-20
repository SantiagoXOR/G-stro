// Importamos solo los tipos necesarios para mantener la compatibilidad
// pero no usamos la API real para evitar errores
import type { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

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
 * Genera una respuesta utilizando respuestas predefinidas
 */
export async function generateResponse(messages: Message[], context: Context): Promise<string> {
  try {
    // Obtener la última consulta del usuario
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');

    if (!lastUserMessage) {
      return "No se encontró ninguna consulta del usuario.";
    }

    // Analizar la consulta para determinar qué tipo de respuesta dar
    const query = lastUserMessage.content.toLowerCase();

    // Generar una respuesta basada en la consulta
    return generatePredefinedResponse(query, context);
  } catch (error) {
    console.error('Error al generar respuesta:', error);
    return "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.";
  }
}

/**
 * Genera una respuesta predefinida basada en la consulta
 */
function generatePredefinedResponse(query: string, context: Context): string {
  // Analizar la consulta para determinar qué tipo de respuesta dar
  if (query.includes('menú') || query.includes('productos') || query.includes('platos') || query.includes('comida')) {
    return "Tenemos una variedad de platos deliciosos en nuestro menú, incluyendo milanesas, asados, empanadas y más. ¿Hay alguna categoría en particular que te interese?"
  }

  if (query.includes('bebida') || query.includes('tomar')) {
    return "Ofrecemos una amplia selección de bebidas, incluyendo vinos, cervezas, cócteles y opciones sin alcohol. ¿Qué tipo de bebida prefieres?"
  }

  if (query.includes('reserva') || query.includes('mesa')) {
    return "Puedes hacer una reserva para cualquier día de la semana. Tenemos mesas disponibles para grupos de diferentes tamaños. ¿Para cuántas personas necesitas la reserva?"
  }

  if (query.includes('horario') || query.includes('abierto')) {
    return "Nuestro horario de atención es de martes a domingo de 12:00 a 15:00 y de 20:00 a 00:00. Los lunes permanecemos cerrados."
  }

  if (query.includes('ubicación') || query.includes('dirección') || query.includes('dónde')) {
    return "Estamos ubicados en Av. Corrientes 1234, Buenos Aires. Puedes llegar fácilmente en transporte público o en auto."
  }

  if (query.includes('pedido') || query.includes('ordenar')) {
    if (!context.userId) {
      return "Para realizar un pedido, necesitas iniciar sesión primero."
    }
    return "Puedes realizar un pedido seleccionando los productos que deseas y añadiéndolos a tu carrito. ¿Qué te gustaría ordenar?"
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
    // Respuestas predefinidas para acciones específicas
    switch (action) {
      case 'createOrder':
        return `¡Pedido creado con éxito!

Detalles del pedido:
${parameters.items.map((item: any) => `- ${item.quantity}x ${item.name} ($${item.price})`).join('\n')}

Total: $${parameters.total}

Tu número de pedido es: ${parameters.orderId}
Tiempo estimado de preparación: 20-30 minutos

¡Gracias por tu pedido! ¿Puedo ayudarte con algo más?`;

      case 'createReservation':
        return `¡Reserva confirmada!

Detalles de la reserva:
Fecha: ${parameters.date}
Hora: ${parameters.startTime} - ${parameters.endTime}
Mesa: #${parameters.tableNumber}
Personas: ${parameters.partySize}

Tu número de reserva es: ${parameters.reservationId}

Recuerda que puedes cancelar hasta 2 horas antes sin cargo.

¡Gracias por tu reserva! Te esperamos.`;

      default:
        return "No se pudo generar una respuesta para la acción especificada.";
    }
  } catch (error) {
    console.error('Error al generar respuesta de acción:', error);
    return "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.";
  }
}
