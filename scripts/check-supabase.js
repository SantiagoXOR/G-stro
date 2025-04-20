// Script para verificar la conectividad con Supabase

// Cargar configuración de Supabase desde el archivo de configuración
const config = require('./supabase-config');
const url = `${config.supabaseUrl}/rest/v1/`;
const anonKey = config.supabaseAnonKey;

async function checkSupabase() {
  try {
    console.log('Verificando conectividad con Supabase...');
    console.log('URL:', url);

    // Intentar una solicitud simple
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json',
      },
    });

    console.log('Respuesta de Supabase:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries([...response.headers.entries()]));

    if (response.ok) {
      console.log('Conexión exitosa con Supabase');
    } else {
      console.error('Error al conectar con Supabase:', response.status, response.statusText);
    }

    // Intentar obtener el cuerpo de la respuesta
    try {
      const data = await response.json();
      console.log('Datos:', data);
    } catch (e) {
      console.error('Error al procesar el cuerpo de la respuesta:', e);
    }
  } catch (error) {
    console.error('Error al verificar conectividad con Supabase:', error);
  }
}

// Ejecutar la verificación
checkSupabase();
