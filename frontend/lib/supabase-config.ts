// Archivo de configuración de Supabase vacío para evitar errores
// Este archivo se mantiene para compatibilidad con código existente
// pero no contiene ninguna funcionalidad real
export const SUPABASE_URL = 'https://example.com'
export const SUPABASE_ANON_KEY = 'dummy-key'

// Configuración de MercadoPago
export const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || ''
export const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || ''

// Configuración de la aplicación
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Verificar configuración (siempre devuelve inválido)
export function isConfigValid() {
  return {
    valid: false,
    missingVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
  }
}

// Verificar configuración de MercadoPago
export function isMercadoPagoConfigValid() {
  const missingVars = []

  if (!MERCADOPAGO_PUBLIC_KEY) missingVars.push('NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY')
  if (!MERCADOPAGO_ACCESS_TOKEN) missingVars.push('MERCADOPAGO_ACCESS_TOKEN')

  return {
    valid: missingVars.length === 0,
    missingVars
  }
}
