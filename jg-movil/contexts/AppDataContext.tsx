import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useVentas } from './VentasContext';
import { useCobros } from './CobrosContext';
import { useInventario } from './InventarioContext';

interface AppDataContextData {
  isDataLoaded: boolean;
  isLoadingData: boolean;
  refreshAllData: () => Promise<void>;
  lastRefresh: Date | null;
}

const AppDataContext = createContext<AppDataContextData>({} as AppDataContextData);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { loadVentas, loadClientes, loadResumen: loadVentasResumen } = useVentas();
  const { loadCobros, loadResumen: loadCobrosResumen } = useCobros();
  const { loadProductos, loadCategorias, loadUnidades } = useInventario();

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [previousAuthState, setPreviousAuthState] = useState<boolean | null>(null);

  // Función para cargar todos los datos
  const loadAllData = useCallback(async () => {
    if (isLoadingData) return;
    
    console.log('[AppDataContext] Iniciando carga de todos los datos...');
    setIsLoadingData(true);

    try {
      // Cargar todos los datos en paralelo para mayor eficiencia
      await Promise.all([
        // Inventario
        loadProductos(),
        loadCategorias(),
        loadUnidades(),
        // Ventas
        loadVentas(),
        loadClientes(),
        loadVentasResumen(),
        // Cobros
        loadCobros(),
        loadCobrosResumen(),
      ]);

      console.log('[AppDataContext] ✅ Todos los datos cargados exitosamente');
      setIsDataLoaded(true);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('[AppDataContext] ❌ Error cargando datos:', error);
      // Aún así marcamos como cargado para no bloquear la UI
      setIsDataLoaded(true);
    } finally {
      setIsLoadingData(false);
    }
  }, [
    isLoadingData,
    loadProductos,
    loadCategorias,
    loadUnidades,
    loadVentas,
    loadClientes,
    loadVentasResumen,
    loadCobros,
    loadCobrosResumen,
  ]);

  // Función pública para refrescar todos los datos
  const refreshAllData = useCallback(async () => {
    console.log('[AppDataContext] Refrescando todos los datos manualmente...');
    setIsDataLoaded(false);
    await loadAllData();
  }, [loadAllData]);

  // Detectar cambio de estado de autenticación
  useEffect(() => {
    // Solo actuar cuando authLoading termina
    if (authLoading) return;

    const wasAuthenticated = previousAuthState;
    const nowAuthenticated = isAuthenticated && !!user;

    // Detectar transición: no autenticado -> autenticado (login exitoso)
    if (!wasAuthenticated && nowAuthenticated) {
      console.log('[AppDataContext] 🔐 Usuario autenticado detectado, cargando datos...');
      loadAllData();
    }

    // Detectar transición: autenticado -> no autenticado (logout)
    if (wasAuthenticated && !nowAuthenticated) {
      console.log('[AppDataContext] 🚪 Usuario deslogueado, limpiando estado...');
      setIsDataLoaded(false);
      setLastRefresh(null);
    }

    // Actualizar estado anterior
    setPreviousAuthState(nowAuthenticated);
  }, [isAuthenticated, user, authLoading, previousAuthState, loadAllData]);

  // Cargar datos si el usuario ya está autenticado al iniciar (restauración de sesión)
  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !isDataLoaded && !isLoadingData) {
      console.log('[AppDataContext] 🔄 Sesión restaurada, cargando datos iniciales...');
      loadAllData();
    }
  }, [authLoading, isAuthenticated, user, isDataLoaded, isLoadingData, loadAllData]);

  return (
    <AppDataContext.Provider
      value={{
        isDataLoaded,
        isLoadingData,
        refreshAllData,
        lastRefresh,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
