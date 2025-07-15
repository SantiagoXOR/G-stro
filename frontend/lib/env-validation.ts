/**
 * Validación de variables de entorno en tiempo de ejecución
 * Este archivo maneja la validación de variables de entorno de forma segura
 * para evitar errores durante el build cuando las variables no están disponibles
 */

// Función para obtener variables de entorno de forma segura
function getEnvVar(name: string): string | undefined {
  if (typeof window !== 'undefined') {
    // En el cliente, solo podemos acceder a variables públicas
    return (window as any).__ENV__?.[name] || process.env[name]
  }
  // En el servidor
  return process.env[name]
}

// Validación de Supabase
export function validateSupabaseEnv() {
  const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  const missing = []
  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  return {
    valid: missing.length === 0,
    missing,
    url,
    anonKey
  }
}

// Validación de Clerk
export function validateClerkEnv() {
  const publishableKey = getEnvVar('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
  const secretKey = getEnvVar('CLERK_SECRET_KEY')
  
  const missing = []
  if (!publishableKey) missing.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
  if (!secretKey && typeof window === 'undefined') missing.push('CLERK_SECRET_KEY')
  
  return {
    valid: missing.length === 0,
    missing,
    publishableKey,
    secretKey
  }
}

// Validación de MercadoPago
export function validateMercadoPagoEnv() {
  const publicKey = getEnvVar('NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY')
  const accessToken = getEnvVar('MERCADOPAGO_ACCESS_TOKEN')
  
  const missing = []
  if (!publicKey) missing.push('NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY')
  if (!accessToken && typeof window === 'undefined') missing.push('MERCADOPAGO_ACCESS_TOKEN')
  
  return {
    valid: missing.length === 0,
    missing,
    publicKey,
    accessToken
  }
}

// Función principal de validación
export function validateAllEnv() {
  const supabase = validateSupabaseEnv()
  const clerk = validateClerkEnv()
  const mercadopago = validateMercadoPagoEnv()
  
  const allMissing = [
    ...supabase.missing,
    ...clerk.missing,
    ...mercadopago.missing
  ]
  
  return {
    valid: allMissing.length === 0,
    missing: allMissing,
    supabase,
    clerk,
    mercadopago
  }
}

// Función para obtener configuración de Supabase de forma segura
export function getSupabaseConfig() {
  const validation = validateSupabaseEnv()
  
  if (!validation.valid) {
    console.warn('Variables de entorno de Supabase faltantes:', validation.missing)
    return {
      url: 'https://placeholder.supabase.co',
      anonKey: 'placeholder-key'
    }
  }
  
  return {
    url: validation.url!,
    anonKey: validation.anonKey!
  }
}

// Función para obtener configuración de Clerk de forma segura
export function getClerkConfig() {
  const validation = validateClerkEnv()
  
  if (!validation.valid) {
    console.warn('Variables de entorno de Clerk faltantes:', validation.missing)
    return {
      publishableKey: 'placeholder-key',
      secretKey: 'placeholder-secret'
    }
  }
  
  return {
    publishableKey: validation.publishableKey!,
    secretKey: validation.secretKey
  }
}

// Función para obtener configuración de MercadoPago de forma segura
export function getMercadoPagoConfig() {
  const validation = validateMercadoPagoEnv()
  
  if (!validation.valid) {
    console.warn('Variables de entorno de MercadoPago faltantes:', validation.missing)
    return {
      publicKey: 'placeholder-public-key',
      accessToken: 'placeholder-access-token'
    }
  }
  
  return {
    publicKey: validation.publicKey!,
    accessToken: validation.accessToken
  }
}

// Función para verificar si estamos en modo desarrollo
export function isDevelopment() {
  return process.env.NODE_ENV === 'development'
}

// Función para verificar si estamos en modo producción
export function isProduction() {
  return process.env.NODE_ENV === 'production'
}

// Función para obtener la URL base de la aplicación
export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  return 'http://localhost:3000'
}
