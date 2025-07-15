#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo importaciones de AuthProvider a Clerk - Gëstro\n');

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
    console.log('❌ Error al escribir archivo:', filePath, error.message);
    return false;
  }
}

// Función para buscar archivos recursivamente
function findFiles(dir, extension) {
  const files = [];
  
  function searchDir(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Ignorar node_modules y .next
          if (item !== 'node_modules' && item !== '.next' && item !== '.git') {
            searchDir(fullPath);
          }
        } else if (item.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignorar errores de permisos
    }
  }
  
  searchDir(dir);
  return files;
}

// Función para corregir un archivo
function fixFile(filePath) {
  const content = readFile(filePath);
  if (!content) return false;
  
  let modified = false;
  let newContent = content;
  
  // Reemplazar importación de auth-provider por clerk
  if (content.includes('import { useAuth } from "@/components/auth-provider"')) {
    newContent = newContent.replace(
      'import { useAuth } from "@/components/auth-provider"',
      'import { useUser } from "@clerk/nextjs"'
    );
    modified = true;
    console.log(`✅ Corregida importación en: ${filePath}`);
  }
  
  // Reemplazar uso de useAuth por useUser
  if (content.includes('const { user } = useAuth()')) {
    newContent = newContent.replace(
      /const { user } = useAuth\(\)/g,
      'const { user } = useUser()'
    );
    modified = true;
    console.log(`✅ Corregido useAuth en: ${filePath}`);
  }
  
  // Reemplazar otras variantes de useAuth
  if (content.includes('const { signIn, signOut') || content.includes('const { signUp')) {
    // Para archivos que usan funciones de autenticación, necesitamos un enfoque diferente
    console.log(`⚠️  Archivo requiere corrección manual: ${filePath}`);
    console.log('   - Usa funciones de autenticación que requieren migración específica');
    return false;
  }
  
  if (modified) {
    return writeFile(filePath, newContent);
  }
  
  return false;
}

// Buscar archivos TypeScript y TSX en el directorio frontend
const frontendDir = path.join(process.cwd(), 'frontend');
const tsFiles = findFiles(frontendDir, '.ts');
const tsxFiles = findFiles(frontendDir, '.tsx');
const allFiles = [...tsFiles, ...tsxFiles];

console.log(`📁 Encontrados ${allFiles.length} archivos TypeScript/TSX`);

let fixedCount = 0;
let manualCount = 0;

// Procesar cada archivo
for (const file of allFiles) {
  const content = readFile(file);
  if (content && content.includes('auth-provider')) {
    if (fixFile(file)) {
      fixedCount++;
    } else {
      manualCount++;
    }
  }
}

console.log('\n=== RESUMEN ===');
console.log(`✅ Archivos corregidos automáticamente: ${fixedCount}`);
console.log(`⚠️  Archivos que requieren corrección manual: ${manualCount}`);

if (manualCount > 0) {
  console.log('\n=== ARCHIVOS QUE REQUIEREN CORRECCIÓN MANUAL ===');
  console.log('Los siguientes archivos usan funciones de autenticación complejas:');
  
  for (const file of allFiles) {
    const content = readFile(file);
    if (content && content.includes('auth-provider') && 
        (content.includes('signIn') || content.includes('signOut') || content.includes('signUp'))) {
      console.log(`- ${file}`);
    }
  }
  
  console.log('\n🔧 Para estos archivos:');
  console.log('1. Reemplazar useAuth por useAuth de @clerk/nextjs');
  console.log('2. Usar signOut() directamente de useAuth de Clerk');
  console.log('3. Para signIn/signUp, usar redirectToSignIn/redirectToSignUp');
}

console.log('\n✅ Corrección de importaciones completada');
console.log('🔄 Reinicia la aplicación para aplicar los cambios');
