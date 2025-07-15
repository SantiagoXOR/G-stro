#!/usr/bin/env node

/**
 * Script para configurar prevención permanente de errores de Fast Refresh
 * Implementa todas las mejores prácticas y herramientas de monitoreo
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando prevención de errores de Fast Refresh...\n');

// 1. Verificar que todos los archivos de monitoreo estén en su lugar
const requiredFiles = [
  'lib/fast-refresh-monitor.ts',
  'components/dev/fast-refresh-status.tsx',
  '.eslintrc.fast-refresh.js',
  'scripts/detect-fast-refresh-errors.js',
  'scripts/fix-fast-refresh-errors.js'
];

console.log('📋 Verificando archivos de monitoreo...');
let allFilesPresent = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - FALTA`);
    allFilesPresent = false;
  }
});

if (!allFilesPresent) {
  console.log('\n❌ Algunos archivos requeridos están faltando');
  console.log('   Ejecuta primero el script de corrección de errores');
  process.exit(1);
}

// 2. Configurar scripts en package.json
console.log('\n🔧 Configurando scripts de package.json...');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Agregar scripts de Fast Refresh
  packageJson.scripts = packageJson.scripts || {};
  
  const newScripts = {
    'dev:monitor': 'npm run dev & node scripts/detect-fast-refresh-errors.js',
    'check:fast-refresh': 'node scripts/detect-fast-refresh-errors.js',
    'fix:fast-refresh': 'node scripts/fix-fast-refresh-errors.js',
    'lint:fast-refresh': 'eslint --config .eslintrc.fast-refresh.js "**/*.{ts,tsx}"'
  };

  Object.entries(newScripts).forEach(([key, value]) => {
    if (!packageJson.scripts[key]) {
      packageJson.scripts[key] = value;
      console.log(`  ✅ Agregado script: ${key}`);
    } else {
      console.log(`  ℹ️  Script ya existe: ${key}`);
    }
  });

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('  💾 package.json actualizado');
} else {
  console.log('  ❌ package.json no encontrado');
}

// 3. Configurar VSCode settings para mejor desarrollo
console.log('\n⚙️  Configurando VSCode settings...');

const vscodeDir = path.join(__dirname, '..', '.vscode');
const settingsPath = path.join(vscodeDir, 'settings.json');

if (!fs.existsSync(vscodeDir)) {
  fs.mkdirSync(vscodeDir);
}

const vscodeSettings = {
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.options": {
    "configFile": ".eslintrc.fast-refresh.js"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.associations": {
    "*.tsx": "typescriptreact",
    "*.ts": "typescript"
  }
};

if (fs.existsSync(settingsPath)) {
  const existingSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  const mergedSettings = { ...existingSettings, ...vscodeSettings };
  fs.writeFileSync(settingsPath, JSON.stringify(mergedSettings, null, 2));
  console.log('  ✅ VSCode settings actualizados');
} else {
  fs.writeFileSync(settingsPath, JSON.stringify(vscodeSettings, null, 2));
  console.log('  ✅ VSCode settings creados');
}

// 4. Crear archivo de configuración de desarrollo
console.log('\n📝 Creando configuración de desarrollo...');

const devConfigPath = path.join(__dirname, '..', 'dev.config.js');
const devConfig = `/**
 * Configuración de desarrollo para Gëstro
 * Incluye configuraciones específicas para Fast Refresh y debugging
 */

module.exports = {
  // Configuración de Fast Refresh
  fastRefresh: {
    enabled: true,
    monitor: true,
    autoFix: false, // Cambiar a true para auto-corrección
    showStatus: true
  },

  // Configuración de debugging
  debugging: {
    showComponentUpdates: false,
    logStateChanges: false,
    trackRerenders: true
  },

  // Configuración de linting
  linting: {
    strictMode: true,
    autoFix: true,
    showWarnings: true
  },

  // Configuración de hot reload
  hotReload: {
    enabled: true,
    preserveState: true,
    showReloadReason: true
  }
};
`;

fs.writeFileSync(devConfigPath, devConfig);
console.log('  ✅ dev.config.js creado');

// 5. Crear documentación de mejores prácticas
console.log('\n📚 Creando documentación...');

const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir);
}

