/**
 * Servicio para gestionar preferencias de usuario
 * Utiliza localStorage para persistir las preferencias entre sesiones
 */

// Clave para almacenar preferencias en localStorage
const PREFERENCES_KEY = 'slainte_user_preferences';

// Tipos de preferencias
export interface ProductListPreferences {
  viewMode: 'list' | 'grid';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  itemsPerPage: number;
  filters: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    onlyAvailable?: boolean;
  };
}

export interface CategoryListPreferences {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  itemsPerPage: number;
  search?: string;
}

export interface UserPreferences {
  productList?: ProductListPreferences;
  categoryList?: CategoryListPreferences;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
}

/**
 * Obtiene todas las preferencias del usuario
 * @returns Preferencias del usuario
 */
export function getUserPreferences(): UserPreferences {
  try {
    const preferencesJson = localStorage.getItem(PREFERENCES_KEY);
    if (!preferencesJson) return {};
    
    return JSON.parse(preferencesJson) as UserPreferences;
  } catch (error) {
    console.error('Error al obtener preferencias de usuario:', error);
    return {};
  }
}

/**
 * Guarda todas las preferencias del usuario
 * @param preferences Preferencias a guardar
 */
export function saveUserPreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error al guardar preferencias de usuario:', error);
  }
}

/**
 * Obtiene las preferencias de la lista de productos
 * @returns Preferencias de la lista de productos
 */
export function getProductListPreferences(): ProductListPreferences | undefined {
  const preferences = getUserPreferences();
  return preferences.productList;
}

/**
 * Guarda las preferencias de la lista de productos
 * @param productListPrefs Preferencias de la lista de productos
 */
export function saveProductListPreferences(productListPrefs: ProductListPreferences): void {
  const preferences = getUserPreferences();
  saveUserPreferences({
    ...preferences,
    productList: productListPrefs
  });
}

/**
 * Obtiene las preferencias de la lista de categorías
 * @returns Preferencias de la lista de categorías
 */
export function getCategoryListPreferences(): CategoryListPreferences | undefined {
  const preferences = getUserPreferences();
  return preferences.categoryList;
}

/**
 * Guarda las preferencias de la lista de categorías
 * @param categoryListPrefs Preferencias de la lista de categorías
 */
export function saveCategoryListPreferences(categoryListPrefs: CategoryListPreferences): void {
  const preferences = getUserPreferences();
  saveUserPreferences({
    ...preferences,
    categoryList: categoryListPrefs
  });
}

/**
 * Obtiene la preferencia de tema
 * @returns Tema preferido
 */
export function getThemePreference(): 'light' | 'dark' | 'system' {
  const preferences = getUserPreferences();
  return preferences.theme || 'system';
}

/**
 * Guarda la preferencia de tema
 * @param theme Tema preferido
 */
export function saveThemePreference(theme: 'light' | 'dark' | 'system'): void {
  const preferences = getUserPreferences();
  saveUserPreferences({
    ...preferences,
    theme
  });
}

/**
 * Limpia todas las preferencias guardadas
 */
export function clearAllPreferences(): void {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
  } catch (error) {
    console.error('Error al limpiar preferencias de usuario:', error);
  }
}
