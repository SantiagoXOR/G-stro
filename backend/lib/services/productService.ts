import { supabase } from '../supabase';
import type { Database } from '../database.types';

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

/**
 * Obtiene todos los productos
 * @param options Opciones de consulta
 * @returns Lista de productos
 */
export async function getProducts(options?: {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  onlyAvailable?: boolean;
}) {
  let query = supabase
    .from('products')
    .select('*, categories(name)');

  // Aplicar filtros
  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`);
  }

  // Filtros avanzados
  if (options?.minPrice !== undefined) {
    query = query.gte('price', options.minPrice);
  }

  if (options?.maxPrice !== undefined) {
    query = query.lte('price', options.maxPrice);
  }

  if (options?.onlyAvailable) {
    query = query.eq('is_available', true);
  }

  // Aplicar ordenación
  if (options?.sortBy) {
    query = query.order(options.sortBy, {
      ascending: options.sortOrder === 'asc'
    });
  } else {
    query = query.order('name', { ascending: true });
  }

  // Aplicar paginación
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }

  return { data, count };
}

/**
 * Obtiene un producto por su ID
 * @param id ID del producto
 * @returns Producto
 */
export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error al obtener producto con ID ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Crea un nuevo producto
 * @param product Datos del producto a crear
 * @returns Producto creado
 */
export async function createProduct(product: ProductInsert) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }

  return data;
}

/**
 * Actualiza un producto existente
 * @param id ID del producto a actualizar
 * @param product Datos actualizados del producto
 * @returns Producto actualizado
 */
export async function updateProduct(id: string, product: ProductUpdate) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error al actualizar producto con ID ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Elimina un producto
 * @param id ID del producto a eliminar
 * @returns void
 */
export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error al eliminar producto con ID ${id}:`, error);
    throw error;
  }
}

/**
 * Actualiza la disponibilidad de un producto
 * @param id ID del producto
 * @param isAvailable Estado de disponibilidad
 * @returns Producto actualizado
 */
export async function updateProductAvailability(id: string, isAvailable: boolean) {
  const { data, error } = await supabase
    .from('products')
    .update({ is_available: isAvailable })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error al actualizar disponibilidad del producto con ID ${id}:`, error);
    throw error;
  }

  return data;
}
