-- Migración para corregir el problema de recursión infinita en las políticas RLS de la tabla profiles (segundo intento)
-- Fecha: Mayo 2024

-- Primero, desactivar RLS temporalmente para evitar problemas durante la corrección
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes para la tabla profiles (incluyendo las nuevas que pudieron haber sido creadas parcialmente)
DROP POLICY IF EXISTS "Enable read access for all" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;
DROP POLICY IF EXISTS "Enable update for users and service_role" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile and admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios perfiles" ON profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios perfiles" ON profiles;
DROP POLICY IF EXISTS "El personal puede ver todos los perfiles" ON profiles;
DROP POLICY IF EXISTS "Los administradores pueden actualizar cualquier perfil" ON profiles;
DROP POLICY IF EXISTS "Perfiles visibles para todos los usuarios autenticados" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin_policy" ON profiles;

-- Eliminar funciones existentes que vamos a recrear
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS fix_profiles_rls();
DROP FUNCTION IF EXISTS test_profiles_recursion_simple();
DROP FUNCTION IF EXISTS repair_profiles_advanced();

-- Crear nuevas políticas sin recursión
-- 1. Política de lectura: todos los usuarios autenticados pueden ver todos los perfiles
CREATE POLICY "profiles_select_policy" 
    ON profiles FOR SELECT 
    TO authenticated 
    USING (true);

-- 2. Política de inserción: solo el rol de servicio puede insertar perfiles
CREATE POLICY "profiles_insert_policy" 
    ON profiles FOR INSERT 
    TO service_role 
    WITH CHECK (true);

-- 3. Política de actualización: los usuarios pueden actualizar su propio perfil
CREATE POLICY "profiles_update_own_policy" 
    ON profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id);

-- 4. Política de actualización para administradores: usando una función para evitar recursión
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

-- Crear política para que los administradores puedan actualizar cualquier perfil
CREATE POLICY "profiles_update_admin_policy" 
    ON profiles FOR UPDATE 
    TO authenticated 
    USING (is_admin(auth.uid()));

-- Volver a habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Crear función para reparar perfiles y verificar recursión
CREATE OR REPLACE FUNCTION fix_profiles_rls()
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    result text;
    rls_enabled boolean;
    policy_count int;
    recursion_test boolean;
BEGIN
    -- Verificar si RLS está habilitado
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'profiles';
    
    -- Contar políticas existentes
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles';
    
    -- Construir resultado
    result := 'Estado de RLS para profiles:' || E'\n';
    result := result || '- RLS habilitado: ' || rls_enabled::text || E'\n';
    result := result || '- Número de políticas: ' || policy_count::text || E'\n';
    
    -- Probar si hay recursividad
    BEGIN
        -- Establecer un tiempo límite para detectar recursividad
        SET LOCAL statement_timeout = '1s';
        
        -- Intentar una consulta simple
        PERFORM COUNT(*) FROM profiles LIMIT 1;
        
        recursion_test := true;
        result := result || '- Prueba de recursividad: PASADA' || E'\n';
    EXCEPTION
        WHEN others THEN
            recursion_test := false;
            result := result || '- Prueba de recursividad: FALLIDA - ' || SQLERRM || E'\n';
    END;
    
    -- Restablecer el tiempo límite
    RESET statement_timeout;
    
    -- Si la prueba falló, intentar reparar
    IF NOT recursion_test THEN
        -- Desactivar RLS temporalmente
        ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
        
        -- Eliminar todas las políticas
        FOR result IN 
            SELECT 'DROP POLICY IF EXISTS "' || policyname || '" ON profiles;'
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = 'profiles'
        LOOP
            EXECUTE result;
        END LOOP;
        
        -- Crear políticas básicas
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
        
        -- Volver a habilitar RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        result := result || '- Reparación aplicada: políticas recreadas' || E'\n';
        
        -- Verificar nuevamente
        BEGIN
            SET LOCAL statement_timeout = '1s';
            PERFORM COUNT(*) FROM profiles LIMIT 1;
            result := result || '- Prueba después de reparación: PASADA' || E'\n';
        EXCEPTION
            WHEN others THEN
                result := result || '- Prueba después de reparación: FALLIDA - ' || SQLERRM || E'\n';
        END;
        
        RESET statement_timeout;
    END IF;
    
    RETURN result;
END;
$$;

-- Crear función para probar si hay recursividad
CREATE OR REPLACE FUNCTION test_profiles_recursion_simple()
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    result text;
BEGIN
    -- Establecer un tiempo límite para detectar recursividad
    SET LOCAL statement_timeout = '1s';
    
    BEGIN
        -- Intentar una consulta simple
        PERFORM COUNT(*) FROM profiles LIMIT 1;
        
        result := 'Prueba de recursividad: PASADA - No se detectó recursividad';
    EXCEPTION
        WHEN others THEN
            result := 'Prueba de recursividad: FALLIDA - ' || SQLERRM;
    END;
    
    -- Restablecer el tiempo límite
    RESET statement_timeout;
    
    RETURN result;
END;
$$;

-- Crear función para reparar perfiles avanzada
CREATE OR REPLACE FUNCTION repair_profiles_advanced()
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    result text;
    missing_profiles int;
    orphaned_profiles int;
    fixed_profiles int;
    rls_status text;
BEGIN
    -- Inicializar resultado
    result := 'Diagnóstico de perfiles:' || E'\n';
    
    -- 1. Verificar usuarios sin perfil
    SELECT COUNT(*) INTO missing_profiles
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    WHERE p.id IS NULL;
    
    result := result || '- Usuarios sin perfil: ' || missing_profiles::text || E'\n';
    
    -- 2. Verificar perfiles huérfanos (sin usuario correspondiente)
    SELECT COUNT(*) INTO orphaned_profiles
    FROM profiles p
    LEFT JOIN auth.users u ON p.id = u.id
    WHERE u.id IS NULL;
    
    result := result || '- Perfiles huérfanos: ' || orphaned_profiles::text || E'\n';
    
    -- 3. Crear perfiles para usuarios que no los tienen
    fixed_profiles := 0;
    
    IF missing_profiles > 0 THEN
        INSERT INTO profiles (id, email, name, role, created_at, updated_at)
        SELECT 
            u.id, 
            u.email, 
            COALESCE(u.raw_user_meta_data->>'name', 'Anonymous'), 
            COALESCE((u.raw_user_meta_data->>'role')::user_role, 'customer'::user_role),
            NOW(),
            NOW()
        FROM auth.users u
        LEFT JOIN profiles p ON u.id = p.id
        WHERE p.id IS NULL;
        
        GET DIAGNOSTICS fixed_profiles = ROW_COUNT;
        result := result || '- Perfiles creados: ' || fixed_profiles::text || E'\n';
    END IF;
    
    -- 4. Eliminar perfiles huérfanos
    IF orphaned_profiles > 0 THEN
        DELETE FROM profiles p
        WHERE NOT EXISTS (
            SELECT 1 FROM auth.users u WHERE u.id = p.id
        );
        
        GET DIAGNOSTICS fixed_profiles = ROW_COUNT;
        result := result || '- Perfiles huérfanos eliminados: ' || fixed_profiles::text || E'\n';
    END IF;
    
    -- 5. Verificar estado de RLS
    SELECT fix_profiles_rls() INTO rls_status;
    
    result := result || E'\n' || 'Estado de RLS:' || E'\n' || rls_status;
    
    RETURN result;
END;
$$;

-- Ejecutar la función para verificar y reparar
SELECT test_profiles_recursion_simple();
