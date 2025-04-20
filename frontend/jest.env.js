// Cargar variables de entorno para pruebas
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno desde .env.test
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

// Establecer variables de entorno de prueba
process.env.NODE_ENV = 'test';

// Variables de MercadoPago para pruebas
if (!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
  process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY = 'TEST-12345678-1234-1234-1234-123456789012';
}

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  process.env.MERCADOPAGO_ACCESS_TOKEN = 'TEST-12345678-1234-1234-1234-123456789012';
}

// Variables de Supabase para pruebas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://myjqdrrqfdugzmuejypz.supabase.co';
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15anFkcnJxZmR1Z3ptdWVqeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzQ2NTMsImV4cCI6MjA0ODQxMDY1M30.xYKMe1AkPD3wxCMPR1yybGphQDvalQ62K92VVZtNerI';
}
