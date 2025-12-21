import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Usuario } from '@/types/types';
import { authService, RegisterData, LoginCredentials } from '@/services/authService';

interface AuthContextData {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<Usuario>) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      console.log('[AuthContext] Starting checkAuth...');
      
      const isAuth = await authService.isAuthenticated();
      console.log('[AuthContext] isAuthenticated result:', isAuth);
      
      if (isAuth) {
        const storedUser = await authService.getStoredUser();
        console.log('[AuthContext] storedUser:', storedUser ? 'found' : 'null');
        
        if (storedUser) {
          setUser(storedUser);
          // Verificar que el usuario sigue siendo válido
          try {
            const response = await authService.getProfile();
            console.log('[AuthContext] getProfile response:', response.success);
            if (response.success && response.data) {
              setUser(response.data);
            }
          } catch (profileError) {
            console.log('[AuthContext] Error getting profile, keeping stored user:', profileError);
            // Si falla obtener el perfil, mantener el usuario guardado
          }
        }
      } else {
        console.log('[AuthContext] Not authenticated, user will be null');
      }
    } catch (err) {
      console.error('[AuthContext] Error checking auth:', err);
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] checkAuth finished');
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      }
      
      setError(response.error || 'Error al iniciar sesión');
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de conexión';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      }
      
      setError(response.error || 'Error al registrar usuario');
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de conexión';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Error en logout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<Usuario>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.updateProfile(userData);
      
      if (response.success && response.data) {
        setUser(response.data);
        return true;
      }
      
      setError(response.error || 'Error al actualizar perfil');
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de conexión';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
