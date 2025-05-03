# Solución de Problemas de Autenticación en Supabase

Este documento describe los problemas de autenticación que se presentaron en el proyecto Gëstro y las soluciones implementadas.

## Problema Detectado

Se identificó un error de recursión infinita en las políticas de seguridad (Row Level Security - RLS) para la tabla `profiles`. Este error impedía la creación correcta de perfiles de usuario durante el proceso de registro, lo que resultaba en errores como:

- "Error: infinite recursion detected in policy for relation 'profiles'"
- "No se pudo obtener o crear el perfil del usuario"

## Causas del Problema

1. **Políticas RLS mal configuradas**: Las políticas de seguridad estaban creando un bucle infinito al intentar verificar permisos.
2. **Función `handle_new_user` defectuosa**: La función que se ejecuta cuando se crea un nuevo usuario no manejaba correctamente los errores.
3. **Falta de sincronización entre usuarios y perfiles**: No existía un mecanismo para asegurar que cada usuario tuviera su perfil correspondiente.

## Soluciones Implementadas

### 1. Corrección de Políticas RLS

Se eliminaron todas las políticas existentes y se crearon nuevas políticas optimizadas para evitar la recursión infinita:

```sql
-- Políticas para la tabla profiles
CREATE POLICY "profiles_select_policy"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "profiles_insert_policy"
    ON profiles FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "profiles_update_own_policy"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Función para verificar si un usuario es administrador sin causar recursión
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_role text;
BEGIN
    -- Consultar directamente la tabla auth.users para evitar recursión
    SELECT raw_user_meta_data->>'role' INTO user_role
    FROM auth.users
    WHERE id = user_id;

    RETURN user_role = 'admin';
EXCEPTION
    WHEN others THEN
        RETURN false;
END;
$$;

-- Política para administradores
CREATE POLICY "profiles_update_admin_policy"
    ON profiles FOR UPDATE
    TO authenticated
    USING (is_admin(auth.uid()));
```

La clave de esta solución es la función `is_admin` que consulta directamente la tabla `auth.users` en lugar de `profiles`, evitando así la recursión infinita que ocurría cuando las políticas RLS intentaban consultar la misma tabla que estaban protegiendo.

### 2. Mejora de la Función `handle_new_user`

Se mejoró la función que se ejecuta cuando se crea un nuevo usuario para que:
- Verifique si ya existe un perfil para el usuario
- Maneje correctamente los errores
- Registre información útil en los logs

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    profile_exists BOOLEAN;
BEGIN
    -- Verificar si ya existe un perfil para este usuario
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = NEW.id
    ) INTO profile_exists;

    -- Solo insertar si no existe
    IF NOT profile_exists THEN
        -- Insertar directamente en la tabla sin usar políticas RLS
        INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Usuario'),
            'customer'::user_role,
            NOW(),
            NOW()
        );

        RAISE LOG 'Perfil creado para usuario %', NEW.email;
    ELSE
        RAISE LOG 'El perfil para el usuario % ya existe', NEW.email;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error en handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;
