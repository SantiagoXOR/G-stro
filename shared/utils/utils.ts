import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases CSS condicionales usando clsx y tailwind-merge
 * @param inputs Lista de clases CSS
 * @returns String con las clases combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Versión simplificada de cn para componentes que no usan clsx/tailwind-merge
 * @param classes Lista de clases CSS
 * @returns String con las clases combinadas
 */
export function classNames(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formatea un precio en formato de moneda
 * @param price Precio a formatear
 * @param currency Moneda (por defecto USD)
 * @returns String con el precio formateado
 */
export function formatPrice(price: number, currency = 'USD') {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Formatea una fecha en formato local
 * @param date Fecha a formatear
 * @param options Opciones de formato
 * @returns String con la fecha formateada
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('es-AR', defaultOptions).format(
    typeof date === 'string' ? new Date(date) : date
  );
}

/**
 * Trunca un texto a una longitud máxima
 * @param text Texto a truncar
 * @param maxLength Longitud máxima
 * @returns Texto truncado
 */
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Genera un ID único
 * @returns ID único
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Debounce una función
 * @param fn Función a debounce
 * @param delay Tiempo de espera en ms
 * @returns Función con debounce
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Obtiene un valor de localStorage con tipado
 * @param key Clave de localStorage
 * @param defaultValue Valor por defecto
 * @returns Valor almacenado o valor por defecto
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Guarda un valor en localStorage
 * @param key Clave de localStorage
 * @param value Valor a guardar
 */
export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

/**
 * Elimina un valor de localStorage
 * @param key Clave de localStorage
 */
export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}