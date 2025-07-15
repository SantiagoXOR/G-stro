// Importación condicional para evitar problemas durante el build
// import { getSupabaseClient } from "@/lib/supabase-client"
// import { isInOfflineMode } from "@/lib/offline-mode"

// Helper function para obtener el cliente de Supabase de forma segura
async function getSupabase() {
  // Por ahora, usar solo datos de ejemplo
  throw new Error('Usando datos de ejemplo - Supabase no disponible durante build')
}

// Tipos simplificados para productos y categorías
export type Product = {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  category_id: string
  available: boolean
  created_at?: string
  updated_at?: string
  category?: Category
}

export type Category = {
  id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

/**
 * Obtiene todas las categorías
 */
export async function getCategories(): Promise<Category[]> {
  // Temporalmente usar solo datos de ejemplo para evitar problemas con Supabase
  // Datos de ejemplo para modo offline o desarrollo
  const mockCategories: Category[] = [
    {
      id: "1",
      name: "Bebidas",
      description: "Refrescos, cervezas y otras bebidas"
    },
    {
      id: "2",
      name: "Entrantes",
      description: "Aperitivos y entrantes"
    },
    {
      id: "3",
      name: "Platos principales",
      description: "Platos principales y especialidades"
    },
    {
      id: "4",
      name: "Postres",
      description: "Postres y dulces"
    }
  ]

  // Siempre devolver datos de ejemplo por ahora
  console.log('Devolviendo datos de ejemplo para categorías')
  return mockCategories
}

/**
 * Obtiene todos los productos
 */
export async function getProducts(): Promise<Product[]> {
  // Temporalmente usar solo datos de ejemplo para evitar problemas con Supabase
  // Datos de ejemplo para modo offline o desarrollo
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Coca Cola",
      description: "Refresco de cola clásico, refrescante y burbujeante",
      price: 2.5,
      image_url: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=200&fit=crop&crop=center",
      category_id: "1",
      available: true,
      category: { id: "1", name: "Bebidas" }
    },
    {
      id: "2",
      name: "Patatas bravas",
      description: "Patatas fritas caseras con nuestra salsa brava especial",
      price: 5.0,
      image_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop&crop=center",
      category_id: "2",
      available: true,
      category: { id: "2", name: "Entrantes" }
    },
    {
      id: "3",
      name: "Hamburguesa Clásica",
      description: "Hamburguesa artesanal con carne de res, queso, lechuga y tomate",
      price: 10.0,
      image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop&crop=center",
      category_id: "3",
      available: true,
      category: { id: "3", name: "Platos principales" }
    },
    {
      id: "4",
      name: "Tarta de chocolate",
      description: "Deliciosa tarta de chocolate casera con nata montada",
      price: 4.5,
      image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop&crop=center",
      category_id: "4",
      available: true,
      category: { id: "4", name: "Postres" }
    },
    {
      id: "5",
      name: "Cerveza Artesanal",
      description: "Cerveza artesanal de la casa, elaborada con ingredientes locales",
      price: 4.0,
      image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&h=200&fit=crop&crop=center",
      category_id: "1",
      available: true,
      category: { id: "1", name: "Bebidas" }
    },
    {
      id: "6",
      name: "Ensalada César",
      description: "Ensalada fresca con lechuga, pollo, crutones y aderezo césar",
      price: 7.5,
      image_url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop&crop=center",
      category_id: "2",
      available: true,
      category: { id: "2", name: "Entrantes" }
    }
  ]

  // Siempre devolver datos de ejemplo por ahora
  console.log('Devolviendo datos de ejemplo para productos')
  return mockProducts
}

/**
 * Obtiene productos por categoría
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  // Usar datos de ejemplo filtrados por categoría
  const mockProducts = await getProducts()
  return mockProducts.filter(product => product.category_id === categoryId)
}

/**
 * Obtiene un producto por su ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  // Buscar en datos de ejemplo
  const mockProducts = await getProducts()
  return mockProducts.find(product => product.id === id) || null
}

/**
 * Busca productos por nombre o descripción
 */
export async function searchProducts(query: string): Promise<Product[]> {
  // Filtrar productos de ejemplo por nombre o descripción
  const mockProducts = await getProducts()
  const lowercaseQuery = query.toLowerCase()
  return mockProducts.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    (product.description && product.description.toLowerCase().includes(lowercaseQuery))
  )
}

/**
 * Crea un nuevo producto (solo para administradores)
 * Nota: Esta función está simulada y no realiza cambios reales en la base de datos
 */
export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
  // Simular creación de producto
  console.log('Simulando creación de producto')
  return {
    ...product,
    id: `mock-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

/**
 * Actualiza un producto existente (solo para administradores)
 * Nota: Esta función está simulada y no realiza cambios reales en la base de datos
 */
export async function updateProduct(id: string, updates: Partial<Omit<Product, "id" | "created_at" | "updated_at">>): Promise<Product> {
  // Buscar el producto a actualizar
  const product = await getProductById(id)
  if (!product) {
    throw new Error(`Producto con ID ${id} no encontrado`)
  }
  // Simular actualización
  console.log('Simulando actualización de producto')
  return {
    ...product,
    ...updates,
    updated_at: new Date().toISOString()
  }
}

/**
 * Elimina un producto (solo para administradores)
 * Nota: Esta función está simulada y no realiza cambios reales en la base de datos
 */
export async function deleteProduct(id: string): Promise<void> {
  // Simular eliminación
  console.log('Simulando eliminación de producto')
  // No hacer nada, solo simular éxito
}
