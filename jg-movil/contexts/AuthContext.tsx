import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '@/types';
import { mockUsuarios } from '@/data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextData {
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: Partial<Usuario>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<Usuario>) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    // Cargar usuario guardado al iniciar
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Buscar usuario en datos mock
      const foundUser = mockUsuarios.find(
        (u) => u.nombreusuario === username && u.contrasenia === password
      );

      if (foundUser) {
        setUser(foundUser);
        await AsyncStorage.setItem('user', JSON.stringify(foundUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const register = async (userData: Partial<Usuario>): Promise<boolean> => {
    try {
      // En producción, aquí iría la llamada al backend
      const newUser: Usuario = {
        idusuario: mockUsuarios.length + 1,
        nombreusuario: userData.nombreusuario || '',
        contrasenia: userData.contrasenia || '',
        primernombre: userData.primernombre || '',
        apellidopaterno: userData.apellidopaterno || '',
        apellidomaterno: userData.apellidomaterno,
        rol: 'vendedor',
        photo: 'https://i.pravatar.cc/150?img=' + (mockUsuarios.length + 1),
        estado: 1,
        fecharegistro: new Date(),
      };

      mockUsuarios.push(newUser);
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Error en registro:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const updateUser = (userData: Partial<Usuario>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
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
