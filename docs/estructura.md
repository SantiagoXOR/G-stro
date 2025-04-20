# Estructura del Proyecto

## Visión General

El proyecto está organizado en una estructura monorepo con las siguientes carpetas principales:

```
Gëstro/
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

## Detalles de la Estructura

### Backend

- **supabase/migrations/**: Contiene los archivos SQL para la creación y actualización de la base de datos.
- **supabase/functions/**: Contiene las funciones Edge de Supabase para lógica del servidor.
- **lib/**: Contiene utilidades y servicios para interactuar con Supabase.

### Frontend

- **app/**: Contiene las páginas y rutas de la aplicación utilizando el App Router de Next.js.
- **components/**: Componentes React reutilizables.
  - **ui/**: Componentes de UI básicos (botones, inputs, etc.).
  - **admin/**: Componentes específicos para el panel de administración.
- **hooks/**: Hooks personalizados de React.
- **lib/**: Utilidades del frontend, incluyendo el cliente de Supabase.
- **public/**: Archivos estáticos como imágenes y fuentes.
- **styles/**: Archivos CSS y configuración de Tailwind.

### Shared

- **types/**: Definiciones de tipos TypeScript compartidas entre frontend y backend.
- **utils/**: Funciones de utilidad compartidas.

## Flujo de Datos

1. El frontend utiliza el cliente de Supabase para comunicarse con el backend.
2. Las operaciones de base de datos se realizan a través de la API REST de Supabase.
3. La autenticación se maneja a través de Supabase Auth.
4. Los archivos estáticos se almacenan en Supabase Storage.

## Convenciones de Nomenclatura

- **Archivos de componentes**: PascalCase (ej. `ProductCard.tsx`)
- **Archivos de utilidades**: camelCase (ej. `formatCurrency.ts`)
- **Archivos de páginas**: camelCase (ej. `page.tsx`, `layout.tsx`)
- **Archivos de tipos**: camelCase (ej. `database.types.ts`)

## Tecnologías Principales

- **Frontend**: Next.js, React, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Lenguajes**: TypeScript, SQL
- **Herramientas de Desarrollo**: ESLint, Prettier