const bestPracticesPath = path.join(docsDir, 'fast-refresh-best-practices.md');
const bestPracticesContent = `# Mejores Prácticas para Fast Refresh - Gëstro

## 🎯 Objetivo
Mantener un entorno de desarrollo estable con hot reloading eficiente y sin errores de Fast Refresh.

## 📋 Reglas Fundamentales

### 1. Dependencias de Hooks
- ✅ Usar \`user?.id\` en lugar de \`user\` completo
- ✅ Memoizar funciones con \`useCallback\`
- ❌ Evitar dependencias circulares
- ❌ No incluir objetos completos en dependencias

### 2. Estructura de Componentes
- ✅ Usar Error Boundaries para componentes críticos
- ✅ Separar lógica de presentación
- ✅ Memoizar componentes pesados con \`React.memo\`

### 3. Gestión de Estado
- ✅ Usar \`useState\` para estado local simple
- ✅ Usar \`useReducer\` para estado complejo
- ❌ Evitar mutaciones directas de estado

## 🛠️ Herramientas Disponibles

### Scripts de NPM
\`\`\`bash
npm run check:fast-refresh    # Detectar problemas
npm run fix:fast-refresh      # Corregir automáticamente
npm run lint:fast-refresh     # Linting específico
npm run dev:monitor          # Desarrollo con monitoreo
\`\`\`

### Monitoreo en Tiempo Real
- Monitor visual en esquina inferior izquierda (solo desarrollo)
- Detección automática de errores
- Estadísticas en tiempo real

### Linting Personalizado
- Reglas específicas para Fast Refresh
- Detección de patrones problemáticos
- Auto-corrección cuando es posible

## 🚨 Problemas Comunes y Soluciones

### Error: "Fast Refresh had to perform a full reload"
**Causa:** Dependencias mal configuradas en hooks
**Solución:** Revisar arrays de dependencias en \`useEffect\` y \`useCallback\`

### Error: "Cannot update a component while rendering"
**Causa:** Llamadas a setState durante el render
**Solución:** Mover setState a \`useEffect\` o event handlers

### Error: "Maximum update depth exceeded"
**Causa:** Bucle infinito en actualizaciones de estado
**Solución:** Revisar dependencias de \`useEffect\`

## 📈 Monitoreo Continuo

El sistema de monitoreo está activo durante el desarrollo y proporciona:
- Detección automática de errores
- Estadísticas de rendimiento
- Alertas en tiempo real
- Sugerencias de mejora

## 🔄 Flujo de Trabajo Recomendado

1. **Desarrollo:** Usar \`npm run dev:monitor\`
2. **Verificación:** Ejecutar \`npm run check:fast-refresh\`
3. **Corrección:** Aplicar \`npm run fix:fast-refresh\` si es necesario
4. **Validación:** Confirmar con \`npm run lint:fast-refresh\`

## 💡 Tips Adicionales

- Mantener componentes pequeños y enfocados
- Usar TypeScript para mejor detección de errores
- Implementar tests para componentes críticos
- Revisar regularmente el monitor de Fast Refresh
`;

fs.writeFileSync(bestPracticesPath, bestPracticesContent);
console.log('  ✅ Documentación de mejores prácticas creada');

// 6. Resumen final
console.log('\n' + '='.repeat(60));
console.log('✅ CONFIGURACIÓN COMPLETADA EXITOSAMENTE');
console.log('\n🎉 Sistema de prevención de Fast Refresh configurado');
console.log('\n📋 Próximos pasos:');
console.log('  1. Reiniciar el servidor de desarrollo');
console.log('  2. Verificar el monitor en la esquina inferior izquierda');
console.log('  3. Ejecutar: npm run check:fast-refresh');
console.log('  4. Leer: docs/fast-refresh-best-practices.md');

console.log('\n🛠️  Scripts disponibles:');
console.log('  npm run dev:monitor          # Desarrollo con monitoreo');
console.log('  npm run check:fast-refresh   # Detectar problemas');
console.log('  npm run fix:fast-refresh     # Corregir automáticamente');
console.log('  npm run lint:fast-refresh    # Linting específico');

console.log('\n💡 El monitor visual estará activo en desarrollo');
console.log('   Muestra estadísticas en tiempo real y alertas');

console.log('\n🚀 ¡Entorno de desarrollo optimizado para Fast Refresh!');
