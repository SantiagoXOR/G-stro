# Gëstro

Aplicación para gestión de bar/restaurante con sistema de pedidos por QR.

## Características

- **Escaneo de QR**: Escanea códigos QR de mesas para realizar pedidos.
- **Menú Digital**: Visualiza el menú completo con categorías, productos y detalles.
- **Carrito de Compras**: Agrega productos al carrito y gestiona cantidades.
- **Procesamiento de Pagos**: Integración con MercadoPago para pagos en línea.
- **Seguimiento de Pedidos**: Visualiza el estado de tus pedidos en tiempo real.
- **Panel de Administración**: Gestiona productos, categorías, mesas y pedidos.
- **Autenticación**: Registro e inicio de sesión de usuarios.
- **Perfiles de Usuario**: Gestiona tu información personal y métodos de pago.

## Estructura del Proyecto

```
DESARROLLO BAR QR/
├── backend/                  # Código del backend
│   ├── supabase/             # Migraciones y configuración de Supabase
│   │   ├── migrations/       # Migraciones de la base de datos
│   │   └── functions/        # Funciones Edge de Supabase
│   └── lib/                  # Utilidades compartidas del backend
│
├── frontend/                 # Frontend con Next.js
│   ├── app/                  # App router de Next.js
│   ├── components/           # Componentes UI
│   ├── hooks/                # Hooks personalizados de React
│   ├── lib/                  # Utilidades del frontend
│   ├── public/               # Activos estáticos
│   └── styles/               # Estilos CSS
│
├── shared/                   # Código compartido entre frontend y backend
│   ├── types/                # Definiciones de tipos TypeScript
│   └── utils/                # Funciones de utilidad compartidas
│
└── docs/                     # Documentación del proyecto
```

## Stack Tecnológico

**Backend:**
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage
- **API**: Supabase REST API + Edge Functions

**Frontend:**
- **Framework**: Next.js 15
- **Componentes UI**:
  - Radix UI primitives
  - Tailwind CSS para estilos
- **Gestión de Estado**: Zustand
- **Manejo de Formularios**: React Hook Form + Zod validation
- **Cliente API**: Hooks personalizados con fetch API

## Inicio Rápido

### Requisitos Previos

- Node.js (versión 18 o superior)
- npm o pnpm
- Git

### Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd DESARROLLO-BAR-QR
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

```bash
cp frontend/.env.local.example frontend/.env.local
```

Edita el archivo `.env.local` con tus credenciales de Supabase y MercadoPago.

4. Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

Para más detalles, consulta la [guía de inicio rápido](docs/inicio-rapido.md).

## Desarrollo

### Frontend

El frontend está construido con Next.js y utiliza el App Router. Para iniciar el servidor de desarrollo:

```
cd frontend
npm run dev
```

### Backend

El backend utiliza Supabase. Las migraciones de la base de datos se encuentran en `backend/supabase/migrations`.

Para aplicar las migraciones a Supabase:

```bash
# Configurar variables de entorno (reemplaza con tus valores)
$env:NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-clave-anonima"
$env:SUPABASE_SERVICE_ROLE_KEY="tu-clave-de-servicio"

# Aplicar migraciones y generar tipos
npm run supabase:setup
```

Para más detalles, consulta la [guía de migraciones de Supabase](docs/migraciones-supabase.md).

## Pruebas

### Pruebas Unitarias

```bash
npm run test:unit
```

### Pruebas de Integración

```bash
npm run test:e2e
```

### Todas las Pruebas

```bash
npm test
```

Para más detalles, consulta la [guía de pruebas](docs/pruebas.md).

## Despliegue

### Frontend (Vercel)

1. Conecta tu repositorio a Vercel.
2. Configura las variables de entorno en Vercel.
3. Despliega la aplicación.

### Backend (Supabase)

1. Crea un proyecto en Supabase.
2. Ejecuta las migraciones de la base de datos.
3. Configura las funciones Edge.

Para más detalles, consulta la [guía de configuración para producción](docs/configuracion-produccion.md).

## Documentación

- [Guía de Inicio Rápido](docs/inicio-rapido.md)
- [Estructura del Proyecto](docs/estructura-proyecto.md)
- [Configuración para Producción](docs/configuracion-produccion.md)
- [Guía de Pruebas](docs/pruebas.md)
- [Integración con MercadoPago](docs/mercadopago-integracion.md)
- [Migraciones de Supabase](docs/migraciones-supabase.md)
- [Guía de Seguridad de Supabase](docs/guia-seguridad-supabase.md)
