-- Migración para corregir la función test_profiles_recursion_simple
-- Fecha: Mayo 2024

-- Eliminar la función si existe para recrearla
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
    test_result int;
BEGIN
    -- Establecer un tiempo límite para detectar recursividad
    SET statement_timeout TO '5s';
    
    -- Intentar ejecutar una consulta que podría causar recursividad
    BEGIN
        SELECT COUNT(*) INTO test_result FROM auth.users u WHERE EXISTS (
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

-- Ejecutar la función para verificar
SELECT test_profiles_recursion_simple();
