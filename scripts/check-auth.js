// Script para verificar la autenticación con Supabase

const url = 'https://myjqdrrqfdugzmuejypz.supabase.co/auth/v1/signup';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15anFkcnJxZmR1Z3ptdWVqeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzQ2NTMsImV4cCI6MjA0ODQxMDY1M30.xYKMe1AkPD3wxCMPR1yybGphQDvalQ62K92VVZtNerI';

async function checkAuth() {
  try {
    console.log('Verificando autenticación con Supabase...');
    console.log('URL:', url);
    
    // Crear un correo electrónico único para el test
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'Test123456!';
    
    console.log('Intentando registrar usuario:', testEmail);
    
    // Intentar registrar un usuario
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    
    console.log('Respuesta de Supabase:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries([...response.headers.entries()]));
    
    // Intentar obtener el cuerpo de la respuesta
    try {
      const data = await response.json();
      console.log('Datos:', data);
      
      if (response.ok) {
        console.log('Registro exitoso con Supabase');
      } else {
        console.error('Error al registrar usuario con Supabase:', data.error || data.message);
      }
    } catch (e) {
      console.error('Error al procesar el cuerpo de la respuesta:', e);
    }
  } catch (error) {
    console.error('Error al verificar autenticación con Supabase:', error);
  }
}

// Ejecutar la verificación
checkAuth();
