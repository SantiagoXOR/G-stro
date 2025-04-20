# Limpieza de Archivos Obsoletos

## Resumen

Como parte de la migración a Supabase, se han identificado y movido varios archivos que ya no son necesarios para el funcionamiento del proyecto. Estos archivos se han trasladado a una carpeta `legacy` para mantener un historial, pero no se utilizan en el flujo de trabajo actual.

## Archivos Movidos

### Archivos SQL en la raíz del proyecto

Estos archivos fueron utilizados durante el proceso de migración inicial y ya no son necesarios:

- `combined-migrations-corrected.sql`
- `combined-migrations-fixed.sql`
- `combined-migrations.sql`
- `create-missing-tables.sql`

### Archivos de migración duplicados o con versiones antiguas

Estos archivos tienen versiones corregidas o ya han sido aplicados:

- `backend/supabase/migrations/20250403000000_create_tables_reservations.sql`
- `backend/supabase/migrations/20250404000000_create_inventory.sql`
- `backend/supabase/migrations/20250406000000_create_payment_tables.sql`
- `backend/supabase/migrations/20250407000000_create_delivery_tracking.sql`
- `backend/supabase/migrations/20250408000000_create_reviews_tables.sql`
- `backend/supabase/migrations/simple_tables_migration.sql`

### Scripts JavaScript temporales

Estos scripts fueron utilizados durante el proceso de migración y ya no son necesarios para el funcionamiento normal:

- `scripts/apply-categories-migration.js`
- `scripts/apply-migrations-by-parts.js`
- `scripts/apply-migrations-direct.js`
- `scripts/fix-migrations.js`
- `scripts/prepare-migrations.js`
- `scripts/split-migrations.js`

### Scripts de prueba que ya no son relevantes

Estos scripts fueron utilizados para probar la migración y ya no son necesarios:

- `scripts/check-pgexec.js`
- `scripts/check-tables.js`
- `scripts/get-table-columns.js`
- `scripts/list-tables.js`
- `scripts/test-profiles-table.js`

## Scripts Mejorados

### generate-types.js

Este script ha sido refactorizado para:

1. Obtener el esquema de la base de datos directamente desde Supabase en lugar de usar un esquema codificado.
2. Detectar automáticamente las relaciones entre tablas.
3. Manejar correctamente los tipos enumerados.
4. Generar tipos TypeScript más completos y precisos.
5. Incluir tipos auxiliares para facilitar el uso en el frontend.

## Configuración

Se ha creado un archivo de ejemplo `scripts/supabase-config.example.js` que debe copiarse a `scripts/supabase-config.js` y completarse con las credenciales de Supabase para que los scripts funcionen correctamente.

## Recomendaciones para el Desarrollo Futuro

1. Utilizar siempre la herramienta de Supabase MCP para aplicar migraciones.
2. Mantener los tipos TypeScript actualizados ejecutando `node scripts/generate-types.js` después de cada cambio en el esquema de la base de datos.
3. Documentar cualquier cambio significativo en el esquema de la base de datos en `docs/database-schema.md`.
4. Seguir el patrón de migración por partes para cambios complejos en la base de datos.
