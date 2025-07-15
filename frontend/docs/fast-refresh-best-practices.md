# Mejores Prácticas para Fast Refresh - Gëstro

## 🎯 Objetivo
Mantener un entorno de desarrollo estable con hot reloading eficiente y sin errores de Fast Refresh.

## 📋 Reglas Fundamentales

### 1. Dependencias de Hooks
- ✅ Usar `user?.id` en lugar de `user` completo
- ✅ Memoizar funciones con `useCallback`
- ❌ Evitar dependencias circulares
- ❌ No incluir objetos completos en dependencias

### 2. Estructura de Componentes
- ✅ Usar Error Boundaries para componentes críticos
- ✅ Separar lógica de presentación
- ✅ Memoizar componentes pesados con `React.memo`

### 3. Gestión de Estado
- ✅ Usar `useState` para estado local simple
- ✅ Usar `useReducer` para estado complejo
- ❌ Evitar mutaciones directas de estado

## 🛠️ Herramientas Disponibles

### Scripts de NPM
```bash
npm run check:fast-refresh    # Detectar problemas
npm run fix:fast-refresh      # Corregir automáticamente
npm run lint:fast-refresh     # Linting específico
npm run dev:monitor          # Desarrollo con monitoreo
```

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
**Solución:** Revisar arrays de dependencias en `useEffect` y `useCallback`

### Error: "Cannot update a component while rendering"
**Causa:** Llamadas a setState durante el render
**Solución:** Mover setState a `useEffect` o event handlers

### Error: "Maximum update depth exceeded"
**Causa:** Bucle infinito en actualizaciones de estado
**Solución:** Revisar dependencias de `useEffect`

## 📈 Monitoreo Continuo

El sistema de monitoreo está activo durante el desarrollo y proporciona:
- Detección automática de errores
- Estadísticas de rendimiento
- Alertas en tiempo real
- Sugerencias de mejora

## 🔄 Flujo de Trabajo Recomendado

1. **Desarrollo:** Usar `npm run dev:monitor`
2. **Verificación:** Ejecutar `npm run check:fast-refresh`
3. **Corrección:** Aplicar `npm run fix:fast-refresh` si es necesario
4. **Validación:** Confirmar con `npm run lint:fast-refresh`

## 💡 Tips Adicionales

- Mantener componentes pequeños y enfocados
- Usar TypeScript para mejor detección de errores
- Implementar tests para componentes críticos
- Revisar regularmente el monitor de Fast Refresh
