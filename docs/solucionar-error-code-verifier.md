# Solución al Error "both auth code and code verifier should be non-empty"

## Descripción del Problema

Este error ocurre durante el flujo de autenticación OAuth con Supabase, específicamente cuando se intenta intercambiar un código de autorización por una sesión. El mensaje de error completo es:

```
Error al recuperar la sesión: Invalid request: both auth code and code verifier should be non-empty
```

## Causas Comunes

1. **Pérdida del code_verifier**: El `code_verifier` es un valor generado aleatoriamente que se almacena en el navegador (localStorage) al iniciar el flujo de autenticación OAuth. Si este valor se pierde o no está disponible cuando se intenta intercambiar el código por una sesión, se produce este error.

2. **Problemas con localStorage**: Si el navegador tiene restricciones para acceder a localStorage (por ejemplo, en modo incógnito o con ciertas configuraciones de privacidad), el `code_verifier` no se puede guardar o recuperar correctamente.

3. **Redirecciones entre dominios**: Si el flujo de autenticación implica redirecciones entre diferentes dominios, el `code_verifier` puede perderse.

4. **Caché del navegador**: A veces, el navegador puede tener problemas con la caché que afectan al almacenamiento local.

## Soluciones Implementadas

Hemos implementado varias soluciones para manejar este error:

### 1. Página de Recuperación de Sesión

Cuando se detecta el error, el usuario es redirigido a una página especial (`/auth/recovery`) que:

- Genera un nuevo `code_verifier`
- Lo guarda en múltiples ubicaciones (localStorage y sessionStorage)
- Intenta intercambiar el código por una sesión nuevamente
- Si falla, intenta una autenticación alternativa a través del servidor

### 2. Autenticación Alternativa en el Servidor

En el servidor, hemos implementado una ruta API (`/api/auth/callback-handler`) que:

- Utiliza cookies en lugar de localStorage para manejar la autenticación
- Intenta intercambiar el código por una sesión sin necesidad del `code_verifier`
- Proporciona un método alternativo de autenticación si el intercambio falla

### 3. Almacenamiento Redundante del code_verifier

Para minimizar la posibilidad de perder el `code_verifier`:

- Lo guardamos en múltiples claves en localStorage
- También lo guardamos en sessionStorage como respaldo
- Implementamos funciones para verificar y recuperar el `code_verifier` de diferentes ubicaciones

## Cómo Solucionar el Error Manualmente

Si encuentras este error, puedes:

1. **Usar la página de diagnóstico**: Visita `/auth/debug` para acceder a herramientas que te ayudarán a diagnosticar y solucionar el problema.

2. **Recuperar la sesión**: Si tienes el código de autorización en la URL, puedes usar el botón "Recuperar sesión actual" en la página de diagnóstico.

3. **Reiniciar el flujo de autenticación**: Si todo lo demás falla, usa el botón "Reiniciar todo" para cerrar la sesión, limpiar el almacenamiento local y comenzar de nuevo.

4. **Verificar la configuración de Supabase**: Asegúrate de que las URLs de redirección estén configuradas correctamente en el panel de Supabase.

## Prevención

Para prevenir este error en el futuro:

1. **Usar la ruta del servidor**: Inicia el flujo de autenticación a través de la ruta del servidor (`/auth/google`) en lugar de hacerlo directamente desde el cliente.

2. **Verificar el almacenamiento**: Antes de iniciar el flujo de autenticación, verifica que localStorage esté disponible y funcionando correctamente.

3. **Mantener actualizadas las dependencias**: Asegúrate de usar las versiones más recientes de las bibliotecas de Supabase, que pueden incluir correcciones para este problema.

## Recursos Adicionales

- [Documentación de Supabase sobre autenticación OAuth](https://supabase.com/docs/guides/auth/social-login)
- [Flujo PKCE para OAuth](https://oauth.net/2/pkce/)
- [Página de diagnóstico de autenticación](/auth/debug)
