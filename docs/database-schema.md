# Documentación del Esquema de Base de Datos - Gëstro

## 1. Estructura de la Base de Datos

### Tablas Implementadas

#### Perfiles de Usuario (`profiles`)
- Almacena información de los usuarios registrados
- Campos: id, email, name, role, created_at, updated_at
- Roles: admin, staff, customer

#### Categorías (`categories`)
- Categorías de productos disponibles
- Campos: id, name, description, image_url, order_position, created_at, updated_at
- Categorías actuales: Cocteles, Cervezas, Vinos, Sin Alcohol, Licores

#### Productos (`products`)
- Productos disponibles para ordenar
- Campos: id, name, description, price, category_id, image_url, is_available, alcohol_percentage, created_at, updated_at
- Relacionado con: categories (category_id)

#### Mesas (`tables`)
- Mesas disponibles en el establecimiento
- Campos: id, table_number, capacity, status, location, created_at, updated_at
- Estados: available, occupied, reserved, maintenance

#### Reservas (`reservations`)
- Reservas de mesas realizadas por clientes
- Campos: id, customer_id, table_id, reservation_date, start_time, end_time, party_size, status, notes, created_at, updated_at
- Estados: pending, confirmed, cancelled, completed
- Relacionado con: profiles (customer_id), tables (table_id)

#### Órdenes (`orders`)
- Pedidos realizados por clientes
- Campos: id, customer_id, table_id, status, total_amount, notes, created_at, updated_at
- Estados: pending, preparing, ready, delivered, cancelled
- Relacionado con: profiles (customer_id)

#### Elementos de Orden (`order_items`)
- Productos incluidos en una orden
- Campos: id, order_id, product_id, quantity, unit_price, notes, created_at, updated_at
- Relacionado con: orders (order_id), products (product_id)

### Políticas de Seguridad (RLS)

Se han implementado políticas de seguridad para todas las tablas:

1. **Categorías y Productos**:
   - Visibles para todos los usuarios
   - Solo administradores pueden crear, actualizar o eliminar

2. **Mesas**:
   - Visibles para todos los usuarios
   - Solo administradores pueden crear, actualizar o eliminar

3. **Reservas**:
   - Clientes solo pueden ver sus propias reservas
   - Personal y administradores pueden ver todas las reservas
   - Políticas específicas para creación y actualización

4. **Órdenes y Elementos de Orden**:
   - Clientes solo pueden ver sus propias órdenes
   - Personal y administradores pueden ver todas las órdenes
   - Clientes solo pueden actualizar órdenes en estado "pending"
   - Personal y administradores pueden actualizar cualquier orden

### Índices

Se han creado índices para optimizar las consultas más comunes:

- `idx_tables_status`: Para búsquedas rápidas de mesas por estado
- `idx_reservations_date`: Para búsquedas de reservas por fecha
- `idx_reservations_customer_id`: Para búsquedas de reservas por cliente
- `idx_reservations_table_id`: Para búsquedas de reservas por mesa
- `idx_reservations_status`: Para búsquedas de reservas por estado
- `idx_products_category_id`: Para búsquedas de productos por categoría
- `idx_order_items_order_id`: Para búsquedas de elementos por orden
- `idx_order_items_product_id`: Para búsquedas de elementos por producto
- `idx_profiles_role`: Para búsquedas de usuarios por rol

## 2. Tipos Enumerados

- `user_role`: admin, staff, customer
- `order_status`: pending, preparing, ready, delivered, cancelled
- `table_status`: available, occupied, reserved, maintenance
- `reservation_status`: pending, confirmed, cancelled, completed
- `payment_method_type`: credit_card, debit_card, mercadopago, cash, transfer
- `payment_status`: pending, approved, rejected, refunded, cancelled
- `inventory_transaction_type`: purchase, sale, adjustment, waste

## 3. Funciones de Base de Datos

- `update_updated_at_column()`: Actualiza automáticamente el campo updated_at cuando se modifica un registro
- `can_manage_orders()`: Verifica si un usuario puede gestionar una orden específica
- `check_establishment_access()`: Verifica si un usuario tiene acceso a un establecimiento
- `get_user_role()`: Obtiene el rol del usuario actual
- `is_own_profile()`: Verifica si un perfil pertenece al usuario actual
- `make_user_admin()`: Convierte a un usuario en administrador
- `update_user_role()`: Actualiza el rol de un usuario

## 4. Triggers

- `update_tables_updated_at`: Actualiza el campo updated_at en la tabla tables
- `update_reservations_updated_at`: Actualiza el campo updated_at en la tabla reservations

## 5. Relaciones entre Tablas

- `profiles.id` → `auth.users.id` (Relación con el sistema de autenticación)
- `products.category_id` → `categories.id`
- `order_items.order_id` → `orders.id`
- `order_items.product_id` → `products.id`
- `orders.customer_id` → `profiles.id`
- `reservations.customer_id` → `profiles.id`
- `reservations.table_id` → `tables.id`

## 6. Datos de Ejemplo

Se han cargado datos de ejemplo para:
- Categorías (5 categorías)
- Productos (14 productos distribuidos en las categorías)
- Mesas (6 mesas con diferentes capacidades y ubicaciones)

## 7. Tipos TypeScript Generados

Se han generado tipos TypeScript para todas las tablas en `shared/types/database.types.ts`, lo que facilita el desarrollo del frontend con tipado estático.
