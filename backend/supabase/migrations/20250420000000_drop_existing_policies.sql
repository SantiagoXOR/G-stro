-- Migración para eliminar políticas RLS existentes
-- Fecha: Abril 2025

-- Eliminar políticas existentes para la tabla profiles
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios perfiles" ON public.profiles;
DROP POLICY IF EXISTS "El personal puede ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Los administradores pueden actualizar cualquier perfil" ON public.profiles;

-- Eliminar políticas existentes para la tabla orders
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios pedidos" ON public.orders;
DROP POLICY IF EXISTS "Los usuarios pueden crear sus propios pedidos" ON public.orders;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios pedidos" ON public.orders;
DROP POLICY IF EXISTS "El personal puede ver todos los pedidos" ON public.orders;
DROP POLICY IF EXISTS "El personal puede actualizar todos los pedidos" ON public.orders;

-- Eliminar políticas existentes para la tabla order_items
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios items de pedidos" ON public.order_items;
DROP POLICY IF EXISTS "Los usuarios pueden crear items para sus propios pedidos" ON public.order_items;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar items de sus propios pedidos" ON public.order_items;
DROP POLICY IF EXISTS "El personal puede ver todos los items de pedidos" ON public.order_items;
DROP POLICY IF EXISTS "El personal puede actualizar todos los items de pedidos" ON public.order_items;

-- Eliminar políticas existentes para la tabla tables
DROP POLICY IF EXISTS "Todos pueden ver las mesas" ON public.tables;
DROP POLICY IF EXISTS "El personal puede actualizar mesas" ON public.tables;
DROP POLICY IF EXISTS "Los administradores pueden crear mesas" ON public.tables;
DROP POLICY IF EXISTS "Los administradores pueden eliminar mesas" ON public.tables;

-- Eliminar políticas existentes para la tabla reservations
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias reservas" ON public.reservations;
DROP POLICY IF EXISTS "Los usuarios pueden crear sus propias reservas" ON public.reservations;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propias reservas" ON public.reservations;
DROP POLICY IF EXISTS "El personal puede ver todas las reservas" ON public.reservations;
DROP POLICY IF EXISTS "El personal puede actualizar todas las reservas" ON public.reservations;

-- Eliminar políticas existentes para la tabla categories
DROP POLICY IF EXISTS "Todos pueden ver las categorías" ON public.categories;
DROP POLICY IF EXISTS "Los administradores pueden crear categorías" ON public.categories;
DROP POLICY IF EXISTS "Los administradores pueden actualizar categorías" ON public.categories;
DROP POLICY IF EXISTS "Los administradores pueden eliminar categorías" ON public.categories;

-- Eliminar políticas existentes para la tabla products
DROP POLICY IF EXISTS "Todos pueden ver los productos" ON public.products;
DROP POLICY IF EXISTS "Los administradores pueden crear productos" ON public.products;
DROP POLICY IF EXISTS "Los administradores pueden actualizar productos" ON public.products;
DROP POLICY IF EXISTS "Los administradores pueden eliminar productos" ON public.products;
