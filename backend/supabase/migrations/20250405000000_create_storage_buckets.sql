-- Migración para crear buckets de almacenamiento
-- Fecha: Abril 2025

-- Crear bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'Imágenes de Productos', true)
ON CONFLICT (id) DO NOTHING;

-- Crear bucket para imágenes de categorías
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'Imágenes de Categorías', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para bucket de imágenes de productos

-- Política para lectura pública
CREATE POLICY "Imágenes de productos visibles para todos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Política para inserción (solo administradores y personal)
CREATE POLICY "Solo administradores y personal pueden subir imágenes de productos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product-images' AND
    auth.uid() IN (
        SELECT id FROM auth.users
        WHERE id IN (
            SELECT id FROM public.profiles
            WHERE role IN ('admin', 'staff')
        )
    )
);

-- Política para actualización (solo administradores y personal)
CREATE POLICY "Solo administradores y personal pueden actualizar imágenes de productos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'product-images' AND
    auth.uid() IN (
        SELECT id FROM auth.users
        WHERE id IN (
            SELECT id FROM public.profiles
            WHERE role IN ('admin', 'staff')
        )
    )
);

-- Política para eliminación (solo administradores y personal)
CREATE POLICY "Solo administradores y personal pueden eliminar imágenes de productos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'product-images' AND
    auth.uid() IN (
        SELECT id FROM auth.users
        WHERE id IN (
            SELECT id FROM public.profiles
            WHERE role IN ('admin', 'staff')
        )
    )
);

-- Políticas para bucket de imágenes de categorías

-- Política para lectura pública
CREATE POLICY "Imágenes de categorías visibles para todos"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

-- Política para inserción (solo administradores y personal)
CREATE POLICY "Solo administradores y personal pueden subir imágenes de categorías"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'category-images' AND
    auth.uid() IN (
        SELECT id FROM auth.users
        WHERE id IN (
            SELECT id FROM public.profiles
            WHERE role IN ('admin', 'staff')
        )
    )
);

-- Política para actualización (solo administradores y personal)
CREATE POLICY "Solo administradores y personal pueden actualizar imágenes de categorías"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'category-images' AND
    auth.uid() IN (
        SELECT id FROM auth.users
        WHERE id IN (
            SELECT id FROM public.profiles
            WHERE role IN ('admin', 'staff')
        )
    )
);

-- Política para eliminación (solo administradores y personal)
CREATE POLICY "Solo administradores y personal pueden eliminar imágenes de categorías"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'category-images' AND
    auth.uid() IN (
        SELECT id FROM auth.users
        WHERE id IN (
            SELECT id FROM public.profiles
            WHERE role IN ('admin', 'staff')
        )
    )
);
