# 🔐 Configuración de Credenciales de Producción - Gëstro

## 📋 Resumen

Esta guía detalla cómo configurar todas las credenciales de producción necesarias para el deployment de Gëstro en Vercel.

## 🎯 Estado Actual

### ✅ Configuraciones Completadas
- **Supabase**: Proyecto configurado y funcionando
- **Estructura**: Archivos y configuraciones en orden
- **Dependencias**: Limpiadas y actualizadas

### ⚠️ Pendientes de Configuración
- **Clerk**: Credenciales de desarrollo → producción
- **MercadoPago**: Credenciales de prueba → reales
- **Variables de entorno**: Actualización para producción

## 🔧 Configuración de Clerk para Producción

### Paso 1: Crear Aplicación de Producción
1. Ve a [Clerk Dashboard](https://dashboard.clerk.com)
2. Crea una nueva aplicación para producción
3. Configura el dominio de producción (ej: `gestro.vercel.app`)

### Paso 2: Configurar Autenticación
```javascript
// Configuración recomendada para producción
{
  "sign_in_url": "/auth/sign-in",
  "sign_up_url": "/auth/sign-up",
  "after_sign_in_url": "/",
  "after_sign_up_url": "/",
  "providers": ["google", "email"]
}
```

### Paso 3: Obtener Credenciales
```env
# Reemplazar en variables de entorno
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_TU_CLAVE_PUBLICA_REAL
CLERK_SECRET_KEY=sk_live_TU_CLAVE_SECRETA_REAL
```

### Paso 4: Configurar Webhook
- URL: `https://tu-dominio.vercel.app/api/webhook/clerk`
- Eventos: `user.created`, `user.updated`, `user.deleted`
- Obtener `CLERK_WEBHOOK_SECRET`

## 💳 Configuración de MercadoPago

### Paso 1: Cuenta de Producción
1. Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Cambia a modo "Producción"
3. Obtén credenciales reales

### Paso 2: Credenciales de Producción
```env
# Reemplazar credenciales de prueba
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR_TU_CLAVE_PUBLICA_REAL
MERCADOPAGO_ACCESS_TOKEN=APP_USR_TU_TOKEN_DE_ACCESO_REAL
```

### Paso 3: Configurar Webhooks
- URL: `https://tu-dominio.vercel.app/api/payments/webhook`
- Eventos: `payment`, `merchant_order`

## 🗄️ Verificación de Supabase

### Configuración Actual (✅ Funcionando)
```env
NEXT_PUBLIC_SUPABASE_URL=https://olxxrwdxsubpiujsxzxa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Verificaciones Necesarias
- [ ] RLS policies configuradas
- [ ] Tablas migradas correctamente
- [ ] Funciones Edge funcionando

## 📄 Variables de Entorno para Producción

### Archivo: `.env.production`
```env
# Supabase - Producción ✅
NEXT_PUBLIC_SUPABASE_URL=https://olxxrwdxsubpiujsxzxa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clerk - Producción (ACTUALIZAR)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_TU_CLAVE_PUBLICA_REAL
CLERK_SECRET_KEY=sk_live_TU_CLAVE_SECRETA_REAL
CLERK_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_REAL

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL=/

# MercadoPago - Producción (ACTUALIZAR)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR_TU_CLAVE_PUBLICA_REAL
MERCADOPAGO_ACCESS_TOKEN=APP_USR_TU_TOKEN_DE_ACCESO_REAL

# Aplicación
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
NODE_ENV=production

# Vercel
NEXT_PUBLIC_VERCEL_URL=${VERCEL_URL}
```

## 🚨 Problemas Conocidos

### Build Local con Permisos
```
Error: EPERM: operation not permitted, open '.next\trace'
```
**Solución**: Este error no afecta el deployment en Vercel, donde el build funciona correctamente.

### Dependencias de Supabase
```
Warning: Critical dependency in @supabase/realtime-js
```
**Solución**: Warning conocido que no afecta funcionalidad.

## ✅ Checklist de Configuración

### Clerk
- [ ] Aplicación de producción creada
- [ ] Dominio configurado
- [ ] Credenciales obtenidas
- [ ] Webhook configurado
- [ ] Variables actualizadas

### MercadoPago
- [ ] Cuenta de producción activada
- [ ] Credenciales reales obtenidas
- [ ] Webhooks configurados
- [ ] Variables actualizadas

### Supabase
- [x] Proyecto funcionando
- [x] Credenciales configuradas
- [ ] RLS verificado
- [ ] Migraciones aplicadas

## 🔗 Enlaces Importantes

- [Clerk Dashboard](https://dashboard.clerk.com)
- [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)

## 📞 Próximos Pasos

1. **Configurar Clerk para producción**
2. **Obtener credenciales reales de MercadoPago**
3. **Crear archivo .env.production completo**
4. **Configurar webhooks necesarios**
5. **Proceder con deployment en Vercel**
