#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico de Autenticación con Clerk - Gëstro\n');

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

// Función para verificar si un archivo existe
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Función para leer archivo de forma segura
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

console.log('=== 1. VERIFICACIÓN DE VARIABLES DE ENTORNO ===');

// Verificar archivo .env
const envPath = path.join(process.cwd(), '.env');
if (fileExists(envPath)) {
  console.log('✅ Archivo .env encontrado');
  
  const envContent = readFile(envPath);
  if (envContent) {
    // Verificar variables de Clerk
    const clerkVars = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
      'CLERK_WEBHOOK_SECRET'
    ];
    
    clerkVars.forEach(varName => {
      if (envContent.includes(varName)) {
        const match = envContent.match(new RegExp(`${varName}=(.+)`));
        if (match && match[1] && match[1].trim() !== '') {
          const value = match[1].trim();
          if (value.includes('PENDIENTE') || value.includes('tu-clave') || value.includes('placeholder')) {
            console.log(`⚠️  ${varName}: Configurado pero con valor placeholder`);
          } else {
            console.log(`✅ ${varName}: Configurado`);
          }
        } else {
          console.log(`❌ ${varName}: Vacío`);
        }
      } else {
        console.log(`❌ ${varName}: No encontrado`);
      }
    });
  }
} else {
  console.log('❌ Archivo .env no encontrado');
}

console.log('\n=== 2. VERIFICACIÓN DE DEPENDENCIAS ===');

// Verificar package.json
const packageJsonPath = path.join(process.cwd(), 'frontend', 'package.json');
if (fileExists(packageJsonPath)) {
  console.log('✅ package.json encontrado');
  
  const packageContent = readFile(packageJsonPath);
  if (packageContent) {
    try {
      const packageData = JSON.parse(packageContent);
      const clerkDeps = [
        '@clerk/nextjs',
        '@clerk/themes'
      ];
      
      clerkDeps.forEach(dep => {
        if (packageData.dependencies && packageData.dependencies[dep]) {
          console.log(`✅ ${dep}: ${packageData.dependencies[dep]}`);
        } else {
          console.log(`❌ ${dep}: No instalado`);
        }
      });
    } catch (error) {
      console.log('❌ Error al parsear package.json');
    }
  }
} else {
  console.log('❌ package.json no encontrado');
}

console.log('\n=== 3. VERIFICACIÓN DE ARCHIVOS DE CONFIGURACIÓN ===');

// Verificar archivos importantes
const importantFiles = [
  'frontend/middleware.ts',
  'frontend/components/clerk-provider.tsx',
  'frontend/app/auth/sign-in/page.tsx',
  'frontend/components/auth-provider.tsx'
];

importantFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fileExists(fullPath)) {
    console.log(`✅ ${filePath}: Existe`);
  } else {
    console.log(`❌ ${filePath}: No encontrado`);
  }
});

console.log('\n=== 4. VERIFICACIÓN DE CONECTIVIDAD CON CLERK ===');

// Intentar hacer una petición a Clerk API
const clerkApiTest = async () => {
  try {
    const envContent = readFile(envPath);
    if (!envContent) {
      console.log('❌ No se puede leer el archivo .env');
      return;
    }
    
    const publishableKeyMatch = envContent.match(/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=(.+)/);
    if (!publishableKeyMatch || !publishableKeyMatch[1]) {
      console.log('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY no encontrado');
      return;
    }
    
    const publishableKey = publishableKeyMatch[1].trim();
    if (publishableKey.includes('PENDIENTE') || publishableKey.includes('placeholder')) {
      console.log('⚠️  Clave de Clerk es un placeholder, no se puede probar conectividad');
      return;
    }
    
    console.log('🔄 Probando conectividad con Clerk...');
    
    // Usar curl para probar la API de Clerk
    const curlCommand = `curl -s -o /dev/null -w "%{http_code}" "https://api.clerk.dev/v1/sessions" -H "Authorization: Bearer ${publishableKey}"`;
    const result = runCommand(curlCommand);
    
    if (result.success) {
      const statusCode = result.output;
      if (statusCode === '200' || statusCode === '401') {
        console.log('✅ Conectividad con Clerk API: OK');
      } else {
        console.log(`⚠️  Conectividad con Clerk API: Código ${statusCode}`);
      }
    } else {
      console.log('❌ Error al probar conectividad con Clerk');
    }
  } catch (error) {
    console.log('❌ Error en prueba de conectividad:', error.message);
  }
};

console.log('\n=== 5. VERIFICACIÓN DE PROCESO DE DESARROLLO ===');

// Verificar si Next.js está ejecutándose
const checkNextProcess = () => {
  try {
    const result = runCommand('netstat -ano | findstr :3000');
    if (result.success && result.output.includes('3000')) {
      console.log('✅ Proceso en puerto 3000: Detectado');
    } else {
      const result3001 = runCommand('netstat -ano | findstr :3001');
      if (result3001.success && result3001.output.includes('3001')) {
        console.log('✅ Proceso en puerto 3001: Detectado');
      } else {
        console.log('❌ No se detecta proceso de Next.js en puertos 3000/3001');
      }
    }
  } catch (error) {
    console.log('⚠️  No se pudo verificar procesos en ejecución');
  }
};

checkNextProcess();

console.log('\n=== 6. RECOMENDACIONES ===');

// Generar recomendaciones basadas en los hallazgos
const envContent = readFile(envPath);
if (envContent) {
  const hasPlaceholders = envContent.includes('PENDIENTE') || 
                         envContent.includes('tu-clave') || 
                         envContent.includes('placeholder');
  
  if (hasPlaceholders) {
    console.log('🔧 ACCIÓN REQUERIDA: Configurar credenciales reales de Clerk');
    console.log('   - Ejecutar: npm run clerk:setup');
    console.log('   - O configurar manualmente las variables en .env');
  }
  
  const hasClerkKeys = envContent.includes('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY') &&
                      envContent.includes('CLERK_SECRET_KEY');
  
  if (hasClerkKeys) {
    console.log('✅ Variables de Clerk configuradas');
    console.log('🔧 SIGUIENTE PASO: Probar autenticación en http://localhost:3001/auth/sign-in');
  }
}

console.log('\n=== DIAGNÓSTICO COMPLETADO ===');
console.log('Para más información, revisa los logs de la aplicación en la consola del navegador.');

// Ejecutar prueba de conectividad de forma asíncrona
clerkApiTest();
