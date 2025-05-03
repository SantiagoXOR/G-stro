# Estructura de la Base de Datos - Gëstro

## Introducción

Este documento describe la estructura de la base de datos de Gëstro, incluyendo las tablas principales, sus relaciones y las políticas de seguridad implementadas.

## Esquema de la Base de Datos

La base de datos de Gëstro está organizada en el esquema `public` y utiliza Supabase como plataforma de backend.

### Tablas Principales

#### 1. `profiles`

Almacena información de los usuarios registrados en la aplicación.

| Columna     | Tipo      | Descripción                                      |
|-------------|-----------|--------------------------------------------------|
| id          | uuid      | Identificador único del perfil (clave primaria)  |
| email       | text      | Correo electrónico del usuario                   |
| name        | text      | Nombre completo del usuario                      |
| role        | user_role | Rol del usuario (customer, staff, admin)         |
| avatar_url  | text      | URL de la imagen de perfil                       |
| phone       | text      | Número de teléfono                               |
| created_at  | timestamp | Fecha de creación del perfil                     |
| updated_at  | timestamp | Fecha de última actualización                    |

#### 2. `orders`

Almacena los pedidos realizados por los clientes.

| Columna       | Tipo         | Descripción                                      |
|---------------|--------------|--------------------------------------------------|
| id            | uuid         | Identificador único del pedido (clave primaria)  |
| customer_id   | uuid         | ID del cliente que realizó el pedido (FK a profiles) |
| table_id      | uuid         | ID de la mesa asociada al pedido (FK a tables)   |
| status        | order_status | Estado del pedido (pending, preparing, ready, delivered, cancelled) |
| total_amount  | numeric      | Monto total del pedido                           |
| notes         | text         | Notas adicionales sobre el pedido                |
| created_at    | timestamp    | Fecha de creación del pedido                     |
| updated_at    | timestamp    | Fecha de última actualización                    |

#### 3. `order_items`

Almacena los elementos individuales de cada pedido.

| Columna     | Tipo      | Descripción                                      |
|-------------|-----------|--------------------------------------------------|
| id          | uuid      | Identificador único del item (clave primaria)    |
| order_id    | uuid      | ID del pedido al que pertenece (FK a orders)     |
| product_id  | uuid      | ID del producto ordenado (FK a products)         |
| quantity    | integer   | Cantidad del producto                            |
| unit_price  | numeric   | Precio unitario del producto                     |
| notes       | text      | Notas específicas para este item                 |
| created_at  | timestamp | Fecha de creación                                |
| updated_at  | timestamp | Fecha de última actualización                    |

#### 4. `products`

Almacena información sobre los productos disponibles.

| Columna       | Tipo      | Descripción                                      |
|---------------|-----------|--------------------------------------------------|
| id            | uuid      | Identificador único del producto (clave primaria)|
| name          | text      | Nombre del producto                              |
| description   | text      | Descripción detallada                            |
| price         | numeric   | Precio del producto                              |
| image_url     | text      | URL de la imagen del producto                    |
| category_id   | uuid      | ID de la categoría (FK a categories)             |
| is_available  | boolean   | Indica si el producto está disponible            |
| created_at    | timestamp | Fecha de creación                                |
| updated_at    | timestamp | Fecha de última actualización                    |

#### 5. `categories`

Almacena las categorías de productos.

| Columna     | Tipo      | Descripción                                      |
|-------------|-----------|--------------------------------------------------|
| id          | uuid      | Identificador único de la categoría (clave primaria) |
| name        | text      | Nombre de la categoría                           |
| description | text      | Descripción de la categoría                      |
| image_url   | text      | URL de la imagen de la categoría                 |
| order       | integer   | Orden de visualización                           |
| created_at  | timestamp | Fecha de creación                                |
| updated_at  | timestamp | Fecha de última actualización                    |

#### 6. `tables`

Almacena información sobre las mesas del restaurante.

| Columna       | Tipo         | Descripción                                      |
|---------------|--------------|--------------------------------------------------|
| id            | uuid         | Identificador único de la mesa (clave primaria)  |
| table_number  | integer      | Número de la mesa                                |
| capacity      | integer      | Capacidad de personas                            |
| status        | table_status | Estado de la mesa (available, occupied, reserved, maintenance) |
| location      | text         | Ubicación de la mesa en el restaurante           |
| created_at    | timestamp    | Fecha de creación                                |
| updated_at    | timestamp    | Fecha de última actualización                    |

#### 7. `reservations`

Almacena las reservas de mesas.

