import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig } from 'mercadopago'
import { MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_PUBLIC_KEY, isMercadoPagoConfigValid } from '@/lib/supabase-config'

export async function GET(request: NextRequest) {
  try {
    // Verificar que tenemos las credenciales necesarias
    if (!MERCADOPAGO_ACCESS_TOKEN || !MERCADOPAGO_PUBLIC_KEY) {
      return NextResponse.json({
        success: false,
        message: 'Faltan variables de entorno de MercadoPago',
        config: {
          accessToken: MERCADOPAGO_ACCESS_TOKEN ? 'Configurado' : 'No configurado',
          publicKey: MERCADOPAGO_PUBLIC_KEY ? 'Configurado' : 'No configurado'
        }
      }, { status: 500 })
    }

    // Crear configuración de MercadoPago
    const mercadopago = new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN })

    return NextResponse.json({
      success: true,
      message: 'Configuración de MercadoPago correcta',
      config: {
        accessToken: 'Configurado',
        publicKey: 'Configurado'
      }
    })
  } catch (error) {
    console.error('Error al verificar configuración de MercadoPago:', error)
    return NextResponse.json({
      success: false,
      message: 'Error al verificar configuración de MercadoPago',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
