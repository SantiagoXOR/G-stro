import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

// Definir buckets para imágenes
const PRODUCT_IMAGES_BUCKET = 'product-images';
const CATEGORY_IMAGES_BUCKET = 'category-images';

// Tipos de imágenes soportados
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Tamaño máximo de imagen (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Verifica si un archivo es una imagen válida
 * @param file Archivo a verificar
 * @returns Objeto con resultado de validación
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Verificar tipo de archivo
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no soportado. Tipos permitidos: ${SUPPORTED_IMAGE_TYPES.map(type => type.replace('image/', '')).join(', ')}`
    };
  }

  // Verificar tamaño de archivo
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
    };
  }

  return { valid: true };
}

/**
 * Sube una imagen al bucket de productos
 * @param file Archivo de imagen a subir
 * @param existingPath Ruta de imagen existente (para reemplazar)
 * @returns URL pública de la imagen
 */
export async function uploadProductImage(file: File, existingPath?: string): Promise<string> {
  return uploadImage(file, PRODUCT_IMAGES_BUCKET, existingPath);
}

/**
 * Sube una imagen al bucket de categorías
 * @param file Archivo de imagen a subir
 * @param existingPath Ruta de imagen existente (para reemplazar)
 * @returns URL pública de la imagen
 */
export async function uploadCategoryImage(file: File, existingPath?: string): Promise<string> {
  return uploadImage(file, CATEGORY_IMAGES_BUCKET, existingPath);
}

/**
 * Sube una imagen a un bucket específico
 * @param file Archivo de imagen a subir
 * @param bucket Nombre del bucket
 * @param existingPath Ruta de imagen existente (para reemplazar)
 * @returns URL pública de la imagen
 */
async function uploadImage(file: File, bucket: string, existingPath?: string): Promise<string> {
  // Validar imagen
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Si hay una ruta existente, eliminar la imagen anterior
  if (existingPath) {
    await deleteImage(existingPath);
  }

  // Generar nombre de archivo único
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Subir archivo
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error al subir imagen:', error);
    throw error;
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Elimina una imagen por su URL
 * @param imageUrl URL de la imagen a eliminar
 * @returns void
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  // Extraer bucket y ruta del archivo de la URL
  const { bucket, filePath } = parseImageUrl(imageUrl);
  
  if (!bucket || !filePath) {
    console.warn('No se pudo determinar el bucket o la ruta del archivo:', imageUrl);
    return;
  }

  // Eliminar archivo
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    console.error('Error al eliminar imagen:', error);
    throw error;
  }
}

/**
 * Extrae el bucket y la ruta del archivo de una URL de imagen
 * @param imageUrl URL de la imagen
 * @returns Objeto con bucket y filePath
 */
function parseImageUrl(imageUrl: string): { bucket?: string; filePath?: string } {
  try {
    // Ejemplo de URL: https://myjqdrrrqfdugzmuejypz.supabase.co/storage/v1/object/public/product-images/123e4567-e89b-12d3-a456-426614174000.jpg
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    
    // Buscar 'public' en la ruta para determinar el bucket y la ruta del archivo
    const publicIndex = pathParts.findIndex(part => part === 'public');
    
    if (publicIndex !== -1 && publicIndex + 1 < pathParts.length) {
      const bucket = pathParts[publicIndex + 1];
      const filePath = pathParts.slice(publicIndex + 2).join('/');
      
      return { bucket, filePath };
    }
    
    return {};
  } catch (error) {
    console.error('Error al analizar URL de imagen:', error);
    return {};
  }
}

/**
 * Obtiene la URL de una imagen de placeholder
 * @param type Tipo de imagen (product o category)
 * @returns URL de imagen placeholder
 */
export function getPlaceholderImage(type: 'product' | 'category'): string {
  return type === 'product' 
    ? 'https://via.placeholder.com/300x200?text=Producto+sin+imagen'
    : 'https://via.placeholder.com/300x200?text=Categoría+sin+imagen';
}
