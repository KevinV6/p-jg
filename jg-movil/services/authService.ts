import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/supabase';
import type { Usuario } from '../types';

export interface LoginCredentials {
  nombreusuario: string;
  contrasenia: string;
}

export interface RegisterData {
  nombreusuario: string;
  contrasenia: string;
  email?: string;
  primernombre: string;
  apellidopaterno: string;
  apellidomaterno?: string;
}

export interface AuthResponse {
  user: Usuario;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

class AuthService {
  async login(credentials: LoginCredentials) {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      await this.saveSession(response.data);
    }
    
    return response;
  }

  async register(data: RegisterData) {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    if (response.success && response.data) {
      await this.saveSession(response.data);
    }
    
    return response;
  }

  async logout() {
    const response = await api.post('/auth/logout');
    await this.clearSession();
    return response;
  }

  async getProfile() {
    return api.get<Usuario>('/auth/profile');
  }

  async updateProfile(data: Partial<Usuario>) {
    return api.put<Usuario>('/auth/profile', data);
  }

  async updateAvatar(file: any) {
    return api.uploadFile<Usuario>('/auth/profile/avatar', file);
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return api.put('/auth/change-password', { currentPassword, newPassword });
  }

  async requestPasswordReset(email: string) {
    return api.post('/auth/request-password-reset', { email });
  }

  private async saveSession(authData: AuthResponse) {
    console.log('[AuthService] Saving session:', {
      hasToken: !!authData.token,
      hasRefreshToken: !!authData.refreshToken,
      hasUser: !!authData.user,
      expiresAt: authData.expiresAt
    });
    
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, authData.token],
      [STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken],
      [STORAGE_KEYS.USER, JSON.stringify(authData.user)],
      [STORAGE_KEYS.EXPIRES_AT, authData.expiresAt],
    ]);
    
    // Verificar que se guardó correctamente
    const savedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    console.log('[AuthService] Session saved, verification:', {
      tokenSaved: !!savedToken
    });
  }

  private async clearSession() {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.EXPIRES_AT,
    ]);
  }

  async getStoredUser(): Promise<Usuario | null> {
    try {
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      console.log('[AuthService] getStoredUser - userStr:', userStr ? 'exists' : 'null');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('[AuthService] getStoredUser error:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const expiresAt = await AsyncStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
      
      console.log('[AuthService] isAuthenticated check:', {
        hasToken: !!token,
        expiresAt,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
      });
      
      if (!token || !expiresAt) {
        console.log('[AuthService] No token or expiry found');
        return false;
      }
      
      const expiry = new Date(expiresAt);
      const now = new Date();
      const isValid = expiry > now;
      
      console.log('[AuthService] Token validity:', {
        expiry: expiry.toISOString(),
        now: now.toISOString(),
        isValid
      });
      
      return isValid;
    } catch (error) {
      console.error('[AuthService] isAuthenticated error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;
