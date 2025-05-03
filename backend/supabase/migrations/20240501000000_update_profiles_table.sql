-- Migración para actualizar la tabla de perfiles
-- Esta migración verifica si la tabla profiles existe y la actualiza si es necesario

-- Verificar si existe el tipo user_role, si no, crearlo
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
    END IF;
END $$;

-- Verificar si existe la tabla profiles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        -- Crear la tabla profiles si no existe
        CREATE TABLE profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            name TEXT,
            role user_role NOT NULL DEFAULT 'customer'::user_role,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        
        -- Habilitar RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- Crear políticas
        CREATE POLICY "Perfiles visibles para todos los usuarios autenticados"
            ON profiles FOR SELECT
            TO authenticated
            USING (true);
            
        CREATE POLICY "Los usuarios pueden insertar su propio perfil"
            ON profiles FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = id);
            
        CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
            ON profiles FOR UPDATE
            TO authenticated
            USING (auth.uid() = id);
            
        -- Crear función para manejar nuevos usuarios
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS TRIGGER
        SECURITY DEFINER
        SET search_path = public
        LANGUAGE plpgsql
        AS $$
        BEGIN
            INSERT INTO public.profiles (id, email, name, role)
            VALUES (
                NEW.id,
                NEW.email,
                COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Usuario'),
                COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
            );
            RETURN NEW;
        EXCEPTION
            WHEN others THEN
                RAISE LOG 'Error en handle_new_user: %', SQLERRM;
                RETURN NEW;
        END;
        $$;
        
        -- Crear trigger
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION handle_new_user();
    ELSE
        -- La tabla ya existe, verificar y añadir columnas si es necesario
        
        -- Verificar si existe la columna name
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'name'
        ) THEN
            ALTER TABLE profiles ADD COLUMN name TEXT;
        END IF;
        
        -- Verificar si existe la columna role
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'role'
        ) THEN
            ALTER TABLE profiles ADD COLUMN role user_role NOT NULL DEFAULT 'customer'::user_role;
        END IF;
        
        -- Actualizar la función handle_new_user si es necesario
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS TRIGGER
        SECURITY DEFINER
        SET search_path = public
        LANGUAGE plpgsql
        AS $$
        BEGIN
            INSERT INTO public.profiles (id, email, name, role)
            VALUES (
                NEW.id,
                NEW.email,
                COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Usuario'),
                COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
            );
            RETURN NEW;
        EXCEPTION
            WHEN others THEN
                RAISE LOG 'Error en handle_new_user: %', SQLERRM;
                RETURN NEW;
        END;
        $$;
    END IF;
END $$;
