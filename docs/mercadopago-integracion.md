# Integración con MercadoPago

Esta guía explica cómo funciona la integración con MercadoPago en el proyecto Slainte Bar QR y cómo configurarla correctamente.

## Arquitectura de la Integración

La integración con MercadoPago consta de los siguientes componentes:

1. **Frontend**:
   - Formulario de pago (`MercadoPagoPaymentForm`)
   - Servicio de MercadoPago (`mercadopago.ts`)
   - Configuración de MercadoPago (`supabase-config.ts`)

2. **Backend**:
   - API para procesar pagos (`/api/payments/process`)
   - Webhook para recibir notificaciones (`/api/payments/webhook`)
   - API de prueba (`/api/payments/test`)

3. **Base de Datos**:
   - Tabla `payment_transactions` para almacenar transacciones
   - Tabla `payment_methods` para almacenar métodos de pago guardados

## Flujo de Pago

El flujo de pago con MercadoPago funciona de la siguiente manera:

1. El usuario agrega productos al carrito y procede al checkout.
2. Se crea una orden en la base de datos con estado `pending`.
3. Se crea una transacción de pago asociada a la orden.
4. El usuario selecciona MercadoPago como método de pago.
5. El usuario completa el formulario de pago con los datos de su tarjeta.
6. El frontend genera un token de tarjeta usando el SDK de MercadoPago.
7. El frontend envía el token y los datos de pago al backend.
8. El backend procesa el pago usando la API de MercadoPago.
9. El backend actualiza el estado de la transacción y la orden.
10. El usuario es redirigido a la página de confirmación.

## Configuración

### Variables de Entorno

Para que la integración funcione correctamente, es necesario configurar las siguientes variables de entorno:

```
# MercadoPago - Modo de prueba
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-tu-clave-publica-aqui
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-token-de-acceso-aqui

# MercadoPago - Modo de producción
# NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-clave-publica-aqui
# MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-token-de-acceso-aqui
```

### Verificación de Configuración

Puedes verificar que la configuración de MercadoPago es correcta accediendo a:

```
/api/payments/test
```

Esta ruta devolverá un JSON indicando si las credenciales están configuradas correctamente.

## Componentes Principales

### MercadoPagoPaymentForm

Este componente muestra un formulario para ingresar los datos de la tarjeta y procesar el pago. Se encuentra en:

```
frontend/components/mercadopago-payment-form.tsx
```

### Servicio de MercadoPago

Este servicio proporciona funciones para interactuar con MercadoPago, como inicializar el SDK, procesar pagos, etc. Se encuentra en:

```
frontend/lib/services/mercadopago.ts
```

### API de Procesamiento de Pagos

Esta API recibe los datos de pago del frontend y los procesa usando la API de MercadoPago. Se encuentra en:

```
frontend/app/api/payments/process/route.ts
```

### Webhook de MercadoPago

Este webhook recibe notificaciones de MercadoPago sobre cambios en el estado de los pagos. Se encuentra en:

```
frontend/app/api/payments/webhook/route.ts
```

## Personalización

### Estilos del Formulario de Pago

Puedes personalizar los estilos del formulario de pago modificando el componente `MercadoPagoPaymentForm`. Los estilos actuales utilizan Tailwind CSS y los componentes de UI del proyecto.

### Flujo de Pago

Puedes personalizar el flujo de pago modificando la función `handleCheckout` en la página del carrito:

```
frontend/app/cart/page.tsx
```

## Pruebas

### Tarjetas de Prueba

Para probar la integración con MercadoPago, puedes usar las siguientes tarjetas de prueba:

| Tipo | Número | CVV | Fecha de Vencimiento |
|------|--------|-----|----------------------|
| Visa | 4509 9535 6623 3704 | 123 | 11/25 |
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 |
| American Express | 3711 803032 57522 | 1234 | 11/25 |

### Pruebas Automatizadas

El proyecto incluye pruebas automatizadas para la integración con MercadoPago:

- Pruebas unitarias: `frontend/__tests__/services/mercadopago.test.ts`
- Pruebas de integración: `frontend/cypress/e2e/mercadopago-integration.cy.ts`

## Solución de Problemas

### Errores Comunes

#### Error: "Invalid public key"

Este error ocurre cuando la clave pública de MercadoPago no está configurada correctamente. Verifica que la variable de entorno `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` esté configurada correctamente.

#### Error: "Invalid access token"

Este error ocurre cuando el token de acceso de MercadoPago no está configurado correctamente. Verifica que la variable de entorno `MERCADOPAGO_ACCESS_TOKEN` esté configurada correctamente.

#### Error: "Token not found"

Este error ocurre cuando el token de tarjeta no se genera correctamente. Verifica que el formulario de pago esté funcionando correctamente y que el SDK de MercadoPago esté inicializado.

### Logs

Para depurar problemas con la integración de MercadoPago, puedes revisar los logs del servidor y del navegador. Los errores relacionados con MercadoPago se registran con el prefijo "Error al procesar pago:" o "Error al inicializar MercadoPago:".

## Recursos Adicionales

- [Documentación oficial de MercadoPago](https://www.mercadopago.com.ar/developers/es/docs)
- [Referencia de la API de MercadoPago](https://www.mercadopago.com.ar/developers/es/reference)
- [Guía de integración de Checkout API](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/landing)
