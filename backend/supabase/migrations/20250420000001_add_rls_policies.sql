-- Migración para configurar políticas RLS
-- Fecha: Abril 2025
-- Nota: Esta migración debe ejecutarse después de 20250420000000_drop_existing_policies.sql

-- Habilitar RLS en todas las tablas principales
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla profiles
CREATE POLICY "Los usuarios pueden ver sus propios perfiles"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar sus propios perfiles"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Políticas para la tabla orders
CREATE POLICY "Los usuarios pueden ver sus propios pedidos"
ON public.orders
FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Los usuarios pueden crear sus propios pedidos"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios pedidos"
ON public.orders
FOR UPDATE
USING (auth.uid() = customer_id AND status = 'pending');

-- Políticas para la tabla order_items
CREATE POLICY "Los usuarios pueden ver sus propios items de pedidos"
ON public.order_items
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders
  WHERE orders.id = order_items.order_id
  AND orders.customer_id = auth.uid()
));

CREATE POLICY "Los usuarios pueden crear items para sus propios pedidos"
ON public.order_items
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders
  WHERE orders.id = order_items.order_id
  AND orders.customer_id = auth.uid()
  AND orders.status = 'pending'
));

CREATE POLICY "Los usuarios pueden actualizar items de sus propios pedidos"
ON public.order_items
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.orders
  WHERE orders.id = order_items.order_id
  AND orders.customer_id = auth.uid()
  AND orders.status = 'pending'
));

-- Políticas para la tabla tables
CREATE POLICY "Todos pueden ver las mesas"
ON public.tables
FOR SELECT
USING (true);

-- Políticas para la tabla reservations
CREATE POLICY "Los usuarios pueden ver sus propias reservas"
ON public.reservations
FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Los usuarios pueden crear sus propias reservas"
ON public.reservations
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias reservas"
ON public.reservations
FOR UPDATE
USING (auth.uid() = customer_id AND status IN ('pending', 'confirmed'));

-- Políticas para la tabla categories
CREATE POLICY "Todos pueden ver las categorías"
ON public.categories
FOR SELECT
USING (true);

-- Políticas para la tabla products
CREATE POLICY "Todos pueden ver los productos"
ON public.products
FOR SELECT
USING (true);

-- Políticas para la tabla payment_transactions (comentado porque la tabla no existe aún)
-- CREATE POLICY "Los usuarios pueden ver sus propias transacciones"
-- ON public.payment_transactions
-- FOR SELECT
-- USING (EXISTS (
--   SELECT 1 FROM public.orders
--   WHERE orders.id = payment_transactions.order_id
--   AND orders.customer_id = auth.uid()
-- ));
--
-- CREATE POLICY "Los usuarios pueden crear transacciones para sus propios pedidos"
-- ON public.payment_transactions
-- FOR INSERT
-- WITH CHECK (EXISTS (
--   SELECT 1 FROM public.orders
--   WHERE orders.id = payment_transactions.order_id
--   AND orders.customer_id = auth.uid()
-- ));

-- Políticas para el personal (role = 'staff')
CREATE POLICY "El personal puede ver todos los perfiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'staff' OR role = 'admin'
));

CREATE POLICY "El personal puede ver todos los pedidos"
ON public.orders
FOR SELECT
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'staff' OR role = 'admin'
));

CREATE POLICY "El personal puede actualizar todos los pedidos"
ON public.orders
FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'staff' OR role = 'admin'
));

CREATE POLICY "El personal puede ver todos los items de pedidos"
ON public.order_items
FOR SELECT
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'staff' OR role = 'admin'
));

CREATE POLICY "El personal puede actualizar todos los items de pedidos"
ON public.order_items
FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'staff' OR role = 'admin'
));

CREATE POLICY "El personal puede actualizar mesas"
ON public.tables
FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'staff' OR role = 'admin'
));

CREATE POLICY "El personal puede ver todas las reservas"
ON public.reservations
FOR SELECT
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'staff' OR role = 'admin'
));

CREATE POLICY "El personal puede actualizar todas las reservas"
ON public.reservations
FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'staff' OR role = 'admin'
));

-- CREATE POLICY "El personal puede ver todas las transacciones"
-- ON public.payment_transactions
-- FOR SELECT
-- USING (auth.uid() IN (
--   SELECT id FROM public.profiles
--   WHERE role = 'staff' OR role = 'admin'
-- ));

-- Políticas para administradores (role = 'admin')
CREATE POLICY "Los administradores pueden actualizar cualquier perfil"
ON public.profiles
FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'admin'
));

CREATE POLICY "Los administradores pueden crear categorías"
ON public.categories
FOR INSERT
WITH CHECK (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'admin'
));

CREATE POLICY "Los administradores pueden actualizar categorías"
ON public.categories
FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'admin'
));

CREATE POLICY "Los administradores pueden eliminar categorías"
ON public.categories
FOR DELETE
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'admin'
));

CREATE POLICY "Los administradores pueden crear productos"
ON public.products
FOR INSERT
WITH CHECK (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'admin'
));

CREATE POLICY "Los administradores pueden actualizar productos"
ON public.products
FOR UPDATE
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'admin'
));

CREATE POLICY "Los administradores pueden eliminar productos"
ON public.products
FOR DELETE
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'admin'
));

CREATE POLICY "Los administradores pueden crear mesas"
ON public.tables
FOR INSERT
WITH CHECK (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'admin'
));

CREATE POLICY "Los administradores pueden eliminar mesas"
ON public.tables
FOR DELETE
USING (auth.uid() IN (
  SELECT id FROM public.profiles
  WHERE role = 'admin'
));
