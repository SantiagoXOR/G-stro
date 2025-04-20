-- Migración para crear tablas de pedidos y elementos de pedido
-- Fecha: Abril 2025

-- Crear enum para estados de pedido
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'ready', 'delivered', 'cancelled');

-- Crear tabla de pedidos
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES profiles(id),
    table_number INTEGER,
    status order_status NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de elementos de pedido
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para pedidos
CREATE POLICY "Administradores pueden ver todos los pedidos"
    ON orders FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ));

CREATE POLICY "Personal puede ver todos los pedidos"
    ON orders FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'staff'
    ));

CREATE POLICY "Clientes solo pueden ver sus propios pedidos"
    ON orders FOR SELECT
    USING (
        auth.uid() = customer_id OR
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Administradores y personal pueden crear pedidos"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('admin', 'staff')
    ));

CREATE POLICY "Clientes pueden crear sus propios pedidos"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Administradores y personal pueden actualizar pedidos"
    ON orders FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('admin', 'staff')
    ));

CREATE POLICY "Clientes solo pueden actualizar sus pedidos pendientes"
    ON orders FOR UPDATE
    USING (
        auth.uid() = customer_id AND
        status = 'pending'
    );

CREATE POLICY "Administradores pueden eliminar pedidos"
    ON orders FOR DELETE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ));

-- Políticas para elementos de pedido
CREATE POLICY "Elementos de pedido visibles para administradores"
    ON order_items FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ));

CREATE POLICY "Elementos de pedido visibles para personal"
    ON order_items FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'staff'
    ));

CREATE POLICY "Clientes solo pueden ver elementos de sus propios pedidos"
    ON order_items FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM orders WHERE customer_id = auth.uid()
        ) OR
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'staff')
        )
    );

CREATE POLICY "Administradores y personal pueden crear elementos de pedido"
    ON order_items FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('admin', 'staff')
    ));

CREATE POLICY "Clientes pueden crear elementos para sus propios pedidos pendientes"
    ON order_items FOR INSERT
    WITH CHECK (
        order_id IN (
            SELECT id FROM orders 
            WHERE customer_id = auth.uid() AND status = 'pending'
        )
    );

CREATE POLICY "Administradores y personal pueden actualizar elementos de pedido"
    ON order_items FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('admin', 'staff')
    ));

CREATE POLICY "Clientes solo pueden actualizar elementos de sus pedidos pendientes"
    ON order_items FOR UPDATE
    USING (
        order_id IN (
            SELECT id FROM orders 
            WHERE customer_id = auth.uid() AND status = 'pending'
        )
    );

CREATE POLICY "Administradores pueden eliminar elementos de pedido"
    ON order_items FOR DELETE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ));

CREATE POLICY "Personal puede eliminar elementos de pedidos pendientes"
    ON order_items FOR DELETE
    USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'staff'
        ) AND
        order_id IN (
            SELECT id FROM orders WHERE status = 'pending'
        )
    );

CREATE POLICY "Clientes pueden eliminar elementos de sus pedidos pendientes"
    ON order_items FOR DELETE
    USING (
        order_id IN (
            SELECT id FROM orders 
            WHERE customer_id = auth.uid() AND status = 'pending'
        )
    );

-- Crear índices
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Triggers para actualizar updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar el total del pedido cuando se modifican los elementos
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET total_amount = (
        SELECT COALESCE(SUM(quantity * unit_price), 0)
        FROM order_items
        WHERE order_id = NEW.order_id
    )
    WHERE id = NEW.order_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar el total del pedido
CREATE TRIGGER update_order_total_on_item_insert
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_total();

CREATE TRIGGER update_order_total_on_item_update
    AFTER UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_total();

CREATE TRIGGER update_order_total_on_item_delete
    AFTER DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_total();
