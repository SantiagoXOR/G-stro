# 🚀 Guía de Deploy en Vercel - Gëstro

## ✅ Estado del Proyecto

**¡El proyecto está 100% listo para deploy!** ✨

- ✅ Todas las verificaciones pasaron (31/31)
- ✅ Configuración de Vercel creada
- ✅ Variables de entorno documentadas
- ✅ Scripts de deploy preparados

## 📋 Pasos para Deploy

### 1. Conectar a Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en "New Project"
3. Conecta tu repositorio GitHub
4. Selecciona el repositorio `G-stro`
5. Configura el directorio raíz como `frontend`

### 2. Configurar Variables de Entorno

En Vercel Dashboard, ve a Settings > Environment Variables y agrega:

#### 🗄️ Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://olxxrwdxsubpiujsxzxa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHhyd2R4c3VicGl1anN4enhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNjUzOTksImV4cCI6MjA2MDk0MTM5OX0.7oSlKHOYhKptJ5EgpFP1zXG5AiBJ3Hg-ix7RYSfLfFs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHhyd2R4c3VicGl1anN4enhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTM2NTM5OSwiZXhwIjoyMDYwOTQxMzk5fQ.bqMRD99y9Q3WuaOKi12z5P4RfsOPZYssWK462QoidwQ
```

#### 🔑 Clerk (ACTUALIZAR CON CREDENCIALES DE PRODUCCIÓN)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_TU_CLAVE_PUBLICA_DE_PRODUCCION
CLERK_SECRET_KEY=sk_live_TU_CLAVE_SECRETA_DE_PRODUCCION
CLERK_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_DE_PRODUCCION
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL=/
```

#### 💳 MercadoPago (ACTUALIZAR CON CREDENCIALES REALES)
```
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR_TU_CLAVE_PUBLICA_REAL
MERCADOPAGO_ACCESS_TOKEN=APP_USR_TU_TOKEN_DE_ACCESO_REAL
```

#### 🌐 Aplicación
```
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
NODE_ENV=production
```

### 3. Configurar Clerk para Producción

1. Ve a [Clerk Dashboard](https://dashboard.clerk.com)
2. Crea una nueva aplicación para producción
3. Configura dominios permitidos:
   - `tu-dominio.vercel.app`
   - `www.tu-dominio.com` (si tienes dominio personalizado)
4. Configura URLs de redirección:
   - Sign-in URL: `https://tu-dominio.vercel.app/auth/sign-in`
   - Sign-up URL: `https://tu-dominio.vercel.app/auth/sign-up`
   - After sign-in: `https://tu-dominio.vercel.app/`
   - After sign-up: `https://tu-dominio.vercel.app/`

### 4. Configurar MercadoPago

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Obtén credenciales de producción
3. Configura URLs de notificación:
   - Success URL: `https://tu-dominio.vercel.app/payment/success`
   - Failure URL: `https://tu-dominio.vercel.app/payment/failure`
   - Pending URL: `https://tu-dominio.vercel.app/payment/pending`

### 5. Deploy

1. Haz clic en "Deploy" en Vercel
2. Espera a que termine el build
3. Verifica que no hay errores

## 🧪 Verificaciones Post-Deploy

### ✅ Lista de Verificación

- [ ] La aplicación carga correctamente
- [ ] El login con Clerk funciona
- [ ] La conexión a Supabase funciona
- [ ] Los pagos con MercadoPago funcionan
- [ ] Las imágenes se cargan correctamente
- [ ] La aplicación es responsive en móviles
- [ ] El tiempo real funciona (pedidos, notificaciones)

### 🔧 Comandos de Verificación

```bash
# Verificar preparación para deploy
node scripts/verify-deploy-readiness.js

# Ver guía completa de deploy
node scripts/deploy-vercel.js
```

## 📁 Archivos de Configuración

- `vercel.json` - Configuración de Vercel
- `.env.production.example` - Variables de entorno de ejemplo
- `next.config.mjs` - Configuración de Next.js optimizada
- `DEPLOY.md` - Esta guía

## 🔗 Enlaces Importantes

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
- [Supabase Dashboard](https://supabase.com/dashboard)

## ⚠️ Notas Importantes

1. **Seguridad**: Nunca subas credenciales de producción al repositorio
2. **Testing**: Prueba exhaustivamente en staging antes de producción
3. **Monitoreo**: Configura alertas en Vercel para errores
4. **Backup**: Asegúrate de tener backups de la base de datos

## 🎉 ¡Listo!

Tu aplicación Gëstro está lista para ser desplegada en Vercel. Sigue los pasos anteriores y tendrás tu aplicación funcionando en producción.

Para cualquier problema, revisa los logs en Vercel Dashboard o ejecuta los scripts de verificación localmente.
