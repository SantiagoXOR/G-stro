-- Migración para crear tablas de reseñas (versión corregida)
-- Fecha: Abril 2025

-- Crear tabla para reseñas si no existe
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    product_id UUID REFERENCES products(id),
    order_id UUID REFERENCES orders(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[],
    is_verified BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear tabla para reacciones a reseñas si no existe
CREATE TABLE IF NOT EXISTS review_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(review_id, user_id)
);

-- Habilitar RLS si no está habilitado
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'reviews'
    ) THEN
        ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'review_reactions'
    ) THEN
        ALTER TABLE review_reactions ENABLE ROW LEVEL SECURITY;
    END IF;
END$$;

-- Políticas para reseñas (verificar si existen primero)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'reviews'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Los usuarios pueden ver todas las reseñas publicadas'
    ) THEN
        CREATE POLICY "Los usuarios pueden ver todas las reseñas publicadas"
            ON reviews FOR SELECT
            USING (is_published = true);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'reviews'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Los usuarios pueden crear sus propias reseñas'
    ) THEN
        CREATE POLICY "Los usuarios pueden crear sus propias reseñas"
            ON reviews FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'reviews'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Los usuarios pueden actualizar sus propias reseñas'
    ) THEN
        CREATE POLICY "Los usuarios pueden actualizar sus propias reseñas"
            ON reviews FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'reviews'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Los administradores pueden actualizar cualquier reseña'
    ) THEN
        CREATE POLICY "Los administradores pueden actualizar cualquier reseña"
            ON reviews FOR UPDATE
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'reviews'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Los usuarios pueden eliminar sus propias reseñas'
    ) THEN
        CREATE POLICY "Los usuarios pueden eliminar sus propias reseñas"
            ON reviews FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'reviews'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Los administradores pueden eliminar cualquier reseña'
    ) THEN
        CREATE POLICY "Los administradores pueden eliminar cualquier reseña"
            ON reviews FOR DELETE
            USING (auth.uid() IN (
                SELECT id FROM profiles WHERE role = 'admin'
            ));
    END IF;
END$$;

-- Políticas para reacciones a reseñas (verificar si existen primero)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'review_reactions'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'review_reactions' AND policyname = 'Los usuarios pueden ver todas las reacciones'
    ) THEN
        CREATE POLICY "Los usuarios pueden ver todas las reacciones"
            ON review_reactions FOR SELECT
            USING (true);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'review_reactions'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'review_reactions' AND policyname = 'Los usuarios pueden crear sus propias reacciones'
    ) THEN
        CREATE POLICY "Los usuarios pueden crear sus propias reacciones"
            ON review_reactions FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'review_reactions'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'review_reactions' AND policyname = 'Los usuarios pueden eliminar sus propias reacciones'
    ) THEN
        CREATE POLICY "Los usuarios pueden eliminar sus propias reacciones"
            ON review_reactions FOR DELETE
            USING (auth.uid() = user_id);
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
        WHERE schemaname = 'public' AND tablename = 'reviews'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_reviews_updated_at'
    ) THEN
        CREATE TRIGGER update_reviews_updated_at
            BEFORE UPDATE ON reviews
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;
