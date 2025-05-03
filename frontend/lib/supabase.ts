import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../shared/types/database.types'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigValid } from './supabase-config'

// Verificar que la configuración sea válida
const configCheck = isConfigValid()
if (!configCheck.valid) {
  console.error(`Faltan variables de entorno de Supabase: ${configCheck.missingVars.join(', ')}`)
}

// Función para generar un code_verifier seguro
export const generateCodeVerifier = () => {
  const array = new Uint8Array(64) // Aumentamos a 64 bytes para mayor seguridad
  window.crypto.getRandomValues(array)
  return Array.from(array, (byte) => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('')
}

// Función para guardar el code_verifier en múltiples ubicaciones para mayor seguridad
export const saveCodeVerifier = (codeVerifier: string) => {
  if (typeof window === 'undefined') return

  // Guardar en múltiples ubicaciones para asegurar que esté disponible
  localStorage.setItem('supabase.auth.code_verifier', codeVerifier)
  localStorage.setItem('supabase-auth-code-verifier-backup', codeVerifier)
  localStorage.setItem('sb-code-verifier', codeVerifier)
  localStorage.setItem(`sb-${SUPABASE_URL.split('//')[1].split('.')[0]}-auth-code-verifier`, codeVerifier)

  // También guardar en sessionStorage como respaldo
  sessionStorage.setItem('supabase.auth.code_verifier', codeVerifier)

  console.log('Code verifier guardado en múltiples ubicaciones')
}

// Función para guardar el flow state
export const saveFlowState = (state: string) => {
  if (typeof window === 'undefined') return

  // Guardar el estado del flujo en múltiples ubicaciones
  localStorage.setItem('supabase.auth.flow-state', state)
  localStorage.setItem(`sb-${SUPABASE_URL.split('//')[1].split('.')[0]}-auth-flow-state`, state)
  sessionStorage.setItem('supabase.auth.flow-state', state)

  console.log('Flow state guardado:', state)
}

/**
 * Inicia el flujo de autenticación OAuth con el proveedor especificado.
 *
 * @param provider - El proveedor de autenticación (google, facebook, github, etc.)
 * @param options - Opciones adicionales para el flujo de autenticación
 * @returns Un objeto con el resultado del inicio del flujo
 */
export const startOAuthFlow = async (
  provider: 'google' | 'facebook' | 'github' = 'google',
  options?: {
    redirectTo?: string;
    scopes?: string;
    skipBrowserRedirect?: boolean;
  }
) => {
  try {
    // Generar y guardar un nuevo code_verifier
    const newCodeVerifier = generateCodeVerifier()
    saveCodeVerifier(newCodeVerifier)

    // Configurar la URL de redirección (usar la proporcionada o la predeterminada)
    const redirectTo = options?.redirectTo || `${window.location.origin}/auth/callback`

    // Registrar información de depuración
    console.log('Iniciando flujo OAuth:', {
      provider,
      redirectTo,
      codeVerifier: newCodeVerifier.substring(0, 10) + '...'
    })

    // Iniciar el flujo de autenticación
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        // Solicitar explícitamente un refresh token y forzar el consentimiento
        // para asegurar que siempre recibamos un refresh token
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          // Añadir scopes adicionales si se proporcionan
          ...(options?.scopes ? { scope: options.scopes } : {}),
        },
        skipBrowserRedirect: options?.skipBrowserRedirect ?? false,
      },
    })

    // Si hay un error, lanzar una excepción
    if (error) {
      console.error('Error en signInWithOAuth:', error)
      throw error
    }

    // Si hay un estado del flujo, guardarlo
    if (data?.url) {
      const url = new URL(data.url)
      const state = url.searchParams.get('state')
      if (state) {
        saveFlowState(state)
        console.log('Estado del flujo guardado:', state.substring(0, 10) + '...')
      }

      // También guardar la URL completa para depuración
      localStorage.setItem('supabase.auth.last-oauth-url', data.url)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error al iniciar flujo OAuth:', error)
    return { success: false, error }
  }
}

