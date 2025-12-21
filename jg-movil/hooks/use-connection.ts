import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';

interface ConnectionState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isDatabaseConnected: boolean;
  lastChecked: Date | null;
  error: string | null;
}

// ============================================
// SINGLETON: Estado global de conexión
// Evita múltiples instancias y checks repetidos
// ============================================
class ConnectionManager {
  private static instance: ConnectionManager;
  private state: ConnectionState = {
    isConnected: true,
    isInternetReachable: null,
    isDatabaseConnected: true,
    lastChecked: null,
    error: null,
  };
  private isChecking = false;
  private lastCheckTime = 0;
  private listeners: Set<(state: ConnectionState) => void> = new Set();
  private unsubscribeNetInfo: (() => void) | null = null;
  private initialized = false;

  // Tiempo mínimo entre checks: 60 segundos
  private readonly MIN_CHECK_INTERVAL = 60000;

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  getState(): ConnectionState {
    return { ...this.state };
  }

  isFullyConnected(): boolean {
    return this.state.isConnected && this.state.isDatabaseConnected;
  }

  subscribe(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    // Inicializar monitoreo solo una vez
    if (!this.initialized) {
      this.init();
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  private updateState(partial: Partial<ConnectionState>) {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.success === true;
    } catch (error) {
      return false;
    }
  }

  async checkConnection(force = false): Promise<boolean> {
    const now = Date.now();
    
    // Throttle: solo verificar si pasó suficiente tiempo o es forzado
    if (!force && now - this.lastCheckTime < this.MIN_CHECK_INTERVAL) {
      return this.isFullyConnected();
    }

    if (this.isChecking) {
      return this.isFullyConnected();
    }

    this.isChecking = true;
    this.lastCheckTime = now;

    try {
      // Verificar internet
      const netState = await NetInfo.fetch();
      const hasInternet = netState.isConnected && netState.isInternetReachable !== false;

      if (!hasInternet) {
        this.updateState({
          isConnected: false,
          isInternetReachable: false,
          isDatabaseConnected: false,
          lastChecked: new Date(),
          error: 'Sin conexión a Internet',
        });
        this.isChecking = false;
        return false;
      }

      // Verificar base de datos
      const dbConnected = await this.checkDatabaseConnection();
      
      this.updateState({
        isConnected: netState.isConnected || false,
        isInternetReachable: netState.isInternetReachable,
        isDatabaseConnected: dbConnected,
        lastChecked: new Date(),
        error: dbConnected ? null : 'No se puede conectar al servidor',
      });

      if (!dbConnected) {
        console.log('[Connection] ⚠️ Sin conexión a la base de datos');
      }

      this.isChecking = false;
      return hasInternet && dbConnected;
    } catch (error) {
      this.updateState({
        lastChecked: new Date(),
        error: 'Error al verificar conexión',
      });
      this.isChecking = false;
      return false;
    }
  }

  private init() {
    if (this.initialized) return;
    this.initialized = true;

    console.log('[Connection] 🔄 Inicializando monitor de conexión');

    // Verificación inicial
    this.checkConnection(true).then(connected => {
      console.log(`[Connection] ${connected ? '✅ Conectado' : '❌ Sin conexión'}`);
    });

    // Escuchar cambios de red (solo cambios significativos)
    let previousConnected: boolean | null = null;

    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const currentConnected = state.isConnected && state.isInternetReachable !== false;
      
      // Solo actuar si hay un cambio real de estado
      if (previousConnected !== currentConnected) {
        previousConnected = currentConnected;
        
        console.log(`[Connection] 📶 Red: ${currentConnected ? 'conectado' : 'desconectado'}`);
        
        this.updateState({
          isConnected: state.isConnected || false,
          isInternetReachable: state.isInternetReachable,
        });

        // Solo verificar BD si pasamos de desconectado a conectado
        if (currentConnected && !this.state.isDatabaseConnected) {
          this.checkConnection(true);
        } else if (!currentConnected) {
          this.updateState({
            isDatabaseConnected: false,
            error: 'Sin conexión a Internet',
          });
        }
      }
    });
  }

  cleanup() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
    this.initialized = false;
    this.listeners.clear();
  }
}

// ============================================
// HOOK: useConnection
// ============================================
export const useConnection = () => {
  const manager = ConnectionManager.getInstance();
  const [connectionState, setConnectionState] = useState<ConnectionState>(manager.getState());
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Suscribirse a cambios de estado
    const unsubscribe = manager.subscribe((newState) => {
      setConnectionState(newState);
    });

    return unsubscribe;
  }, []);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    const result = await manager.checkConnection(true);
    setIsChecking(false);
    return result;
  }, []);

  return {
    ...connectionState,
    isFullyConnected: manager.isFullyConnected(),
    checkConnection,
    isChecking,
  };
};
