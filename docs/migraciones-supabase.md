# Guía para aplicar migraciones a Supabase

Esta guía explica cómo aplicar las migraciones de la base de datos a Supabase para el proyecto Gëstro.

## Requisitos previos

Antes de comenzar, asegúrate de tener:

1. Un proyecto creado en Supabase
2. La URL del proyecto y las claves de API (anónima y de servicio)
3. Node.js instalado en tu máquina

## Configuración de variables de entorno

Para aplicar las migraciones, necesitas configurar las siguientes variables de entorno:

```bash
# En Windows (PowerShell)
$env:NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-clave-anonima"
$env:SUPABASE_SERVICE_ROLE_KEY="tu-clave-de-servicio"

# En Windows (CMD)
set NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
set NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
set SUPABASE_SERVICE_ROLE_KEY=tu-clave-de-servicio

# En Linux/macOS
export NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-clave-anonima"
export SUPABASE_SERVICE_ROLE_KEY="tu-clave-de-servicio"
```

Puedes encontrar estas claves en la sección "Settings" > "API" de tu proyecto en Supabase.

## Métodos para aplicar migraciones

Hay dos formas de aplicar las migraciones:

### 1. Usando el script para preparar migraciones combinadas (recomendado)

Hemos creado un script que combina todas las migraciones en un solo archivo y corrige problemas comunes:

```bash
# Generar el archivo de migraciones combinadas y corregidas
npm run supabase:fix
```

Este script creará un archivo `combined-migrations-fixed.sql` en la raíz del proyecto que contiene todas las migraciones en orden cronológico con las correcciones necesarias. Luego, puedes aplicar este archivo a través del SQL Editor de Supabase:

1. Accede a tu proyecto en [app.supabase.com](https://app.supabase.com)
2. Ve a la sección "SQL Editor"
3. Crea una nueva consulta
4. Copia y pega el contenido del archivo `combined-migrations-fixed.sql`
5. Ejecuta la consulta

### 2. Aplicando migraciones individualmente

Si prefieres aplicar las migraciones individualmente, puedes hacerlo a través del SQL Editor de Supabase:

1. Accede a tu proyecto en [app.supabase.com](https://app.supabase.com)
2. Ve a la sección "SQL Editor"
3. Crea una nueva consulta
4. Copia y pega el contenido de cada archivo de migración en orden cronológico
5. Ejecuta cada consulta

Los archivos de migración se encuentran en la carpeta `backend/supabase/migrations` y deben aplicarse en el siguiente orden:

1. `20240101000000_create_profiles.sql`
2. `20240102000000_update_profile_policies.sql`
3. `20240103000000_fix_profile_policies.sql`
4. `20240501000000_fix_security_issues.sql`
5. `20250401000000_create_products_categories.sql`
6. `20250402000000_create_orders_tables.sql`
7. `20250403000000_create_tables_reservations.sql`
8. `20250404000000_create_inventory.sql`
9. `20250405000000_create_storage_buckets.sql`
10. `20250406000000_create_payment_tables.sql`
11. `20250407000000_create_delivery_tracking.sql`
12. `20250408000000_create_reviews_tables.sql`

### 3. Usando el script automatizado (requiere configuración adicional)

También hemos creado un script que automatiza todo el proceso, pero requiere configuración adicional:

1. Edita el archivo `scripts/supabase-config.js` y actualiza las claves de API con las correctas.

2. Ejecuta el script:

```bash
# Instalar dependencias si es necesario
npm install @supabase/supabase-js

# Ejecutar el script de configuración
node scripts/setup-supabase.js
```

Este script realizará las siguientes acciones:
1. Verificar la conexión a Supabase
2. Aplicar todas las migraciones en orden
3. Generar los tipos TypeScript basados en el esquema
4. Verificar la configuración de seguridad

## Generación de tipos TypeScript

Después de aplicar las migraciones, es importante generar los tipos TypeScript para mantener la coherencia entre el backend y el frontend:

```bash
node scripts/generate-types.js
```

Este script generará el archivo `shared/types/database.types.ts` con las definiciones de tipos basadas en el esquema actual de la base de datos.

## Verificación de seguridad

Para verificar que la configuración de seguridad es correcta:

```bash
node scripts/check-supabase-security-simple.js
```

Si se detectan problemas, puedes aplicar las correcciones de seguridad:

```bash
node scripts/apply-security-fixes.js
```

## Solución de problemas

### Error: "Function pgexec does not exist"

Si recibes este error, significa que la función `pgexec` no está disponible en tu proyecto de Supabase. Esta función es necesaria para ejecutar SQL desde la API.

Solución: Crea la función manualmente en el SQL Editor:

```sql
CREATE OR REPLACE FUNCTION pgexec(sql text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE sql;
  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
```

### Error: "Permission denied"

Si recibes errores de permisos, asegúrate de estar utilizando la clave de servicio (`SUPABASE_SERVICE_ROLE_KEY`) y no la clave anónima.

### Error: "Relation already exists"

Si una tabla ya existe, puedes modificar el script de migración para usar `CREATE TABLE IF NOT EXISTS` o ejecutar las migraciones manualmente saltando las que ya se han aplicado.

## Recursos adicionales

- [Documentación de Supabase](https://supabase.io/docs)
- [Guía de seguridad de Supabase](docs/guia-seguridad-supabase.md)
- [Configuración para producción](docs/configuracion-produccion.md)
