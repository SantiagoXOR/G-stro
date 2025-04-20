-- Migración para crear tablas de productos y categorías
-- Fecha: Abril 2025

-- Crear tabla de categorías
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla de productos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id UUID REFERENCES categories(id),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    alcohol_percentage DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas para categorías
CREATE POLICY "Categorías visibles para todos"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Solo administradores pueden crear categorías"
    ON categories FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ));

CREATE POLICY "Solo administradores pueden actualizar categorías"
    ON categories FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ));

CREATE POLICY "Solo administradores pueden eliminar categorías"
    ON categories FOR DELETE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ));

-- Políticas para productos
CREATE POLICY "Productos visibles para todos"
    ON products FOR SELECT
    USING (true);

CREATE POLICY "Solo administradores pueden crear productos"
    ON products FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ));

CREATE POLICY "Solo administradores pueden actualizar productos"
    ON products FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ));

CREATE POLICY "Solo administradores pueden eliminar productos"
    ON products FOR DELETE
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    ));

-- Crear índices
CREATE INDEX idx_products_category_id ON products(category_id);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunas categorías de ejemplo
INSERT INTO categories (name, description, image_url)
VALUES 
    ('Cocteles', 'Bebidas mezcladas con alcohol', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500'),
    ('Cervezas', 'Cervezas nacionales e importadas', 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=500'),
    ('Vinos', 'Selección de vinos tintos y blancos', 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500'),
    ('Sin Alcohol', 'Bebidas sin contenido alcohólico', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500'),
    ('Licores', 'Licores y destilados', 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=500');
