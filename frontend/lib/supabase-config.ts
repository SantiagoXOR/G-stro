// Configuración de Supabase
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://myjqdrrqfdugzmuejypz.supabase.co'
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Configuración de MercadoPago
export const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || ''
export const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || ''

// Configuración de la aplicación
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Verificar configuración
export function isConfigValid() {
  const missingVars = []
  
  if (!SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  return {
    valid: missingVars.length === 0,
    missingVars
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
