import { supabase } from '../supabase';
import type { Database } from '../database.types';

export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

/**
 * Obtiene todas las categorías
 * @param options Opciones de consulta
 * @returns Lista de categorías
 */
export async function getCategories(options?: {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}) {
  let query = supabase
    .from('categories')
    .select('*', { count: 'exact' });

  // Aplicar filtros
  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`);
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
    console.error('Error al obtener categorías:', error);
    throw error;
  }

  return { data, count };
}

/**
 * Obtiene una categoría por su ID
 * @param id ID de la categoría
 * @returns Categoría
 */
export async function getCategoryById(id: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error al obtener categoría con ID ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Crea una nueva categoría
 * @param category Datos de la categoría a crear
 * @returns Categoría creada
 */
export async function createCategory(category: CategoryInsert) {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();

  if (error) {
    console.error('Error al crear categoría:', error);
    throw error;
  }

  return data;
}

/**
 * Actualiza una categoría existente
 * @param id ID de la categoría a actualizar
 * @param category Datos actualizados de la categoría
 * @returns Categoría actualizada
 */
export async function updateCategory(id: string, category: CategoryUpdate) {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error al actualizar categoría con ID ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Elimina una categoría
 * @param id ID de la categoría a eliminar
 * @returns void
 */
export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error al eliminar categoría con ID ${id}:`, error);
    throw error;
  }
}

/**
 * Obtiene el número de productos asociados a una categoría
 * @param categoryId ID de la categoría
 * @returns Número de productos
 */
export async function getProductCountByCategory(categoryId: string) {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  if (error) {
    console.error(`Error al obtener conteo de productos para categoría ${categoryId}:`, error);
    throw error;
  }

  return count;
}
