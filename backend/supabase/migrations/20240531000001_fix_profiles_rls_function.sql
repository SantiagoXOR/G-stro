-- Migración para corregir la función fix_profiles_rls
-- Fecha: Mayo 2024

-- Eliminar la función si existe para recrearla
DROP FUNCTION IF EXISTS public.fix_profiles_rls();
DROP FUNCTION IF EXISTS public.test_profiles_recursion_simple();

-- Crear función para probar recursión
CREATE OR REPLACE FUNCTION public.test_profiles_recursion_simple()
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    result text;
BEGIN
    -- Establecer un tiempo límite para detectar recursividad
    SET statement_timeout TO '5s';
    
    -- Intentar ejecutar una consulta que podría causar recursividad
    BEGIN
        SELECT 1 FROM auth.users u WHERE EXISTS (
            SELECT 1 FROM profiles p WHERE p.id = u.id
        ) LIMIT 1;
        
        -- Si llegamos aquí, no hubo recursividad
        result := 'Prueba de recursividad: PASADA - No se detectó recursividad';
    EXCEPTION
        WHEN others THEN
            -- Capturar cualquier error
            IF SQLERRM LIKE '%infinite recursion%' THEN
                result := 'Prueba de recursividad: FALLIDA - Se detectó recursividad infinita';
            ELSE
                result := 'Prueba de recursividad: FALLIDA - Error: ' || SQLERRM;
            END IF;
    END;
    
    -- Restablecer el tiempo límite
    RESET statement_timeout;
    
    RETURN result;
END;
$$;

-- Crear función para verificar si un usuario es administrador sin causar recursión
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
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

-- Crear función para reparar perfiles y verificar recursión
CREATE OR REPLACE FUNCTION public.fix_profiles_rls()
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    result text;
    rls_enabled boolean;
    policy_count int;
    recursion_test text;
BEGIN
    -- Verificar si RLS está habilitado
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'profiles';
    
    -- Contar políticas existentes
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles';
    
    -- Inicializar resultado
    result := 'Estado de RLS para profiles:' || E'\n';
    result := result || '- RLS habilitado: ' || rls_enabled::text || E'\n';
    result := result || '- Número de políticas: ' || policy_count::text || E'\n\n';
    
    -- Desactivar RLS temporalmente para evitar problemas durante la corrección
    ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    
    -- Eliminar todas las políticas existentes
    DROP POLICY IF EXISTS "Los administradores pueden actualizar cualquier perfil" ON profiles;
    DROP POLICY IF EXISTS "Perfiles visibles para todos los usuarios autenticados" ON profiles;
    DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
    DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
    DROP POLICY IF EXISTS "profiles_update_own_policy" ON profiles;
    DROP POLICY IF EXISTS "profiles_update_admin_policy" ON profiles;
    
    result := result || 'Políticas antiguas eliminadas' || E'\n\n';
    
    -- Crear nuevas políticas optimizadas
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
    
    CREATE POLICY "profiles_update_admin_policy"
    ON profiles FOR UPDATE
    TO authenticated
    USING (is_admin(auth.uid()));
    
    result := result || 'Políticas RLS creadas correctamente' || E'\n';
    
    -- Activar RLS nuevamente
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    result := result || 'RLS habilitado nuevamente' || E'\n\n';
    
    -- Probar si hay recursividad después de los cambios
    SELECT test_profiles_recursion_simple() INTO recursion_test;
    
    result := result || recursion_test;
    
    RETURN result;
END;
$$;

-- Ejecutar la función para verificar y reparar
SELECT test_profiles_recursion_simple();
