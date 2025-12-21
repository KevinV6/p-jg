/**
 * Utilidades de validación para inputs numéricos
 */

/**
 * Valida y formatea un input de precio/número decimal
 * - Solo permite dígitos y un solo punto decimal
 * - No permite valores negativos
 * - No permite formatos inválidos como "00.5.0..5"
 * 
 * @param text - El texto a validar
 * @param currentValue - El valor actual (para comparación)
 * @returns El texto validado o null si es inválido
 */
export const validateDecimalInput = (text: string, currentValue: string = ''): string | null => {
  // Permitir vacío
  if (text === '') return '';
  
  // Eliminar caracteres no permitidos (solo números y punto)
  let cleaned = text.replace(/[^0-9.]/g, '');
  
  // Si está vacío después de limpiar, devolver vacío
  if (cleaned === '') return '';
  
  // Contar puntos decimales
  const dotCount = (cleaned.match(/\./g) || []).length;
  
  // Solo permitir un punto decimal
  if (dotCount > 1) {
    // Mantener solo el primer punto
    const parts = cleaned.split('.');
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // No permitir que empiece con punto (agregar 0 al inicio)
  if (cleaned.startsWith('.')) {
    cleaned = '0' + cleaned;
  }
  
  // No permitir múltiples ceros al inicio (excepto "0." para decimales)
  if (cleaned.length > 1 && cleaned.startsWith('0') && cleaned[1] !== '.') {
    cleaned = cleaned.replace(/^0+/, '') || '0';
  }
  
  // Limitar decimales a 2 lugares
  const parts = cleaned.split('.');
  if (parts[1] && parts[1].length > 2) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  return cleaned;
};

/**
 * Valida y formatea un input de cantidad (números enteros o con decimales)
 * Similar a validateDecimalInput pero permite más decimales para cantidades
 * 
 * @param text - El texto a validar
 * @returns El texto validado
 */
export const validateQuantityInput = (text: string): string | null => {
  // Permitir vacío
  if (text === '') return '';
  
  // Eliminar caracteres no permitidos (solo números y punto)
  let cleaned = text.replace(/[^0-9.]/g, '');
  
  // Si está vacío después de limpiar, devolver vacío
  if (cleaned === '') return '';
  
  // Contar puntos decimales
  const dotCount = (cleaned.match(/\./g) || []).length;
  
  // Solo permitir un punto decimal
  if (dotCount > 1) {
    const parts = cleaned.split('.');
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // No permitir que empiece con punto
  if (cleaned.startsWith('.')) {
    cleaned = '0' + cleaned;
  }
  
  // No permitir múltiples ceros al inicio (excepto "0." para decimales)
  if (cleaned.length > 1 && cleaned.startsWith('0') && cleaned[1] !== '.') {
    cleaned = cleaned.replace(/^0+/, '') || '0';
  }
  
  // Limitar decimales a 3 lugares para cantidades
  const parts = cleaned.split('.');
  if (parts[1] && parts[1].length > 3) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 3);
  }
  
  return cleaned;
};

/**
 * Valida que el valor numérico sea positivo
 * @param value - El valor a validar
 * @returns true si es válido (mayor a 0)
 */
export const isPositiveNumber = (value: string): boolean => {
  if (!value || value === '') return false;
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Valida que el valor numérico sea no negativo (>= 0)
 * @param value - El valor a validar
 * @returns true si es válido (mayor o igual a 0)
 */
export const isNonNegativeNumber = (value: string): boolean => {
  if (!value || value === '') return true; // Vacío es válido (puede ser opcional)
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Parsea un string a número de forma segura
 * @param value - El valor a parsear
 * @param defaultValue - Valor por defecto si el parseo falla
 * @returns El número parseado o el valor por defecto
 */
export const safeParseFloat = (value: string, defaultValue: number = 0): number => {
  if (!value || value === '') return defaultValue;
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
};
