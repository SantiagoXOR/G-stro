#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configuración de Clerk para Desarrollo Local - Gëstro\n');

// Función para leer archivo de forma segura
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Función para escribir archivo de forma segura
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.log('❌ Error al escribir archivo:', error.message);
    return false;
  }
}

// Función para ejecutar comandos y capturar salida
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { 
      success: false, 
      output: error.message,
      stderr: error.stderr ? error.stderr.toString() : ''
    };
  }
}

console.log('=== 1. CONFIGURACIÓN DE VARIABLES DE ENTORNO ===');

// Leer y actualizar .env
const envPath = path.join(process.cwd(), '.env');
const envContent = readFile(envPath);

if (!envContent) {
  console.log('❌ No se puede leer el archivo .env');
  process.exit(1);
}

// Agregar variable de desarrollo si no existe
let updatedEnvContent = envContent;

if (!envContent.includes('NEXT_PUBLIC_CLERK_DEVELOPMENT')) {
  console.log('🔧 Agregando variable de desarrollo...');
  updatedEnvContent += '\n# Clerk Development Mode\nNEXT_PUBLIC_CLERK_DEVELOPMENT=true\n';
}

// Agregar URLs de desarrollo si no existen
const developmentUrls = [
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/'
];

developmentUrls.forEach(url => {
  const [key] = url.split('=');
  if (!envContent.includes(key)) {
    console.log(`🔧 Agregando ${key}...`);
    updatedEnvContent += `${url}\n`;
  }
});

// Escribir archivo actualizado
if (updatedEnvContent !== envContent) {
  if (writeFile(envPath, updatedEnvContent)) {
    console.log('✅ Variables de entorno actualizadas');
  }
} else {
  console.log('✅ Variables de entorno ya configuradas');
}

console.log('\n=== 2. CONFIGURACIÓN DE CLERK PROVIDER ===');

// Verificar y actualizar ClerkProvider
const clerkProviderPath = path.join(process.cwd(), 'frontend', 'components', 'clerk-provider.tsx');
const clerkProviderContent = readFile(clerkProviderPath);

if (clerkProviderContent) {
  // Verificar si ya tiene developmentMode configurado
  if (!clerkProviderContent.includes('developmentMode')) {
    console.log('🔧 Actualizando ClerkProvider para modo desarrollo...');
    
    const updatedContent = clerkProviderContent.replace(
      'const isDevelopment = process.env.NEXT_PUBLIC_CLERK_DEVELOPMENT === \'true\'',
      'const isDevelopment = process.env.NODE_ENV === \'development\' || process.env.NEXT_PUBLIC_CLERK_DEVELOPMENT === \'true\''
    );
    
    if (writeFile(clerkProviderPath, updatedContent)) {
      console.log('✅ ClerkProvider actualizado');
    }
  } else {
    console.log('✅ ClerkProvider ya configurado');
  }
} else {
  console.log('❌ No se puede leer ClerkProvider');
}

console.log('\n=== 3. CREACIÓN DE PÁGINA DE PRUEBA ===');

// Crear página de prueba de autenticación
const testPagePath = path.join(process.cwd(), 'frontend', 'app', 'auth', 'test', 'page.tsx');
const testPageDir = path.dirname(testPagePath);

// Crear directorio si no existe
if (!fs.existsSync(testPageDir)) {
  fs.mkdirSync(testPageDir, { recursive: true });
}

const testPageContent = `'use client'

import { useAuth, useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AuthTestPage() {
  const { isLoaded, isSignedIn, signOut } = useAuth()
  const { user } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Prueba de Autenticación con Clerk
            <Badge variant={isSignedIn ? "default" : "destructive"}>
              {isSignedIn ? "Autenticado" : "No autenticado"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSignedIn ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800">✅ Autenticación Exitosa</h3>
                <div className="mt-2 space-y-1 text-sm text-green-700">
                  <p><strong>ID:</strong> {user?.id}</p>
                  <p><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
                  <p><strong>Nombre:</strong> {user?.firstName} {user?.lastName}</p>
                  <p><strong>Creado:</strong> {user?.createdAt?.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => signOut()} variant="outline">
                  Cerrar Sesión
                </Button>
                <Link href="/admin">
                  <Button>Ir al Panel Admin</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800">⚠️ No Autenticado</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Necesitas iniciar sesión para acceder a las funciones protegidas.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Link href="/auth/sign-in">
                  <Button>Iniciar Sesión</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button variant="outline">Registrarse</Button>
                </Link>
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Información de Debug:</h4>
            <div className="text-sm space-y-1 font-mono bg-gray-50 p-2 rounded">
              <p>isLoaded: {isLoaded.toString()}</p>
              <p>isSignedIn: {isSignedIn.toString()}</p>
              <p>Environment: {process.env.NODE_ENV}</p>
              <p>Clerk Development: {process.env.NEXT_PUBLIC_CLERK_DEVELOPMENT || 'false'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}`;

if (writeFile(testPagePath, testPageContent)) {
  console.log('✅ Página de prueba creada en /auth/test');
} else {
  console.log('❌ Error al crear página de prueba');
}

console.log('\n=== 4. VERIFICACIÓN DE CONFIGURACIÓN ===');

// Verificar que todo esté configurado correctamente
const finalEnvContent = readFile(envPath);
const hasDevMode = finalEnvContent && finalEnvContent.includes('NEXT_PUBLIC_CLERK_DEVELOPMENT=true');
const hasUrls = finalEnvContent && finalEnvContent.includes('NEXT_PUBLIC_CLERK_SIGN_IN_URL');

console.log(`✅ Modo desarrollo: ${hasDevMode ? 'Configurado' : 'No configurado'}`);
console.log(`✅ URLs de redirección: ${hasUrls ? 'Configuradas' : 'No configuradas'}`);

console.log('\n=== INSTRUCCIONES FINALES ===');
console.log('1. 🔄 Reinicia la aplicación: npm run dev');
console.log('2. 🌐 Accede a: http://localhost:3001/auth/test');
console.log('3. 🔍 Prueba la autenticación con Clerk UI');
console.log('4. 📧 Si no tienes usuario, regístrate en: http://localhost:3001/auth/sign-up');
console.log('5. 🔧 Para acceso admin, usa: santiagomartinez@upc.edu.ar');

console.log('\n=== SOLUCIÓN DE PROBLEMAS ===');
console.log('- Si ves errores de CORS, verifica que localhost:3001 esté en Clerk Dashboard');
console.log('- Si la autenticación no funciona, revisa la consola del navegador');
console.log('- Para modo offline, usa el tab "Formulario Básico" con password "offline"');

console.log('\n✅ Configuración completada. ¡Prueba la autenticación!');
