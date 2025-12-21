import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, STORAGE_KEYS } from '../config/supabase';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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
    const { method = 'GET', body, headers = {}, isFormData = false } = options;

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

    try {
      let response = await fetch(`${this.baseUrl}${endpoint}`, config);

      // Si el token expiró, intentar refrescar
      if (response.status === 401) {
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          const newToken = await this.getToken();
          if (newToken) {
            requestHeaders['Authorization'] = `Bearer ${newToken}`;
            config.headers = requestHeaders;
            response = await fetch(`${this.baseUrl}${endpoint}`, config);
          }
        } else {
          // Token no se pudo refrescar, limpiar sesión
          await this.clearTokens();
          return {
            success: false,
            error: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          };
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: 'Error de conexión. Verifica tu internet.',
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
