import * as XLSX from 'xlsx';
import type { Product } from './productService';
import type { Category } from './categoryService';

/**
 * Convierte datos a formato CSV
 * @param data Datos a convertir
 * @param headers Cabeceras para el CSV
 * @returns String en formato CSV
 */
export function convertToCSV<T>(data: T[], headers: Record<keyof T, string>): string {
  // Crear cabeceras
  const headerRow = Object.values(headers).join(',');
  
  // Crear filas de datos
  const rows = data.map(item => {
    return Object.keys(headers)
      .map(key => {
        const value = item[key as keyof T];
        // Manejar valores especiales
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') {
          // Escapar comillas y encerrar en comillas si contiene comas
          const escaped = value.replace(/"/g, '""');
          return escaped.includes(',') ? `"${escaped}"` : escaped;
        }
        if (typeof value === 'boolean') return value ? 'Sí' : 'No';
        if (value instanceof Date) return value.toLocaleDateString();
        return String(value);
      })
      .join(',');
  });

  // Unir cabeceras y filas
  return [headerRow, ...rows].join('\n');
}

/**
 * Convierte datos a formato Excel
 * @param data Datos a convertir
 * @param headers Cabeceras para el Excel
 * @param sheetName Nombre de la hoja
 * @returns Buffer con el archivo Excel
 */
export function convertToExcel<T>(
  data: T[], 
  headers: Record<keyof T, string>,
  sheetName: string = 'Datos'
): Uint8Array {
  // Crear array de arrays para XLSX
  const headerRow = Object.values(headers);
  
  const rows = data.map(item => {
    return Object.keys(headers).map(key => {
      const value = item[key as keyof T];
      // Formatear valores especiales
      if (value === null || value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'Sí' : 'No';
      return value;
    });
  });

  // Crear libro y hoja
  const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Convertir a buffer
  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
}

/**
 * Descarga un archivo
 * @param data Datos del archivo
 * @param fileName Nombre del archivo
 * @param mimeType Tipo MIME
 */
export function downloadFile(data: string | Uint8Array, fileName: string, mimeType: string): void {
  // Crear blob
  const blob = typeof data === 'string'
    ? new Blob([data], { type: mimeType })
    : new Blob([data], { type: mimeType });
  
  // Crear URL
  const url = URL.createObjectURL(blob);
  
  // Crear elemento de descarga
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  
  // Simular clic
  document.body.appendChild(link);
  link.click();
  
  // Limpiar
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Exporta productos a CSV
 * @param products Lista de productos
 * @param fileName Nombre del archivo
 */
export function exportProductsToCSV(products: Product[], fileName: string = 'productos.csv'): void {
  const headers: Record<keyof Partial<Product>, string> = {
    name: 'Nombre',
    description: 'Descripción',
    price: 'Precio',
    category_id: 'ID Categoría',
    is_available: 'Disponible',
    alcohol_percentage: 'Porcentaje de Alcohol',
    created_at: 'Fecha de Creación',
    updated_at: 'Fecha de Actualización'
  };
  
  const csv = convertToCSV(products, headers);
  downloadFile(csv, fileName, 'text/csv;charset=utf-8;');
}

/**
 * Exporta productos a Excel
 * @param products Lista de productos
 * @param fileName Nombre del archivo
 */
export function exportProductsToExcel(products: Product[], fileName: string = 'productos.xlsx'): void {
  const headers: Record<keyof Partial<Product>, string> = {
    name: 'Nombre',
    description: 'Descripción',
    price: 'Precio',
    category_id: 'ID Categoría',
    is_available: 'Disponible',
    alcohol_percentage: 'Porcentaje de Alcohol',
    created_at: 'Fecha de Creación',
    updated_at: 'Fecha de Actualización'
  };
  
  const excel = convertToExcel(products, headers, 'Productos');
  downloadFile(excel, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/**
 * Exporta categorías a CSV
 * @param categories Lista de categorías
 * @param fileName Nombre del archivo
 */
export function exportCategoriesToCSV(categories: Category[], fileName: string = 'categorias.csv'): void {
  const headers: Record<keyof Partial<Category>, string> = {
    name: 'Nombre',
    description: 'Descripción',
    created_at: 'Fecha de Creación',
    updated_at: 'Fecha de Actualización'
  };
  
  const csv = convertToCSV(categories, headers);
  downloadFile(csv, fileName, 'text/csv;charset=utf-8;');
}

/**
 * Exporta categorías a Excel
 * @param categories Lista de categorías
 * @param fileName Nombre del archivo
 */
export function exportCategoriesToExcel(categories: Category[], fileName: string = 'categorias.xlsx'): void {
  const headers: Record<keyof Partial<Category>, string> = {
    name: 'Nombre',
    description: 'Descripción',
    created_at: 'Fecha de Creación',
    updated_at: 'Fecha de Actualización'
  };
  
  const excel = convertToExcel(categories, headers, 'Categorías');
  downloadFile(excel, fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}
