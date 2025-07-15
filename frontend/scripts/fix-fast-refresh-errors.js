#!/usr/bin/env node

/**
 * Script para corregir automáticamente errores de Fast Refresh
 * Aplica correcciones específicas a patrones problemáticos
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo errores de Fast Refresh...\n');

// Correcciones específicas
const fixes = [
  {
    file: 'components/auth-provider.tsx',
    fixes: [
      {
        description: 'Eliminar dependencia circular en checkSessionExpiration',
        search: /const checkSessionExpiration = useCallback\(async \(\) => \{[\s\S]*?\}, \[session\?\.\expires_at\]\)/g,
        replace: `const checkSessionExpiration = useCallback(async () => {
    if (!session?.expires_at) return false;

    const timeUntilExpiry = session.expires_at - Date.now();

    if (timeUntilExpiry <= 0) {
      // Si la sesión ha expirado completamente
      console.log('Sesión expirada, cerrando sesión...')
      await secureTokenService.clearTokens()
      setSession(null)
      setUser(null)
      localStorage.removeItem('auth_session')
      return true; // Indica que la sesión fue invalidada
    } else if (timeUntilExpiry <= 300000) { // 5 minutos antes de expirar
      // Intentar refrescar el token
      console.log('Refrescando tokens...')
      const { error } = await secureTokenService.refreshTokens()
      if (error) {
        console.error('Error al refrescar tokens:', error)
        return false;
      }
      return true; // Token refrescado exitosamente
    }
    return false; // No se necesitó acción
  }, [session?.expires_at])`
      }
    ]
  },
  {
    file: 'hooks/use-push-notifications.ts',
    fixes: [
      {
        description: 'Optimizar dependencias en useEffect',
        search: /useEffect\(\(\) => \{[\s\S]*?\}, \[user\]\)/g,
        replace: `useEffect(() => {
    // Verificar soporte para notificaciones
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)

      // Solo verificar suscripción si hay usuario
      if (user?.id) {
        checkSubscription()
      }
    }
  }, [user?.id, checkSubscription])`
      }
    ]
  },
  {
    file: 'components/pwa-manager.tsx',
    fixes: [
      {
        description: 'Optimizar dependencias en useEffect principal',
        search: /useEffect\(\(\) => \{[\s\S]*?\}, \[isRealtimeAvailable, isSupported\]\)/g,
        replace: `useEffect(() => {
    // Solo inicializar si tenemos soporte y realtime está disponible
    if (!isSupported || !isRealtimeAvailable) {
      console.log('⚠️ PWAManager: Esperando soporte completo...')
      return
    }

    console.log('🚀 PWAManager: Inicializando servicios...')

    const initializeNotifications = async () => {
      try {
        // Verificar que el servicio esté disponible
        if (!pushNotificationService) {
          console.warn('⚠️ pushNotificationService no está disponible')
          return
        }

        // Inicializar el servicio de notificaciones
        await pushNotificationService.initialize()
        console.log('✅ PWAManager: Servicio de notificaciones inicializado')

        // Verificar suscripción existente
        await checkSubscription()
        console.log('✅ PWAManager: Verificación de suscripción completada')

      } catch (error) {
        console.error('❌ Error en inicialización de PWAManager:', error)
      }
    }

    // Ejecutar de forma asíncrona para no bloquear el renderizado
    initializeNotifications().catch(error => {
      console.error('❌ Error crítico en inicialización de notificaciones:', error)
    })

    // Limpieza al desmontar el componente
    return () => {
      try {
        pushNotificationService.cleanup()
        console.log('✅ PWAManager: Limpieza completada')
      } catch (error) {
        console.warn('⚠️ Error durante limpieza de PWAManager:', error)
      }
    }
  }, [isRealtimeAvailable, isSupported, checkSubscription])`
      }
    ]
  }
];

let totalFixes = 0;
let successfulFixes = 0;

fixes.forEach(fileConfig => {
  const filePath = path.join(__dirname, '..', fileConfig.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${fileConfig.file} - Archivo no encontrado`);
    return;
  }

  console.log(`🔧 Procesando ${fileConfig.file}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fileModified = false;

  fileConfig.fixes.forEach(fix => {
    totalFixes++;
    
    if (content.match(fix.search)) {
      content = content.replace(fix.search, fix.replace);
      console.log(`  ✅ ${fix.description}`);
      fileModified = true;
      successfulFixes++;
    } else {
      console.log(`  ⚠️  ${fix.description} - Patrón no encontrado`);
    }
  });

  if (fileModified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  💾 Archivo guardado con correcciones`);
  } else {
    console.log(`  ℹ️  Sin cambios necesarios`);
  }
  
  console.log('');
});

console.log('='.repeat(60));
console.log(`📊 Resumen de correcciones:`);
console.log(`   Total de correcciones intentadas: ${totalFixes}`);
console.log(`   Correcciones aplicadas exitosamente: ${successfulFixes}`);
console.log(`   Correcciones fallidas: ${totalFixes - successfulFixes}`);

if (successfulFixes > 0) {
  console.log('\n✅ CORRECCIONES APLICADAS:');
  console.log('   Los errores de Fast Refresh han sido corregidos');
  console.log('   Reinicia el servidor de desarrollo para ver los cambios');
  console.log('\n📋 Próximos pasos:');
  console.log('   1. Ejecutar: npm run dev');
  console.log('   2. Verificar que no hay errores en la consola');
  console.log('   3. Probar hot reload en diferentes páginas');
} else {
  console.log('\n⚠️  SIN CAMBIOS:');
  console.log('   No se aplicaron correcciones (posiblemente ya estén aplicadas)');
}

console.log('\n💡 Monitoreo continuo:');
console.log('   Ejecuta: node scripts/detect-fast-refresh-errors.js');
console.log('   Para detectar nuevos problemas de Fast Refresh');
