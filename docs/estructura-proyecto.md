# Estructura del Proyecto

Este documento describe la estructura del proyecto Gëstro, explicando la organización de directorios y archivos principales.

## Visión General

El proyecto sigue una estructura de monorepo con las siguientes carpetas principales:

```
DESARROLLO BAR QR/
├── backend/                  # Código del backend
├── frontend/                 # Frontend con Next.js
├── shared/                   # Código compartido entre frontend y backend
├── docs/                     # Documentación
├── scripts/                  # Scripts de utilidad
└── cypress/                  # Pruebas de integración
```

## Frontend

La carpeta `frontend` contiene la aplicación Next.js y sigue esta estructura:

```
frontend/
├── app/                      # App router de Next.js
│   ├── api/                  # API routes
│   ├── auth/                 # Páginas de autenticación
│   ├── admin/                # Panel de administración
│   ├── menu/                 # Páginas del menú
│   ├── cart/                 # Página del carrito
│   ├── orders/               # Páginas de pedidos
│   ├── profile/              # Páginas de perfil
│   ├── scan/                 # Página de escaneo QR
│   └── layout.tsx            # Layout principal
│
├── components/               # Componentes React
│   ├── ui/                   # Componentes UI básicos
│   ├── admin/                # Componentes para el panel de administración
│   ├── auth-form.tsx         # Formulario de autenticación
│   ├── auth-provider.tsx     # Proveedor de autenticación
│   ├── qr-scanner.tsx        # Componente de escaneo QR
│   └── mercadopago-payment-form.tsx # Formulario de pago MercadoPago
│
├── hooks/                    # Hooks personalizados
│
├── lib/                      # Utilidades y servicios
│   ├── services/             # Servicios para interactuar con la API
│   │   ├── mercadopago.ts    # Servicio de MercadoPago
│   │   ├── orders.ts         # Servicio de pedidos
│   │   ├── products.ts       # Servicio de productos
│   │   └── tables.ts         # Servicio de mesas
│   │
│   ├── store/                # Estado global con Zustand
│   │   ├── cart-store.ts     # Store del carrito
│   │   └── auth-store.ts     # Store de autenticación
│   │
│   ├── supabase.ts           # Cliente de Supabase para el navegador
│   ├── supabase-server.ts    # Cliente de Supabase para el servidor
│   ├── supabase-config.ts    # Configuración de Supabase
│   └── utils.ts              # Funciones de utilidad
│
├── public/                   # Archivos estáticos
│
├── __tests__/                # Pruebas unitarias
│   ├── components/           # Pruebas de componentes
│   └── services/             # Pruebas de servicios
│
├── cypress/                  # Pruebas de integración
│   ├── e2e/                  # Pruebas de extremo a extremo
│   └── support/              # Utilidades para Cypress
│
├── next.config.mjs           # Configuración de Next.js
├── tailwind.config.ts        # Configuración de Tailwind CSS
├── jest.config.js            # Configuración de Jest
└── package.json              # Dependencias y scripts
```

## Backend

La carpeta `backend` contiene el código del backend y sigue esta estructura:

```
backend/
├── supabase/                 # Configuración de Supabase
│   ├── migrations/           # Migraciones de la base de datos
│   └── functions/            # Funciones Edge de Supabase
│
└── lib/                      # Utilidades compartidas del backend
    ├── supabase.ts           # Cliente de Supabase para el backend
    └── mcp-server.ts         # Servidor MCP para modelos de IA
```

## Shared

La carpeta `shared` contiene código compartido entre frontend y backend:

```
shared/
├── types/                    # Definiciones de tipos TypeScript
│   └── database.types.ts     # Tipos generados de la base de datos
│
└── utils/                    # Funciones de utilidad compartidas
```

## Docs

La carpeta `docs` contiene la documentación del proyecto:

```
docs/
├── inicio-rapido.md          # Guía de inicio rápido
├── estructura.md             # Estructura del proyecto
├── configuracion-produccion.md # Configuración para producción
├── pruebas.md                # Guía de pruebas
└── mercadopago-integracion.md # Integración con MercadoPago
```

## Scripts

La carpeta `scripts` contiene scripts de utilidad:

```
scripts/
├── run-tests.js              # Script para ejecutar pruebas
├── test-supabase-connection.js # Prueba de conexión a Supabase
├── test-supabase-db.js       # Prueba de conexión a la base de datos
└── test-auth-endpoint.js     # Prueba del endpoint de autenticación
```

## Archivos Principales

### Configuración

- `.env.local.example`: Ejemplo de variables de entorno
- `next.config.mjs`: Configuración de Next.js
- `tailwind.config.ts`: Configuración de Tailwind CSS
- `jest.config.js`: Configuración de Jest
- `cypress.config.ts`: Configuración de Cypress

### Dependencias

- `package.json`: Dependencias y scripts del monorepo
- `frontend/package.json`: Dependencias y scripts del frontend

## Flujo de Datos

El flujo de datos en la aplicación sigue este patrón:

1. **Componentes UI**: Muestran la interfaz y capturan interacciones del usuario.
2. **Hooks/Stores**: Gestionan el estado local y global.
3. **Servicios**: Interactúan con la API y la base de datos.
4. **Supabase**: Proporciona acceso a la base de datos y autenticación.

## Patrones de Diseño

El proyecto utiliza los siguientes patrones de diseño:

- **Componentes**: Componentes React reutilizables.
- **Hooks**: Hooks personalizados para lógica reutilizable.
- **Servicios**: Funciones para interactuar con APIs externas.
- **Stores**: Estado global con Zustand.
- **Providers**: Contextos de React para funcionalidades compartidas.

## Convenciones de Nomenclatura

- **Archivos de componentes**: PascalCase (ej. `QRScanner.tsx`)
- **Archivos de hooks**: camelCase con prefijo `use` (ej. `useAuth.ts`)
- **Archivos de servicios**: camelCase (ej. `mercadopago.ts`)
- **Archivos de pruebas**: Mismo nombre que el archivo probado con sufijo `.test.tsx` o `.cy.ts`
