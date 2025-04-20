// Script para probar la conexión a la base de datos de Supabase

const url = 'https://myjqdrrqfdugzmuejypz.supabase.co/rest/v1/profiles';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15anFkcnJxZmR1Z3ptdWVqeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzQ2NTMsImV4cCI6MjA0ODQxMDY1M30.xYKMe1AkPD3wxCMPR1yybGphQDvalQ62K92VVZtNerI';

async function testDatabase() {
  try {
    console.log('Probando conexión a la base de datos de Supabase...');
    console.log('URL:', url);
    
    // Intentar obtener perfiles
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
    
    // Intentar obtener el cuerpo de la respuesta
    try {
      const data = await response.json();
      console.log('Datos:', JSON.stringify(data, null, 2));
      
      if (response.ok) {
        console.log('Conexión exitosa a la base de datos de Supabase');
      } else {
        console.error('Error al conectar a la base de datos de Supabase:', data.error || data.message);
      }
    } catch (e) {
      console.error('Error al procesar el cuerpo de la respuesta:', e);
    }
  } catch (error) {
    console.error('Error al verificar conexión a la base de datos de Supabase:', error);
  }
}

// Ejecutar la prueba
testDatabase();
