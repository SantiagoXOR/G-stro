-- Migración para crear tablas de seguimiento de entregas (versión corregida)
-- Fecha: Abril 2025

-- Crear enum para estados de entrega si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_status') THEN
        CREATE TYPE delivery_status AS ENUM ('pending', 'preparing', 'in_transit', 'delivered', 'failed');
    END IF;
END$$;

-- Crear tabla para repartidores si no existe
CREATE TABLE IF NOT EXISTS delivery_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    vehicle_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla para seguimiento de entregas si no existe
CREATE TABLE IF NOT EXISTS delivery_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    driver_id UUID REFERENCES delivery_drivers(id),
    status delivery_status NOT NULL DEFAULT 'pending',
    current_location JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla para estimaciones de entrega si no existe
CREATE TABLE IF NOT EXISTS delivery_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    estimated_pickup_time TIMESTAMP WITH TIME ZONE,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_pickup_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    distance_meters INTEGER,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS si no está habilitado
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers'
    ) THEN
        ALTER TABLE delivery_drivers ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking'
    ) THEN
        ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_estimates'
    ) THEN
        ALTER TABLE delivery_estimates ENABLE ROW LEVEL SECURITY;
    END IF;
END$$;

-- Políticas para repartidores (verificar si existen primero)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers' AND policyname = 'Administradores pueden ver todos los repartidores'
    ) THEN
        CREATE POLICY "Administradores pueden ver todos los repartidores"
            ON delivery_drivers FOR SELECT
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers' AND policyname = 'Personal puede ver todos los repartidores'
    ) THEN
        CREATE POLICY "Personal puede ver todos los repartidores"
            ON delivery_drivers FOR SELECT
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'staff'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers' AND policyname = 'Repartidores pueden ver su propio perfil'
    ) THEN
        CREATE POLICY "Repartidores pueden ver su propio perfil"
            ON delivery_drivers FOR SELECT
            USING (auth.uid() = user_id);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers' AND policyname = 'Administradores pueden crear repartidores'
    ) THEN
        CREATE POLICY "Administradores pueden crear repartidores"
            ON delivery_drivers FOR INSERT
            WITH CHECK (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers' AND policyname = 'Administradores pueden actualizar repartidores'
    ) THEN
        CREATE POLICY "Administradores pueden actualizar repartidores"
            ON delivery_drivers FOR UPDATE
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers' AND policyname = 'Repartidores pueden actualizar su propio perfil'
    ) THEN
        CREATE POLICY "Repartidores pueden actualizar su propio perfil"
            ON delivery_drivers FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
END$$;

-- Políticas para seguimiento de entregas (verificar si existen primero)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking' AND policyname = 'Administradores pueden ver todo el seguimiento'
    ) THEN
        CREATE POLICY "Administradores pueden ver todo el seguimiento"
            ON delivery_tracking FOR SELECT
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking' AND policyname = 'Personal puede ver todo el seguimiento'
    ) THEN
        CREATE POLICY "Personal puede ver todo el seguimiento"
            ON delivery_tracking FOR SELECT
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'staff'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking' AND policyname = 'Clientes pueden ver el seguimiento de sus pedidos'
    ) THEN
        CREATE POLICY "Clientes pueden ver el seguimiento de sus pedidos"
            ON delivery_tracking FOR SELECT
            USING (
                auth.uid() IN (
                    SELECT customer_id FROM orders WHERE id = order_id
                )
            );
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking' AND policyname = 'Repartidores pueden ver el seguimiento de sus entregas'
    ) THEN
        CREATE POLICY "Repartidores pueden ver el seguimiento de sus entregas"
            ON delivery_tracking FOR SELECT
            USING (
                auth.uid() IN (
                    SELECT user_id FROM delivery_drivers WHERE id = driver_id
                )
            );
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking' AND policyname = 'Administradores pueden crear seguimiento'
    ) THEN
        CREATE POLICY "Administradores pueden crear seguimiento"
            ON delivery_tracking FOR INSERT
            WITH CHECK (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking' AND policyname = 'Personal puede crear seguimiento'
    ) THEN
        CREATE POLICY "Personal puede crear seguimiento"
            ON delivery_tracking FOR INSERT
            WITH CHECK (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'staff'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking' AND policyname = 'Administradores pueden actualizar seguimiento'
    ) THEN
        CREATE POLICY "Administradores pueden actualizar seguimiento"
            ON delivery_tracking FOR UPDATE
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking' AND policyname = 'Personal puede actualizar seguimiento'
    ) THEN
        CREATE POLICY "Personal puede actualizar seguimiento"
            ON delivery_tracking FOR UPDATE
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'staff'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking' AND policyname = 'Repartidores pueden actualizar el seguimiento de sus entregas'
    ) THEN
        CREATE POLICY "Repartidores pueden actualizar el seguimiento de sus entregas"
            ON delivery_tracking FOR UPDATE
            USING (
                auth.uid() IN (
                    SELECT user_id FROM delivery_drivers WHERE id = driver_id
                )
            );
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
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_drivers'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_delivery_drivers_updated_at'
    ) THEN
        CREATE TRIGGER update_delivery_drivers_updated_at
            BEFORE UPDATE ON delivery_drivers
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_tracking'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_delivery_tracking_updated_at'
    ) THEN
        CREATE TRIGGER update_delivery_tracking_updated_at
            BEFORE UPDATE ON delivery_tracking
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'delivery_estimates'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_delivery_estimates_updated_at'
    ) THEN
        CREATE TRIGGER update_delivery_estimates_updated_at
            BEFORE UPDATE ON delivery_estimates
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;
