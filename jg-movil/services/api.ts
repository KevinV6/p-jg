import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { API_URL, STORAGE_KEYS } from '../config/supabase';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
  timeout?: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errorType?: 'NO_INTERNET' | 'SERVER_UNREACHABLE' | 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED' | 'UNKNOWN';
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch {
      return null;
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch {
      return null;
    }
  }

  private async saveTokens(token: string, refreshToken: string, expiresAt: string): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, token],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      [STORAGE_KEYS.EXPIRES_AT, expiresAt],
    ]);
  }

  private async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.EXPIRES_AT,
    ]);
  }

  private async refreshTokens(): Promise<boolean> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        await this.saveTokens(
          data.data.token,
          data.data.refreshToken,
          data.data.expiresAt
        );
        return true;
      }

      await this.clearTokens();
      return false;
    } catch {
      await this.clearTokens();
      return false;
    }
  }

  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {}, isFormData = false, timeout = 30000 } = options;

    // Verificar conexión a internet primero
    try {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected || netState.isInternetReachable === false) {
        return {
          success: false,
          error: 'No hay conexión a internet. Verifica tu conexión e intenta nuevamente.',
          errorType: 'NO_INTERNET',
        };
      }
    } catch {
      // Si falla verificar, continuar e intentar la petición
    }

    const token = await this.getToken();

    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    // Crear timeout con AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    try {
      let response = await fetch(`${this.baseUrl}${endpoint}`, config);
      clearTimeout(timeoutId);

      const data = await response.json();
      
      // Si es 401, determinar si es credenciales incorrectas o sesión expirada
      if (response.status === 401) {
        const errorLower = (data.error || '').toLowerCase();
        
        // Verificar si es un error de credenciales (login fallido)
        if (
          errorLower.includes('credenciales') || 
          errorLower.includes('contraseña') || 
          errorLower.includes('usuario') ||
          errorLower.includes('incorrectos') ||
          endpoint.includes('/auth/login')
        ) {
          return {
            ...data,
            error: 'El nombre de usuario o la contraseña son incorrectos.',
            errorType: 'INVALID_CREDENTIALS',
          };
        }
        
        // Si no es login, intentar refrescar token (sesión expirada)
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          const newToken = await this.getToken();
          if (newToken) {
            requestHeaders['Authorization'] = `Bearer ${newToken}`;
            config.headers = requestHeaders;
            const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, config);
            return await retryResponse.json();
          }
        }
        
        // Token no se pudo refrescar, limpiar sesión
        await this.clearTokens();
        return {
          success: false,
          error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          errorType: 'SESSION_EXPIRED',
        };
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      // Usar warn en lugar de error porque estos errores son manejados
      console.warn('[API] Error de conexión:', error.message || error);
      
      // Error de timeout o abort
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'El servidor no responde. El servicio puede estar temporalmente fuera de línea.',
          errorType: 'SERVER_UNREACHABLE',
        };
      }

      // Error de red
      if (error.message?.includes('Network') || error.message?.includes('fetch')) {
        // Re-verificar internet
        const netState = await NetInfo.fetch();
        if (!netState.isConnected || netState.isInternetReachable === false) {
          return {
            success: false,
            error: 'No hay conexión a internet. Verifica tu conexión e intenta nuevamente.',
            errorType: 'NO_INTERNET',
          };
        }
        return {
          success: false,
          error: 'No se pudo conectar con el servidor. El servicio puede estar temporalmente fuera de línea.',
          errorType: 'SERVER_UNREACHABLE',
        };
      }

      return {
        success: false,
        error: 'Ocurrió un error inesperado. Intenta nuevamente.',
        errorType: 'UNKNOWN',
      };
    }
  }

  // Métodos de conveniencia
  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  put<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T = any>(endpoint: string, file: any, fieldName = 'imagen') {
    const formData = new FormData();
    formData.append(fieldName, {
      uri: file.uri,
      type: file.mimeType || 'image/jpeg',
      name: file.fileName || 'image.jpg',
    } as any);

    return this.request<T>(endpoint, {
      method: 'PUT',
      body: formData,
      isFormData: true,
    });
  }
}

export const api = new ApiService();
export default api;