// Opciones de autenticación
const authOptions = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true, // Importante para detectar el código en la URL
  flowType: 'pkce' as const, // Usar flujo PKCE para mayor seguridad
  debug: true, // Habilitar logs detallados para depuración
  storage: {
    getItem: (key: string) => {
      if (typeof window === 'undefined') return null

      // Obtener el valor del localStorage
      let value = localStorage.getItem(key)
      console.log(`Storage getItem: ${key} = ${value ? 'presente' : 'ausente'}`)

      // Si es el code_verifier y no se encuentra, intentar con otras ubicaciones
      if (key === 'supabase.auth.code_verifier' && !value) {
        // Intentar con sessionStorage primero
        value = sessionStorage.getItem(key)
        if (value) {
          console.log('Encontrado code_verifier en sessionStorage')
          return value
        }

        // Intentar con otras claves posibles en localStorage
        const possibleKeys = [
          'supabase-auth-code-verifier-backup',
          'sb-code-verifier',
          'sb-olxxrwdxsubpiujsxzxa-auth-token',
          'sb:olxxrwdxsubpiujsxzxa:auth:code_verifier',
          'supabase-auth-code-verifier'
        ]

        for (const altKey of possibleKeys) {
          const altValue = localStorage.getItem(altKey)
          if (altValue) {
            console.log(`Encontrado code_verifier en clave alternativa: ${altKey}`)
            // Guardar en la clave original para futuros usos
            localStorage.setItem(key, altValue)
            return altValue
          }
        }
      }

      return value
    },
    setItem: (key: string, value: string) => {
      if (typeof window === 'undefined') return
      console.log(`Storage setItem: ${key}`)
      localStorage.setItem(key, value)

      // Guardar una copia de seguridad del code_verifier
      if (key === 'supabase.auth.code_verifier') {
        console.log('Guardando copia de seguridad del code_verifier')
        localStorage.setItem('supabase-auth-code-verifier-backup', value)
      }
    },
    removeItem: (key: string) => {
      if (typeof window === 'undefined') return
      console.log(`Storage removeItem: ${key}`)
      localStorage.removeItem(key)
    }
  }
}

// Función para verificar la conectividad a internet
const checkInternetConnection = async (): Promise<boolean> => {
  try {
    // Intentar hacer una solicitud a un servicio confiable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout

    await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors', // Importante para evitar problemas de CORS
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.error('Error al verificar la conexión a internet:', error);
    return false;
  }
};

// Create Supabase client for browser
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: authOptions,
  global: {
    fetch: async (url, options) => {
      console.log('Supabase Request:', { url })

      // Verificar conexión a internet antes de intentar la solicitud a Supabase
      const isOnline = await checkInternetConnection();
      if (!isOnline) {
        console.error('No hay conexión a internet');
        throw new Error('No hay conexión a internet. Verifica tu conexión y vuelve a intentarlo.');
      }

      try {
        const response = await fetch(url, options);

        try {
          // Solo clonar y leer el cuerpo si la respuesta es JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const responseClone = response.clone();
            const data = await responseClone.json();
            console.log('Supabase Response:', {
              url,
              status: response.status,
              statusText: response.statusText,
              data
            });
          } else {
            console.log('Supabase Response:', {
              url,
              status: response.status,
              statusText: response.statusText,
              body: 'No JSON body'
            });
          }
        } catch (e) {
          console.error('Error al procesar respuesta:', e);
        }

        return response;
      } catch (error) {
        console.error('Error de red en solicitud a Supabase:', { url, error });

        // Proporcionar un mensaje de error más descriptivo
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('No se pudo conectar con el servidor de Supabase. Verifica tu conexión a internet y que el servidor esté disponible.');
        }

        throw error;
      }
    }
  }
})
