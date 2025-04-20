# Guía de Inicio Rápido

Esta guía te ayudará a configurar y ejecutar el proyecto Slainte Bar QR en tu entorno local.

## Requisitos Previos

Asegúrate de tener instalado:

- Node.js (versión 18 o superior)
- npm o pnpm
- Git

## Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd DESARROLLO-BAR-QR
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env.local
```

Edita el archivo `.env.local` y configura las variables de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

### 3. Instalar Dependencias

```bash
# Instalar dependencias del frontend
cd frontend
npm install
```

## Ejecutar el Proyecto

### Iniciar el Servidor de Desarrollo

```bash
# Desde la carpeta frontend
npm run dev
```

Esto iniciará el servidor de desarrollo en `http://localhost:3000`.

## Estructura de Directorios

- `frontend/`: Código del frontend (Next.js)
- `backend/`: Código del backend y migraciones de Supabase
- `shared/`: Código compartido entre frontend y backend
- `docs/`: Documentación del proyecto

## Flujo de Trabajo de Desarrollo

1. **Frontend**: Desarrolla componentes y páginas en la carpeta `frontend/`.
2. **Backend**: Actualiza migraciones de base de datos en `backend/supabase/migrations/`.
3. **Tipos Compartidos**: Mantén actualizados los tipos en `shared/types/`.

## Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm run start

# Ejecutar linting
npm run lint
```

## Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.io/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Documentación de Radix UI](https://www.radix-ui.com/docs/primitives/overview/introduction)

## Solución de Problemas

### Error de Conexión a Supabase

Si encuentras errores de conexión a Supabase, verifica:

1. Que las variables de entorno estén correctamente configuradas
2. Que tu proyecto de Supabase esté activo
3. Que tengas permisos para acceder al proyecto

### Errores de Compilación

Si encuentras errores de compilación:

1. Verifica que todas las dependencias estén instaladas
2. Ejecuta `npm install` para actualizar las dependencias
3. Borra la carpeta `.next` y vuelve a iniciar el servidor
