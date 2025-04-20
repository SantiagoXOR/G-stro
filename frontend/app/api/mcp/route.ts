import { NextRequest, NextResponse } from 'next/server'
import { processAIRequest } from '@/lib/ai-assistant'

export async function POST(request: NextRequest) {
  try {
    // Obtener el cuerpo de la solicitud
    const body = await request.json()
    const { messages, context } = body

    // Procesar la solicitud con nuestro controlador de IA
    const response = await processAIRequest(messages, context || {})

    // Devolver la respuesta
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error processing MCP request:', error)
    return NextResponse.json(
      { error: 'Error processing MCP request', response: 'Lo siento, ha ocurrido un error al procesar tu solicitud.' },
      { status: 500 }
    )
  }
}

// Endpoint para verificar el estado del servidor MCP
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'MCP server is running',
    version: '1.0.0',
    tools: ['searchProducts', 'getUserOrders', 'getAvailableTables']
  })
}
