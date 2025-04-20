import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../shared/types/database.types'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigValid } from './supabase-config'

// Verificar que la configuración sea válida
const configCheck = isConfigValid()
if (!configCheck.valid) {
  console.error(`Faltan variables de entorno de Supabase: ${configCheck.missingVars.join(', ')}`)
}

// Opciones de autenticación
const authOptions = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: 'pkce' as const,
  debug: true // Habilitar logs detallados
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
