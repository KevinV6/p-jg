import NetInfo from '@react-native-community/netinfo';

/**
 * Verifica si hay conexión a internet
 */
export async function checkInternetConnection(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  } catch (error) {
    console.warn('[Connection] Error verificando conexión:', error);
    return false;
  }
}

/**
 * Reintenta una función async con backoff exponencial
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 5000,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        // Calcular delay con backoff exponencial
        const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
        
        if (onRetry) {
          onRetry(attempt, error);
        }
        
        console.log(`[Retry] Intento ${attempt}/${maxRetries} falló. Reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Ejecuta una función con verificación de conexión y reintentos
 */
export async function executeWithConnection<T>(
  fn: () => Promise<T>,
  options: {
    checkConnection?: boolean;
    maxRetries?: number;
    onConnectionCheck?: (connected: boolean) => void;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    checkConnection = true,
    maxRetries = 3,
    onConnectionCheck,
    onRetry,
  } = options;

  // Verificar conexión primero si está habilitado
  if (checkConnection) {
    const isConnected = await checkInternetConnection();
    
    if (onConnectionCheck) {
      onConnectionCheck(isConnected);
    }

    if (!isConnected) {
      throw new Error('No hay conexión a internet. Verifica tu conexión e intenta nuevamente.');
    }
  }

  // Ejecutar con reintentos
  return retryWithBackoff(fn, { maxRetries, onRetry });
}
