# Configuración para Producción

Esta guía explica cómo configurar el proyecto para un entorno de producción, incluyendo la configuración de Supabase y MercadoPago.

## Variables de Entorno

Para el correcto funcionamiento en producción, es necesario configurar las siguientes variables de entorno:

### Supabase

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | `https://myjqdrrqfdugzmuejypz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio para operaciones privilegiadas | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### MercadoPago

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Clave pública de MercadoPago | `APP_USR-8db4...` |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acceso privado de MercadoPago | `APP_USR-8754...` |

### Aplicación

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | URL base de la aplicación | `https://tu-dominio.com` |

## Obtener Credenciales de MercadoPago

Para obtener credenciales reales de MercadoPago para producción, sigue estos pasos:

1. **Crear una cuenta de MercadoPago**:
   - Regístrate en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
   - Completa la información de tu cuenta y verifica tu identidad

2. **Crear una aplicación**:
   - Ve a la sección "Tus aplicaciones" en el [Dashboard de Desarrolladores](https://www.mercadopago.com.ar/developers/panel/applications)
   - Haz clic en "Crear aplicación"
   - Completa la información requerida sobre tu aplicación
   - Selecciona los permisos necesarios (mínimo: `payments`, `offline_access`)

3. **Obtener credenciales de producción**:
   - Una vez creada la aplicación, ve a la sección "Credenciales"
   - Asegúrate de cambiar al modo "Producción"
   - Copia la "Clave pública" (`NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`)
   - Copia el "Access token" (`MERCADOPAGO_ACCESS_TOKEN`)

4. **Configurar Webhook**:
   - En la sección "Webhooks" de tu aplicación, configura la URL de notificación:
   - `https://tu-dominio.com/api/payments/webhook`
   - Selecciona los eventos a recibir: `payment`, `merchant_order`

## Configuración en Plataformas de Hosting

### Vercel

Para configurar las variables de entorno en Vercel:

1. Ve al dashboard de tu proyecto en Vercel
2. Navega a "Settings" > "Environment Variables"
3. Agrega cada variable y su valor
4. Asegúrate de marcar correctamente qué variables deben estar disponibles en:
   - Production: Todas las variables
   - Preview: Todas las variables (puedes usar credenciales de prueba)
   - Development: No es necesario, se usan las de `.env.local`

### Netlify

Para configurar las variables de entorno en Netlify:

1. Ve al dashboard de tu proyecto en Netlify
2. Navega a "Site settings" > "Build & deploy" > "Environment"
3. Agrega cada variable y su valor en "Environment variables"

## Verificación de Configuración

Después de desplegar, verifica que la configuración sea correcta accediendo a:

```
https://tu-dominio.com/api/payments/test
```

Esta ruta devolverá un JSON indicando si las credenciales de MercadoPago están configuradas correctamente.

## Modo de Prueba vs Producción

MercadoPago proporciona dos conjuntos de credenciales:

- **Credenciales de Prueba**: Comienzan con `TEST-`. Úsalas durante el desarrollo.
- **Credenciales de Producción**: Comienzan con `APP_USR-`. Úsalas en el entorno de producción.

Para realizar pruebas con las credenciales de producción, debes usar [tarjetas de prueba proporcionadas por MercadoPago](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/additional-content/test-cards).
