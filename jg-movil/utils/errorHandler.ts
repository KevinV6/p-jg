import NetInfo from '@react-native-community/netinfo';

export enum ErrorType {
  NO_INTERNET = 'NO_INTERNET',
  SERVER_UNREACHABLE = 'SERVER_UNREACHABLE',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  title: string;
  message: string;
}

// Verificar conexión a internet
export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const netState = await NetInfo.fetch();
    return netState.isConnected === true && netState.isInternetReachable !== false;
  } catch {
    return false;
  }
};

// Mapear errores de la API a mensajes amigables
export const parseApiError = async (response: any, defaultMessage?: string): Promise<AppError> => {
  // Primero verificar si hay internet
  const hasInternet = await checkInternetConnection();
  
  if (!hasInternet) {
    return {
      type: ErrorType.NO_INTERNET,
      title: 'Sin conexión',
      message: 'No hay conexión a internet. Verifica tu conexión e intenta nuevamente.',
    };
  }

  // Si hay internet pero hubo error
  const errorMessage = response?.error?.toLowerCase() || '';
  
  // Error de credenciales incorrectas
  if (
    errorMessage.includes('credenciales') ||
    errorMessage.includes('usuario o contraseña') ||
    errorMessage.includes('invalid credentials') ||
    errorMessage.includes('password') ||
    errorMessage.includes('usuario no encontrado') ||
    errorMessage.includes('contraseña incorrecta') ||
    response?.status === 401
  ) {
    return {
      type: ErrorType.INVALID_CREDENTIALS,
      title: 'Credenciales incorrectas',
      message: 'El nombre de usuario o la contraseña son incorrectos. Por favor, verifica tus datos.',
    };
  }

  // Error de sesión expirada
  if (
    errorMessage.includes('sesión expirada') ||
    errorMessage.includes('session expired') ||
    errorMessage.includes('token expired')
  ) {
    return {
      type: ErrorType.SESSION_EXPIRED,
      title: 'Sesión expirada',
      message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    };
  }

  // Error de conexión con el servidor
  if (
    errorMessage.includes('error de conexión') ||
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('servidor')
  ) {
    return {
      type: ErrorType.SERVER_UNREACHABLE,
      title: 'Servidor no disponible',
      message: 'No se pudo conectar con el servidor. El servicio puede estar temporalmente fuera de línea. Intenta nuevamente en unos momentos.',
    };
  }

  // Error de validación
  if (
    errorMessage.includes('validación') ||
    errorMessage.includes('required') ||
    errorMessage.includes('requerido')
  ) {
    return {
      type: ErrorType.VALIDATION_ERROR,
      title: 'Error de validación',
      message: response?.error || defaultMessage || 'Por favor, verifica los datos ingresados.',
    };
  }

  // Error desconocido
  return {
    type: ErrorType.UNKNOWN,
    title: 'Error',
    message: response?.error || defaultMessage || 'Ocurrió un error inesperado. Intenta nuevamente.',
  };
};

// Mapear errores de fetch/red
export const parseNetworkError = async (error: any): Promise<AppError> => {
  const hasInternet = await checkInternetConnection();
  
  if (!hasInternet) {
    return {
      type: ErrorType.NO_INTERNET,
      title: 'Sin conexión',
      message: 'No hay conexión a internet. Verifica tu conexión e intenta nuevamente.',
    };
  }

  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('aborted')
  ) {
    return {
      type: ErrorType.SERVER_UNREACHABLE,
      title: 'Servidor no disponible',
      message: 'No se pudo conectar con el servidor. El servicio puede estar temporalmente fuera de línea. Intenta nuevamente en unos momentos.',
    };
  }

  return {
    type: ErrorType.UNKNOWN,
    title: 'Error',
    message: 'Ocurrió un error inesperado. Intenta nuevamente.',
  };
};