| Columna          | Tipo              | Descripción                                      |
|------------------|-------------------|--------------------------------------------------|
| id               | uuid              | Identificador único de la reserva (clave primaria) |
| customer_id      | uuid              | ID del cliente (FK a profiles)                   |
| table_id         | uuid              | ID de la mesa reservada (FK a tables)            |
| reservation_date | date              | Fecha de la reserva                              |
| start_time       | time              | Hora de inicio                                   |
| end_time         | time              | Hora de finalización                             |
| party_size       | integer           | Número de personas                               |
| status           | reservation_status| Estado de la reserva (pending, confirmed, cancelled, completed) |
| notes            | text              | Notas adicionales                                |
| created_at       | timestamp         | Fecha de creación                                |
| updated_at       | timestamp         | Fecha de última actualización                    |

## Relaciones entre Tablas

```
profiles
  ↑
  |
  +--- orders ---→ order_items ---→ products ---→ categories
  |      ↓
  |      |
  +--- reservations ---→ tables
```

- Un usuario (`profiles`) puede tener múltiples pedidos (`orders`) y reservas (`reservations`).
- Un pedido (`orders`) pertenece a un usuario y puede estar asociado a una mesa.
- Un pedido (`orders`) contiene múltiples elementos (`order_items`).
- Cada elemento de pedido (`order_items`) está asociado a un producto (`products`).
- Cada producto (`products`) pertenece a una categoría (`categories`).
- Una reserva (`reservations`) está asociada a un usuario y a una mesa específica.

## Tipos Enumerados

La base de datos utiliza varios tipos enumerados para restringir los valores posibles en ciertas columnas:

1. `user_role`: Define los roles de usuario
   - `customer`: Cliente regular
   - `staff`: Personal del restaurante
   - `admin`: Administrador con acceso completo

2. `order_status`: Define los estados posibles de un pedido
   - `pending`: Pedido pendiente
   - `preparing`: En preparación
   - `ready`: Listo para entregar
   - `delivered`: Entregado al cliente
   - `cancelled`: Cancelado

3. `table_status`: Define los estados posibles de una mesa
   - `available`: Disponible
   - `occupied`: Ocupada
   - `reserved`: Reservada
   - `maintenance`: En mantenimiento

4. `reservation_status`: Define los estados posibles de una reserva
   - `pending`: Pendiente de confirmación
   - `confirmed`: Confirmada
   - `cancelled`: Cancelada
   - `completed`: Completada

## Políticas de Seguridad (Row Level Security)

Gëstro implementa políticas de seguridad a nivel de fila (RLS) para garantizar que los usuarios solo puedan acceder a los datos que les corresponden:

### Políticas para Usuarios Regulares (role = 'customer')

- Solo pueden ver y actualizar su propio perfil
- Solo pueden ver, crear y actualizar sus propios pedidos
- Solo pueden ver, crear y actualizar elementos de sus propios pedidos
- Pueden ver todas las mesas disponibles
- Solo pueden ver, crear y actualizar sus propias reservas
- Pueden ver todas las categorías y productos

### Políticas para Personal (role = 'staff')

- Pueden ver todos los perfiles
- Pueden ver y actualizar todos los pedidos
- Pueden ver y actualizar todos los elementos de pedidos
- Pueden ver y actualizar el estado de las mesas
- Pueden ver y actualizar todas las reservas

### Políticas para Administradores (role = 'admin')

- Acceso completo a todos los perfiles
- Acceso completo a todas las tablas
- Pueden crear, actualizar y eliminar categorías y productos
- Pueden crear, actualizar y eliminar mesas

## Funciones y Triggers

### `handle_new_user()`

Esta función se ejecuta automáticamente cuando se crea un nuevo usuario en `auth.users` y crea un perfil correspondiente en la tabla `profiles`.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### `update_updated_at_column()`

Esta función actualiza automáticamente el campo `updated_at` cuando se modifica un registro.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;
```

Se aplica a todas las tablas principales mediante triggers:

```sql
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- (Triggers similares para las demás tablas)
```

## Índices

Para optimizar el rendimiento de las consultas, se han creado índices en las columnas más utilizadas:

```sql
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX idx_reservations_table_id ON reservations(table_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
```

## Consideraciones de Diseño

1. **Integridad Referencial**: Se utilizan claves foráneas para mantener la integridad referencial entre tablas.

2. **Auditoría**: Todas las tablas incluyen campos `created_at` y `updated_at` para seguimiento de cambios.

3. **Seguridad**: Se implementa Row Level Security (RLS) para garantizar que los usuarios solo accedan a los datos que les corresponden.

4. **Escalabilidad**: El diseño permite agregar nuevas funcionalidades sin modificar significativamente la estructura existente.

5. **Rendimiento**: Se utilizan índices en las columnas más consultadas para optimizar el rendimiento.