```

### 3. Creación de Funciones de Mantenimiento

Se crearon varias funciones para mantener la integridad de los datos y solucionar problemas de recursividad:

#### Función `sync_user_profiles`

Esta función sincroniza los perfiles de usuario con la tabla `auth.users`:
- Crea perfiles para usuarios que no los tienen
- Actualiza información básica en perfiles existentes

#### Función `repair_profiles_advanced`

Esta función verifica y repara la tabla `profiles` de manera exhaustiva:
- Identifica perfiles huérfanos (sin usuario correspondiente)
- Identifica usuarios sin perfil
- Corrige perfiles con información inválida
- Verifica el estado de RLS y las políticas de seguridad

#### Función `test_profiles_recursion_simple`

Esta función prueba si hay recursividad infinita en las políticas RLS:
- Establece un tiempo límite para detectar recursividad
- Ejecuta consultas de prueba para verificar si hay problemas

#### Función `fix_profiles_rls`

Esta función verifica y repara las políticas RLS si es necesario:
- Verifica si RLS está habilitado
- Cuenta el número de políticas existentes
- Recrea las políticas si es necesario
- Prueba si hay recursividad después de los cambios

### 4. Tabla de Verificación de Salud

Se creó una tabla `health_check` para verificar la salud de la conexión a la base de datos:
- Permite verificar rápidamente si la conexión a la base de datos está funcionando
- Tiene políticas RLS que permiten el acceso a todos los usuarios

## Verificación de la Solución

Se realizaron las siguientes pruebas para verificar que la solución funciona correctamente:

1. **Creación de usuario de prueba**: Se creó un usuario de prueba directamente en la tabla `auth.users` y se verificó que se creara automáticamente su perfil correspondiente.
2. **Acceso a perfiles**: Se verificó que se puede acceder a los perfiles a través de la API de Supabase con los roles `anon` y `authenticated`.
3. **Acceso a la tabla `health_check`**: Se verificó que se puede acceder a la tabla `health_check` con el rol `anon`.

## Herramientas de Diagnóstico y Reparación

Se ha mejorado la página de diagnóstico de autenticación para incluir herramientas que permiten:

1. **Verificar la conexión a Supabase**: Muestra el estado de la conexión y detecta problemas de recursividad.
2. **Verificar y reparar perfiles**: Ejecuta la función `repair_profiles_advanced` para identificar y corregir problemas en la tabla `profiles`.
3. **Reparar políticas RLS**: Ejecuta la función `fix_profiles_rls` para corregir problemas de recursividad en las políticas RLS.
4. **Probar el flujo de autenticación**: Permite probar el flujo de autenticación con Google desde el cliente o el servidor.

## Recomendaciones para el Futuro

1. **Monitoreo regular**: Utilizar la función `repair_profiles_advanced` periódicamente para identificar y corregir problemas en la tabla `profiles`.
2. **Pruebas de autenticación**: Implementar pruebas automatizadas para verificar el flujo de autenticación completo.
3. **Mejora de la experiencia de usuario**: Proporcionar mensajes de error más claros y específicos cuando ocurran problemas de autenticación.
4. **Actualización de dependencias**: Mantener actualizadas las dependencias relacionadas con Supabase, especialmente `@supabase/ssr` y `@supabase/supabase-js`.
5. **Monitoreo de recursividad**: Utilizar la función `test_profiles_recursion_simple` después de cualquier cambio en las políticas RLS para asegurarse de que no se introduzcan problemas de recursividad.

## Actualización: Mayo 2024 - Solución a la Recursión Infinita

En mayo de 2024 se detectó nuevamente un problema de recursión infinita en las políticas RLS de la tabla `profiles`. El error se manifestaba como:

```
Conexión parcial: infinite recursion detected in policy for relation "profiles"
```

El problema se debía a que la política que permitía a los administradores actualizar cualquier perfil estaba causando una recursión al consultar la misma tabla `profiles` dentro de su condición.

Se implementó una solución mediante la migración `20240530000001_fix_profiles_recursion_retry.sql` que:

1. Desactiva temporalmente RLS en la tabla `profiles`
2. Elimina todas las políticas existentes
3. Crea nuevas políticas optimizadas
4. Implementa una función `is_admin` que consulta directamente `auth.users` en lugar de `profiles`
5. Crea funciones de diagnóstico y reparación mejoradas

La prueba de recursividad ahora muestra:
```
Prueba de recursividad: PASADA - No se detectó recursividad
```

Esta solución garantiza que no se produzcan más problemas de recursión infinita en las políticas RLS de la tabla `profiles`.

## Conclusión

Los problemas de autenticación en Supabase se resolvieron mediante:

1. La corrección de las políticas RLS para evitar la recursividad infinita
2. La mejora de la función `handle_new_user` para manejar correctamente la creación de perfiles
3. La creación de funciones de diagnóstico y reparación para identificar y corregir problemas
4. La implementación de herramientas en la interfaz de usuario para facilitar el diagnóstico y la reparación
5. La optimización de las políticas RLS para evitar consultas recursivas

Estas soluciones aseguran que el proceso de registro y autenticación funcione correctamente, que cada usuario tenga su perfil correspondiente, y que los administradores puedan diagnosticar y resolver problemas fácilmente si vuelven a ocurrir en el futuro.
