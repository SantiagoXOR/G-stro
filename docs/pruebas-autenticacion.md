# Pruebas de Autenticación - Gëstro

Este documento describe las pruebas automatizadas implementadas para verificar el flujo de autenticación en Gëstro.

## Tipos de Pruebas

Se han implementado tres tipos de pruebas para verificar el flujo de autenticación:

1. **Pruebas Unitarias**: Verifican el funcionamiento de componentes y servicios individuales.
2. **Pruebas de Integración**: Verifican la interacción entre componentes y servicios.
3. **Pruebas End-to-End**: Verifican el flujo completo de autenticación desde la perspectiva del usuario.

## Estructura de las Pruebas

```
frontend/
├── __tests__/                # Pruebas unitarias
│   ├── components/           
│   │   ├── auth-form.test.tsx       # Pruebas del formulario de autenticación
│   │   └── auth-provider.test.tsx   # Pruebas del proveedor de autenticación
│   └── services/             
│       └── auth.test.ts             # Pruebas de los servicios de autenticación
│
├── cypress/                  # Pruebas de integración y end-to-end
│   └── e2e/                  
│       ├── auth-flow.cy.ts          # Pruebas básicas del flujo de autenticación
│       └── auth-flow-complete.cy.ts # Pruebas exhaustivas del flujo de autenticación
│
└── scripts/                  # Scripts de prueba
    └── test-auth-flow.js            # Script para probar el flujo de autenticación con Supabase
```

## Ejecución de las Pruebas

### Pruebas Unitarias

Para ejecutar todas las pruebas unitarias:

```bash
cd frontend
npm test
```

Para ejecutar solo las pruebas de autenticación:

```bash
cd frontend
npm test -- -t "auth"
```

Para ejecutar las pruebas en modo observador (útil durante el desarrollo):

```bash
cd frontend
npm run test:watch
```

### Pruebas de Integración y End-to-End

Para ejecutar las pruebas de Cypress con la interfaz gráfica:

```bash
cd frontend
npm run cypress:open
```

Para ejecutar las pruebas de Cypress en modo headless:

```bash
cd frontend
npm run cypress:run
```

Para ejecutar solo las pruebas de autenticación:

```bash
cd frontend
npx cypress run --spec "cypress/e2e/auth-flow*.cy.ts"
```

### Script de Prueba de Autenticación

Para ejecutar el script de prueba de autenticación con Supabase:

```bash
node scripts/test-auth-flow.js
```

> **Nota**: Este script requiere que las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén configuradas correctamente.

## Casos de Prueba

### Pruebas Unitarias

#### Servicios de Autenticación (`auth.test.ts`)

- Inicio de sesión con credenciales válidas
- Manejo de errores de autenticación
- Registro de usuario
- Inicio de sesión con Google
- Cierre de sesión
- Obtención de la sesión actual

#### Proveedor de Autenticación (`auth-provider.test.tsx`)

- Carga de la sesión inicial
- Manejo de errores al cargar la sesión
- Inicio de sesión
- Cierre de sesión
- Actualización del estado de autenticación

#### Formulario de Autenticación (`auth-form.test.tsx`)

- Renderizado del formulario de inicio de sesión
- Cambio entre formularios de inicio de sesión y registro
- Validación de formato de email
- Validación de longitud de contraseña
- Envío del formulario de inicio de sesión con datos válidos
- Envío del formulario de registro con datos válidos
- Manejo de errores de autenticación
- Inicio de sesión con Google

### Pruebas de Integración y End-to-End

#### Flujo de Autenticación Básico (`auth-flow.cy.ts`)

- Navegación a la página de inicio de sesión
- Intento de registro de usuario
- Intento de inicio de sesión con credenciales válidas
- Manejo de credenciales inválidas
- Redirección de rutas protegidas

#### Flujo de Autenticación Completo (`auth-flow-complete.cy.ts`)

- Opciones de autenticación cuando no hay sesión
- Navegación a la página de inicio de sesión
- Validación de formularios
- Cambio entre formularios
- Registro de usuario
- Inicio de sesión
- Manejo de errores
- Inicio de sesión con Google
- Redirección de rutas protegidas
- Página de diagnóstico de autenticación

### Script de Prueba de Autenticación (`test-auth-flow.js`)

- Verificación de conexión a Supabase
- Registro de usuario
- Verificación de creación de perfil
- Cierre de sesión
- Inicio de sesión
- Verificación de sesión
- Verificación de políticas RLS
- Verificación de función de reparación de perfiles

## Mantenimiento de las Pruebas

Para mantener las pruebas actualizadas:

1. Actualizar las pruebas cuando se modifiquen los componentes o servicios de autenticación.
2. Agregar nuevas pruebas cuando se implementen nuevas funcionalidades.
3. Ejecutar las pruebas regularmente para detectar regresiones.
4. Revisar y actualizar los mocks cuando cambien las APIs externas.

## Solución de Problemas

### Problemas Comunes

#### Las pruebas unitarias fallan con errores de importación

Asegúrate de que las rutas de importación sean correctas y que los archivos existan. Verifica también que los mocks estén configurados correctamente.

#### Las pruebas de Cypress fallan al encontrar elementos

Verifica que los selectores utilizados en las pruebas coincidan con los elementos en la interfaz de usuario. Si la interfaz ha cambiado, actualiza los selectores.

#### El script de prueba de autenticación falla con errores de conexión

Verifica que las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén configuradas correctamente. También verifica que el servidor de Supabase esté en funcionamiento.

### Depuración

Para depurar las pruebas unitarias:

```bash
cd frontend
npm run test:debug
```

Para depurar las pruebas de Cypress, utiliza la interfaz gráfica:

```bash
cd frontend
npm run cypress:open
```

## Conclusión

Las pruebas automatizadas de autenticación son esenciales para garantizar que el flujo de autenticación funcione correctamente. Estas pruebas verifican que los usuarios puedan registrarse, iniciar sesión, cerrar sesión y acceder a rutas protegidas de manera adecuada.

Al mantener estas pruebas actualizadas y ejecutarlas regularmente, podemos detectar y corregir problemas de autenticación antes de que afecten a los usuarios.
