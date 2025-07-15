# Configuración de Clerk para Producción - Gëstro

## Introducción

Esta guía te ayudará a configurar Clerk con credenciales de producción en el proyecto Gëstro, incluyendo la configuración del webhook y la verificación de la integración completa.

## Requisitos Previos

1. Cuenta de Clerk configurada
2. Proyecto de Supabase funcionando
3. Variables de entorno de Supabase configuradas

## Paso 1: Obtener Credenciales de Clerk

### 1.1 Acceder al Dashboard de Clerk

1. Ve a [dashboard.clerk.com](https://dashboard.clerk.com)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a la sección "API Keys"

### 1.2 Obtener las Claves

Necesitarás las siguientes credenciales:

- **Publishable Key**: Comienza con `pk_live_` (producción) o `pk_test_` (desarrollo)
- **Secret Key**: Comienza con `sk_live_` (producción) o `sk_test_` (desarrollo)

## Paso 2: Configurar el Webhook

### 2.1 Crear el Webhook en Clerk

1. En el dashboard de Clerk, ve a "Webhooks"
2. Haz clic en "Add Endpoint"
3. Configura la URL del webhook:
   ```
   https://tu-dominio.com/api/webhooks/clerk
   ```
   Para desarrollo local:
   ```
   http://localhost:3000/api/webhooks/clerk
   ```

### 2.2 Configurar Eventos

Selecciona los siguientes eventos:
- `user.created`
- `user.updated`
- `user.deleted`

### 2.3 Obtener el Webhook Secret

1. Después de crear el webhook, copia el "Signing Secret"
2. Comienza con `whsec_`

## Paso 3: Configurar Variables de Entorno

### 3.1 Usar el Script Automático

Ejecuta el script de configuración:

```bash
npm run clerk:setup
```

Este script te pedirá las credenciales y actualizará automáticamente el archivo `.env`.

### 3.2 Configuración Manual

Si prefieres configurar manualmente, edita el archivo `.env`:

```bash
# Clerk - Configuración de Producción
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_tu_clave_aqui
CLERK_SECRET_KEY=sk_live_tu_clave_aqui
CLERK_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

# Clerk URLs (mantener estos valores)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Paso 4: Verificar la Configuración

### 4.1 Verificar Integración

Ejecuta el script de verificación:

```bash
npm run clerk:verify
```

Este script verificará:
- Variables de entorno configuradas
- Conexión a Supabase
- Estructura de la tabla profiles
- Accesibilidad del webhook
- Políticas RLS

### 4.2 Probar Flujo de Autenticación

Ejecuta las pruebas del flujo completo:

```bash
npm run clerk:test
```

Este script probará:
- Creación de usuario simulada
- Sincronización con Supabase
- Políticas RLS
- Actualización de roles

## Paso 5: Probar en el Navegador

### 5.1 Iniciar la Aplicación

```bash
npm run dev
```

### 5.2 Probar Funcionalidades

1. **Registro de Usuario**:
   - Ve a `/auth/sign-up`
   - Registra un nuevo usuario
   - Verifica que se cree el perfil en Supabase

2. **Inicio de Sesión**:
   - Ve a `/auth/sign-in`
   - Inicia sesión con el usuario creado
   - Verifica que la sesión funcione

3. **Protección de Rutas**:
   - Intenta acceder a `/admin` sin permisos
   - Verifica que se redirija a `/acceso-denegado`

4. **Webhook**:
   - Registra un usuario nuevo
   - Verifica en Supabase que se creó el perfil automáticamente

## Paso 6: Ejecutar Pruebas Automatizadas

### 6.1 Pruebas Unitarias

```bash
cd frontend
npm run test:auth
```

### 6.2 Pruebas E2E

```bash
cd frontend
npm run e2e:auth
```

## Solución de Problemas

### Error: "CLERK_WEBHOOK_SECRET env var is not set"

**Causa**: La variable de entorno del webhook no está configurada.

**Solución**:
1. Verifica que `CLERK_WEBHOOK_SECRET` esté en el archivo `.env`
2. Reinicia el servidor de desarrollo
3. Verifica que el valor comience con `whsec_`

### Error: "Error al verificar el webhook"

**Causa**: El webhook secret no coincide o la firma es inválida.

**Solución**:
1. Verifica que el webhook secret sea correcto
2. Asegúrate de que la URL del webhook esté configurada correctamente en Clerk
3. Verifica que los eventos estén seleccionados

### Error: "Database error saving new user"

**Causa**: Problema con la sincronización a Supabase.

**Solución**:
1. Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
2. Verifica que la tabla `profiles` exista
3. Verifica que las políticas RLS permitan la inserción

### Usuario no se sincroniza con Supabase

**Causa**: El webhook no se está ejecutando.

**Solución**:
1. Verifica que el webhook esté configurado en Clerk
2. Verifica que la URL sea accesible
3. Revisa los logs del webhook en Clerk
4. Verifica que los eventos estén seleccionados

## Configuración para Producción

### Variables de Entorno de Producción

Para producción, asegúrate de usar:

```bash
# Usar claves de producción (pk_live_ y sk_live_)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# URL de producción
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### Configuración de Seguridad

1. **HTTPS**: Asegúrate de que tu aplicación use HTTPS en producción
2. **Webhook URL**: Usa HTTPS para la URL del webhook
3. **Variables de Entorno**: Nunca expongas las claves secretas en el frontend

## Monitoreo

### Logs del Webhook

Puedes monitorear los webhooks en:
1. Dashboard de Clerk > Webhooks > Tu webhook > Logs
2. Logs de tu aplicación (consola del servidor)

### Métricas de Autenticación

Clerk proporciona métricas en el dashboard:
- Usuarios registrados
- Inicios de sesión
- Errores de autenticación

## Próximos Pasos

Una vez configurado Clerk correctamente:

1. **Implementar funcionalidades adicionales**:
   - Gestión de roles avanzada
   - Perfiles de usuario personalizados
   - Integración con otras funcionalidades

2. **Optimizar rendimiento**:
   - Caché de sesiones
   - Optimización de consultas RLS

3. **Mejorar seguridad**:
   - Auditoría de accesos
   - Políticas de contraseñas
   - Autenticación de dos factores
