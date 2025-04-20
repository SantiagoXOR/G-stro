// Script para probar la conexión con Supabase

const supabaseUrl = 'https://myjqdrrqfdugzmuejypz.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15anFkcnJxZmR1Z3ptdWVqeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzQ2NTMsImV4cCI6MjA0ODQxMDY1M30.xYKMe1AkPD3wxCMPR1yybGphQDvalQ62K92VVZtNerI';

async function testConnection() {
  try {
    console.log('Probando conexión con Supabase...');
    console.log('URL:', supabaseUrl);
    
    // Probar conexión básica
    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${anonKey}`);
    
    console.log('Respuesta de Supabase:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      console.log('Conexión exitosa con Supabase');
    } else {
      console.error('Error al conectar con Supabase:', response.statusText);
    }
    
    // Intentar obtener el cuerpo de la respuesta
    try {
      const data = await response.text();
      console.log('Datos:', data);
    } catch (e) {
      console.error('Error al procesar el cuerpo de la respuesta:', e);
    }
  } catch (error) {
    console.error('Error al verificar conexión con Supabase:', error);
  }
}

// Ejecutar la prueba
testConnection();
