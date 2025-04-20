-- Migración simplificada para crear tablas de mesas y reservas
-- Fecha: Abril 2025

-- Crear enum para estados de mesa si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'table_status') THEN
        CREATE TYPE table_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');
    END IF;
END$$;

-- Crear enum para estados de reserva si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
        CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
    END IF;
END$$;

-- Crear tabla de mesas si no existe
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_number INTEGER NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    status table_status NOT NULL DEFAULT 'available',
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de reservas si no existe
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES profiles(id),
    table_id UUID REFERENCES tables(id) NOT NULL,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    party_size INTEGER NOT NULL,
    status reservation_status NOT NULL DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Políticas para mesas (verificar si existen primero)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'tables' AND policyname = 'Mesas visibles para todos'
    ) THEN
        EXECUTE 'CREATE POLICY "Mesas visibles para todos" ON tables FOR SELECT USING (true)';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'tables' AND policyname = 'Solo administradores pueden crear mesas'
    ) THEN
        EXECUTE 'CREATE POLICY "Solo administradores pueden crear mesas" ON tables FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = ''admin''))';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'tables' AND policyname = 'Solo administradores pueden actualizar mesas'
    ) THEN
        EXECUTE 'CREATE POLICY "Solo administradores pueden actualizar mesas" ON tables FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = ''admin''))';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'tables' AND policyname = 'Solo administradores pueden eliminar mesas'
    ) THEN
        EXECUTE 'CREATE POLICY "Solo administradores pueden eliminar mesas" ON tables FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = ''admin''))';
    END IF;
END$$;

-- Políticas para reservas (verificar si existen primero)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'reservations' AND policyname = 'Administradores pueden ver todas las reservas'
    ) THEN
        EXECUTE 'CREATE POLICY "Administradores pueden ver todas las reservas" ON reservations FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = ''admin''))';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'reservations' AND policyname = 'Personal puede ver todas las reservas'
    ) THEN
        EXECUTE 'CREATE POLICY "Personal puede ver todas las reservas" ON reservations FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = ''staff''))';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'reservations' AND policyname = 'Clientes solo pueden ver sus propias reservas'
    ) THEN
        EXECUTE 'CREATE POLICY "Clientes solo pueden ver sus propias reservas" ON reservations FOR SELECT USING (auth.uid() = customer_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN (''admin'', ''staff'')))';
    END IF;
END$$;

-- Crear índices si no existen
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = 'tables' AND indexname = 'idx_tables_status'
    ) THEN
        CREATE INDEX idx_tables_status ON tables(status);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = 'reservations' AND indexname = 'idx_reservations_date'
    ) THEN
        CREATE INDEX idx_reservations_date ON reservations(reservation_date);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = 'reservations' AND indexname = 'idx_reservations_customer_id'
    ) THEN
        CREATE INDEX idx_reservations_customer_id ON reservations(customer_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = 'reservations' AND indexname = 'idx_reservations_table_id'
    ) THEN
        CREATE INDEX idx_reservations_table_id ON reservations(table_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = 'reservations' AND indexname = 'idx_reservations_status'
    ) THEN
        CREATE INDEX idx_reservations_status ON reservations(status);
    END IF;
END$$;

-- Verificar si la función update_updated_at_column existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_updated_at_column'
    ) THEN
        -- Crear función para actualizar updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = TIMEZONE('utc'::text, NOW());
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    END IF;
END$$;

-- Triggers para actualizar updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_tables_updated_at'
    ) THEN
        CREATE TRIGGER update_tables_updated_at
            BEFORE UPDATE ON tables
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_reservations_updated_at'
    ) THEN
        CREATE TRIGGER update_reservations_updated_at
            BEFORE UPDATE ON reservations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Insertar algunas mesas de ejemplo si la tabla está vacía
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'tables'
    ) AND NOT EXISTS (
        SELECT 1 FROM tables
        LIMIT 1
    ) THEN
        INSERT INTO tables (table_number, capacity, location)
        VALUES 
            (1, 2, 'Ventana'),
            (2, 2, 'Ventana'),
            (3, 4, 'Centro'),
            (4, 4, 'Centro'),
            (5, 6, 'Terraza'),
            (6, 8, 'Salón privado');
    END IF;
END$$;
