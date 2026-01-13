/**
 * Utilidades para manejo de fechas locales
 * Evita problemas de conversión UTC al enviar fechas al servidor
 */

/**
 * Obtiene la fecha y hora local actual en formato ISO sin conversión UTC
 * Esto mantiene la hora local del dispositivo tal como se ve en el móvil
 * 
 * @returns string en formato ISO con la hora local (sin timezone)
 * @example
 * // Si son las 10:00 PM en Bolivia el 12 de enero de 2026
 * // Retorna: "2026-01-12T22:00:00.000" (sin timezone, para que PG la guarde tal cual)
 */
export function getLocalISOString(): string {
  const now = new Date();
  const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
  
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  // Retornar sin timezone para que PostgreSQL lo guarde como timestamp sin conversión
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Obtiene la fecha y hora local en formato ISO para enviar al servidor
 * El servidor debe interpretar esta fecha como la hora local del dispositivo
 * 
 * @returns string ISO con la fecha/hora local del dispositivo
 */
export function getLocalDateTimeForServer(): string {
  return getLocalISOString();
}

/**
 * Convierte una fecha a formato ISO manteniendo la hora local
 * Útil cuando tienes un objeto Date y necesitas preservar la hora local
 * 
 * @param date - Fecha a convertir
 * @returns string ISO con la hora local (sin timezone)
 */
export function dateToLocalISOString(date: Date): string {
  const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  
  // Retornar sin timezone
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Obtiene solo la fecha local en formato YYYY-MM-DD
 * Útil para filtros y comparaciones por día
 */
export function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
