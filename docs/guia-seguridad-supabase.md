# Guía para resolver problemas de seguridad en Supabase

Esta guía te ayudará a resolver los problemas de seguridad detectados por el Security Advisor de Supabase en el proyecto Slainte Bar QR.

## Problemas detectados

El Security Advisor ha identificado los siguientes problemas:

1. **Funciones sin parámetro `search_path` configurado**:
   - `public.handle_new_user`
   - `public.update_updated_at_column`
   - `public.make_user_admin`
   - `public.reorder_category`

2. **RLS (Row Level Security) habilitado sin políticas** en:
   - `public.categories`
   - `public.products`

3. **Problemas de autenticación**:
   - OTP con expiración larga
   - Protección de contraseñas filtradas deshabilitada

## Solución

Hemos creado dos archivos para ayudarte a resolver estos problemas:

1. **Migración SQL**: `backend/supabase/migrations/20240501000000_fix_security_issues.sql`
   - Corrige las funciones sin `search_path` configurado
   - Verifica y crea políticas RLS para las tablas `categories` y `products`

2. **Script de aplicación**: `scripts/apply-security-fixes.js`
   - Ejecuta la migración SQL en tu base de datos Supabase
   - Proporciona instrucciones para configurar los ajustes de autenticación

## Pasos para aplicar las correcciones

### 1. Verificar los problemas actuales

Ejecuta el script de verificación simplificado para ver el estado actual de la seguridad:

```bash
# Instalar dependencias si es necesario
npm install @supabase/supabase-js

# Ejecutar el script de verificación
node scripts/check-supabase-security-simple.js
```

### 2. Aplicar las correcciones manualmente

Debido a las limitaciones de la API de Supabase, necesitamos aplicar las correcciones manualmente:

```bash
# Generar instrucciones para aplicar las correcciones
node scripts/apply-security-fixes-manual.js
```

Este script mostrará instrucciones detalladas para:

1. Copiar el SQL necesario para corregir las funciones
2. Aplicar este SQL a través del SQL Editor de Supabase

### 3. Configurar ajustes de autenticación en Supabase

Estos ajustes deben configurarse manualmente en la interfaz de Supabase:

1. Accede a [Supabase](https://app.supabase.com) y selecciona tu proyecto
2. Ve a Authentication > Settings > Security
3. Configura "OTP expiry time" a un valor recomendado (5-10 minutos)
4. Habilita "Enable leaked password protection"
5. Guarda los cambios

## Verificación

Después de aplicar todas las correcciones:

1. Actualiza la página del Security Advisor en Supabase
2. Verifica que las advertencias hayan desaparecido
3. Si alguna advertencia persiste, revisa el mensaje específico y ajusta la configuración según sea necesario

## Explicación técnica

### ¿Por qué es importante configurar `search_path`?

El parámetro `search_path` en funciones SQL define el orden en que PostgreSQL busca objetos (tablas, vistas, etc.) en los esquemas. Si no se configura correctamente, puede permitir ataques de inyección SQL donde un atacante podría manipular el `search_path` para acceder a objetos no autorizados.

### ¿Por qué es importante el RLS?

Row Level Security (RLS) permite controlar qué filas pueden ser leídas, insertadas, actualizadas o eliminadas por diferentes usuarios. Sin políticas RLS adecuadas, todos los usuarios con acceso a una tabla podrían ver o modificar todos los datos, lo que compromete la seguridad y privacidad.

### ¿Por qué son importantes los ajustes de autenticación?

- **OTP expiry time**: Un tiempo de expiración largo para los códigos OTP aumenta la ventana de oportunidad para ataques de fuerza bruta.
- **Leaked password protection**: Esta función verifica si las contraseñas han sido comprometidas en filtraciones de datos conocidas, evitando que los usuarios utilicen contraseñas inseguras.

## Recursos adicionales

- [Documentación de seguridad de Supabase](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Guía de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Mejores prácticas de seguridad en PostgreSQL](https://supabase.com/docs/guides/database/postgres/security)
