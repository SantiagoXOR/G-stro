-- Migración para crear tablas de pagos (versión corregida)
-- Fecha: Abril 2025

-- Crear enum para métodos de pago si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('cash', 'credit_card', 'debit_card', 'mercadopago', 'other');
    END IF;
END$$;

-- Crear enum para estados de pago si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
    END IF;
END$$;

-- Crear tabla de métodos de pago si no existe
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    type payment_method NOT NULL,
    is_default BOOLEAN DEFAULT false,
    last_four VARCHAR(4),
    card_brand VARCHAR(50),
    expiry_date VARCHAR(7),
    cardholder_name VARCHAR(255),
    mercadopago_card_id VARCHAR(255),
    mercadopago_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de transacciones de pago si no existe
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    payment_method_id UUID REFERENCES payment_methods(id),
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    provider_transaction_id VARCHAR(255),
    provider_status VARCHAR(50),
    provider_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS si no está habilitado
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payment_methods'
    ) THEN
        ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payments'
    ) THEN
        ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
    END IF;
END$$;

-- Políticas para métodos de pago (verificar si existen primero)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payment_methods'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'payment_methods' AND policyname = 'Usuarios solo pueden ver sus propios métodos de pago'
    ) THEN
        CREATE POLICY "Usuarios solo pueden ver sus propios métodos de pago"
            ON payment_methods FOR SELECT
            USING (auth.uid() = user_id OR auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payment_methods'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'payment_methods' AND policyname = 'Usuarios solo pueden crear sus propios métodos de pago'
    ) THEN
        CREATE POLICY "Usuarios solo pueden crear sus propios métodos de pago"
            ON payment_methods FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payment_methods'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'payment_methods' AND policyname = 'Usuarios solo pueden actualizar sus propios métodos de pago'
    ) THEN
        CREATE POLICY "Usuarios solo pueden actualizar sus propios métodos de pago"
            ON payment_methods FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payment_methods'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'payment_methods' AND policyname = 'Usuarios solo pueden eliminar sus propios métodos de pago'
    ) THEN
        CREATE POLICY "Usuarios solo pueden eliminar sus propios métodos de pago"
            ON payment_methods FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END$$;

-- Políticas para pagos (verificar si existen primero)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payments'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Administradores pueden ver todos los pagos'
    ) THEN
        CREATE POLICY "Administradores pueden ver todos los pagos"
            ON payments FOR SELECT
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payments'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Personal puede ver todos los pagos'
    ) THEN
        CREATE POLICY "Personal puede ver todos los pagos"
            ON payments FOR SELECT
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'staff'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payments'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Clientes solo pueden ver sus propios pagos'
    ) THEN
        CREATE POLICY "Clientes solo pueden ver sus propios pagos"
            ON payments FOR SELECT
            USING (
                auth.uid() IN (
                    SELECT customer_id FROM orders WHERE id = order_id
                )
            );
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payments'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Administradores pueden crear pagos'
    ) THEN
        CREATE POLICY "Administradores pueden crear pagos"
            ON payments FOR INSERT
            WITH CHECK (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payments'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Personal puede crear pagos'
    ) THEN
        CREATE POLICY "Personal puede crear pagos"
            ON payments FOR INSERT
            WITH CHECK (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'staff'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payments'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Clientes pueden crear sus propios pagos'
    ) THEN
        CREATE POLICY "Clientes pueden crear sus propios pagos"
            ON payments FOR INSERT
            WITH CHECK (
                auth.uid() IN (
                    SELECT customer_id FROM orders WHERE id = order_id
                )
            );
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payments'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Administradores pueden actualizar pagos'
    ) THEN
        CREATE POLICY "Administradores pueden actualizar pagos"
            ON payments FOR UPDATE
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
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
        WHERE schemaname = 'public' AND tablename = 'payment_methods'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_payment_methods_updated_at'
    ) THEN
        CREATE TRIGGER update_payment_methods_updated_at
            BEFORE UPDATE ON payment_methods
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'payments'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_payments_updated_at'
    ) THEN
        CREATE TRIGGER update_payments_updated_at
            BEFORE UPDATE ON payments
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Actualizar la tabla de orders para incluir referencia a la transacción de pago si no existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'orders'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_id UUID REFERENCES payments(id);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'orders'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_status payment_status;
    END IF;
END$$;
