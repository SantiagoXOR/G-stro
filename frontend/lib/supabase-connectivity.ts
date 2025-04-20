/**
 * Utilidad para verificar la conectividad con Supabase
 */

// Obtener la URL de Supabase desde la configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://myjqdrrqfdugzmuejypz.supabase.co';

// Importar el cliente de Supabase para usar sus métodos directamente
import { supabase } from './supabase';

/**
 * Verifica la conectividad básica con el servidor de Supabase
 * @returns Un objeto con el resultado de la verificación
 */
export async function checkSupabaseConnectivity(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    console.log('Verificando conectividad con Supabase usando el cliente:', supabaseUrl);

    // Usar el cliente de Supabase para hacer una operación simple
    // Esto es más confiable que hacer un fetch directo
    const startTime = Date.now();
    const { error } = await supabase.from('health_check').select('count').maybeSingle();
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Si hay un error, puede ser porque la tabla no existe, pero al menos sabemos que hay conectividad
    if (error && error.code !== 'PGRST116') { // PGRST116 es el código para "tabla no existe"
      console.error('Error al verificar conectividad con Supabase:', error);
      return {
        success: false,
        message: `Error al conectar con Supabase: ${error.message}`,
        details: error,
      };
    }

    return {
      success: true,
      message: `Conexión exitosa con Supabase (${responseTime}ms)`,
      details: { responseTime },
    };
  } catch (error) {
    console.error('Error al verificar conectividad con Supabase:', error);

    // Determinar el tipo de error para dar información más útil
    let errorMessage = 'Error desconocido';

    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Error de red: No se pudo establecer conexión con el servidor de Supabase';
    } else if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }

    return {
      success: false,
      message: errorMessage,
      details: error,
    };
  }
}

/**
 * Verifica si hay problemas de CORS con Supabase usando el cliente de Supabase
 */
export async function checkCorsIssues(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    console.log('Verificando problemas de CORS con Supabase usando el cliente');

    // Usar el cliente de Supabase para hacer una operación simple
    // Si esto funciona, entonces no hay problemas de CORS
    const { error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error al verificar CORS con Supabase:', error);
      return {
        success: false,
        message: `Posible problema de CORS: ${error.message}`,
        details: error,
      };
    }

    return {
      success: true,
      message: 'No se detectaron problemas de CORS',
      details: { method: 'auth.getSession' },
    };
  } catch (error) {
    console.error('Error al verificar CORS:', error);
    return {
      success: false,
      message: 'No se pudo verificar CORS debido a un error de red',
      details: error,
    };
  }
}

/**
 * Verifica si el proyecto de Supabase existe y está accesible
 */
export async function verifySupabaseProject(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Verificar si podemos obtener la URL del proyecto
    const { data, error } = await supabase.rpc('get_project_info');

    if (error) {
      // Si la función RPC no existe, intentar otra verificación
      const { error: authError } = await supabase.auth.getSession();

      if (authError) {
        return {
          success: false,
          message: `Error al verificar el proyecto de Supabase: ${authError.message}`,
          details: authError,
        };
      }

      // Si llegamos aquí, al menos la API de autenticación funciona
      return {
        success: true,
        message: 'Proyecto de Supabase accesible (verificado con auth API)',
        details: { method: 'auth.getSession' },
      };
    }

    return {
      success: true,
      message: 'Proyecto de Supabase verificado correctamente',
      details: data,
    };
  } catch (error) {
    console.error('Error al verificar el proyecto de Supabase:', error);
    return {
      success: false,
      message: 'No se pudo verificar el proyecto de Supabase',
      details: error,
    };
  }
}
