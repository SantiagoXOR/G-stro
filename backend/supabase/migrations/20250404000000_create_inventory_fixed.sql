-- Migración para crear tablas de inventario (versión corregida)
-- Fecha: Abril 2025

-- Crear enum para tipos de transacción de inventario si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_transaction_type') THEN
        CREATE TYPE inventory_transaction_type AS ENUM ('purchase', 'sale', 'adjustment', 'waste');
    END IF;
END$$;

-- Crear tabla de inventario si no existe
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    reorder_level INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de transacciones de inventario si no existe
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID REFERENCES inventory_items(id) NOT NULL,
    transaction_type inventory_transaction_type NOT NULL,
    quantity INTEGER NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS si no está habilitado
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'inventory_items'
    ) THEN
        ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'inventory_transactions'
    ) THEN
        ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
    END IF;
END$$;

-- Políticas para inventario (verificar si existen primero)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'inventory_items'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'inventory_items' AND policyname = 'Inventario visible para administradores y personal'
    ) THEN
        CREATE POLICY "Inventario visible para administradores y personal"
            ON inventory_items FOR SELECT
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role IN ('admin', 'staff')
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'inventory_items'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'inventory_items' AND policyname = 'Solo administradores pueden crear inventario'
    ) THEN
        CREATE POLICY "Solo administradores pueden crear inventario"
            ON inventory_items FOR INSERT
            WITH CHECK (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'inventory_items'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'inventory_items' AND policyname = 'Solo administradores pueden actualizar inventario'
    ) THEN
        CREATE POLICY "Solo administradores pueden actualizar inventario"
            ON inventory_items FOR UPDATE
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'inventory_items'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'inventory_items' AND policyname = 'Solo administradores pueden eliminar inventario'
    ) THEN
        CREATE POLICY "Solo administradores pueden eliminar inventario"
            ON inventory_items FOR DELETE
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
END$$;

-- Políticas para transacciones de inventario (verificar si existen primero)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'inventory_transactions'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'inventory_transactions' AND policyname = 'Transacciones visibles para administradores y personal'
    ) THEN
        CREATE POLICY "Transacciones visibles para administradores y personal"
            ON inventory_transactions FOR SELECT
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role IN ('admin', 'staff')
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'inventory_transactions'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'inventory_transactions' AND policyname = 'Administradores pueden crear transacciones'
    ) THEN
        CREATE POLICY "Administradores pueden crear transacciones"
            ON inventory_transactions FOR INSERT
            WITH CHECK (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'inventory_transactions'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'inventory_transactions' AND policyname = 'Personal puede crear transacciones'
    ) THEN
        CREATE POLICY "Personal puede crear transacciones"
            ON inventory_transactions FOR INSERT
            WITH CHECK (
                auth.uid() IN (
                    SELECT id FROM profiles WHERE role = 'staff'
                ) AND
                transaction_type IN ('sale', 'waste')
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
        WHERE schemaname = 'public' AND tablename = 'inventory_items'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_inventory_items_updated_at'
    ) THEN
        CREATE TRIGGER update_inventory_items_updated_at
            BEFORE UPDATE ON inventory_items
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Función para actualizar la cantidad en inventario cuando se registra una transacción
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_inventory_quantity'
    ) THEN
        CREATE OR REPLACE FUNCTION update_inventory_quantity()
        RETURNS TRIGGER AS $$
        DECLARE
            factor INTEGER;
        BEGIN
            -- Determinar si la transacción aumenta o disminuye el inventario
            IF NEW.transaction_type IN ('purchase', 'adjustment') AND NEW.quantity > 0 THEN
                factor := 1; -- Aumenta el inventario
            ELSE
                factor := -1; -- Disminuye el inventario
            END IF;
            
            -- Actualizar la cantidad en inventario
            UPDATE inventory_items
            SET quantity = quantity + (NEW.quantity * factor)
            WHERE id = NEW.inventory_id;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    END IF;
END$$;

-- Trigger para actualizar inventario cuando se registra una transacción
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'inventory_transactions'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_inventory_on_transaction'
    ) THEN
        CREATE TRIGGER update_inventory_on_transaction
            AFTER INSERT ON inventory_transactions
            FOR EACH ROW
            EXECUTE FUNCTION update_inventory_quantity();
    END IF;
END$$;
