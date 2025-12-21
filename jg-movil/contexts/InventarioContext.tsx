import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import type { Producto, Categoria, UnidadMedida } from '@/types/types';
import { productoService, ProductoFilters, ProductoCreateData } from '@/services/productoService';
import { realtimeService } from '@/services/realtimeService';

interface InventarioContextData {
  productos: Producto[];
  categorias: Categoria[];
  unidades: UnidadMedida[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loadProductos: (filters?: ProductoFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  addProducto: (producto: ProductoCreateData) => Promise<boolean>;
  updateProducto: (id: number, producto: Partial<ProductoCreateData>) => Promise<boolean>;
  deleteProducto: (id: number) => Promise<boolean>;
  getProductoById: (id: number) => Promise<Producto | null>;
  searchProductos: (query: string) => Producto[]; // Búsqueda local
  searchProductosAPI: (query: string) => Promise<void>; // Búsqueda API
  loadCategorias: () => Promise<void>;
  loadUnidades: () => Promise<void>;
  clearError: () => void;
}

const InventarioContext = createContext<InventarioContextData>({} as InventarioContextData);

export const InventarioProvider = ({ children }: { children: ReactNode }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ProductoFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const loadProductos = useCallback(async (filters: ProductoFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentFilters(filters);

      const response = await productoService.getAll({ ...filters, page: 1 });

      if (response.success) {
        setProductos(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.error || 'Error al cargar productos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoading || pagination.page >= pagination.totalPages) return;

    try {
      setIsLoading(true);
      const nextPage = pagination.page + 1;
      const response = await productoService.getAll({ ...currentFilters, page: nextPage });

      if (response.success && response.data) {
        setProductos(prev => [...prev, ...response.data!]);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      console.error('Error loading more:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pagination, currentFilters]);

  const refresh = useCallback(async () => {
    await loadProductos(currentFilters);
  }, [loadProductos, currentFilters]);

  const addProducto = async (productoData: ProductoCreateData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productoService.create(productoData);

      if (response.success && response.data) {
        setProductos(prev => [response.data!, ...prev]);
        return true;
      }

      setError(response.error || 'Error al crear producto');
      return false;
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProducto = async (id: number, productoData: Partial<ProductoCreateData>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productoService.update(id, productoData);

      if (response.success && response.data) {
        setProductos(prev =>
          prev.map(p => p.idproducto === id ? response.data! : p)
        );
        return true;
      }

      setError(response.error || 'Error al actualizar producto');
      return false;
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProducto = async (id: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productoService.remove(id);

      if (response.success) {
        setProductos(prev => prev.filter(p => p.idproducto !== id));
        return true;
      }

      setError(response.error || 'Error al eliminar producto');
      return false;
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getProductoById = async (id: number): Promise<Producto | null> => {
    try {
      const response = await productoService.getById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  const searchProductos = (query: string): Producto[] => {
    if (!query.trim()) return productos;
    const lowerQuery = query.toLowerCase();
    return productos.filter(p =>
      p.nombreproducto.toLowerCase().includes(lowerQuery) ||
      p.descripcion?.toLowerCase().includes(lowerQuery) ||
      p.codigoproducto?.toLowerCase().includes(lowerQuery)
    );
  };

  const searchProductosAPI = async (query: string): Promise<void> => {
    await loadProductos({ ...currentFilters, search: query });
  };

  const loadCategorias = async () => {
    try {
      const response = await productoService.getCategorias();
      if (response.success && response.data) {
        setCategorias(response.data);
      }
    } catch (err) {
      console.error('Error loading categorias:', err);
    }
  };

  const loadUnidades = async () => {
    try {
      const response = await productoService.getUnidades();
      if (response.success && response.data) {
        setUnidades(response.data);
      }
    } catch (err) {
      console.error('Error loading unidades:', err);
    }
  };

  const clearError = () => setError(null);

  // Referencia para controlar suscripciones
  const realtimeChannelIds = useRef<string[]>([]);

  // Cargar datos iniciales y suscribirse a cambios en tiempo real
  useEffect(() => {
    loadProductos();
    loadCategorias();
    loadUnidades();

    // Suscribirse a cambios en tiempo real en la tabla producto
    const channelIds = realtimeService.subscribeToMultiple(
      ['producto', 'variante', 'opcionvariante'],
      (table, payload) => {
        console.log(`[InventarioContext] Cambio detectado en ${table}:`, payload.eventType);
        
        // Recargar productos cuando hay cambios
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
          // Usar timeout para evitar múltiples recargas simultáneas
          setTimeout(() => {
            loadProductos(currentFilters);
          }, 500);
        }
      }
    );

    realtimeChannelIds.current = channelIds;

    // Cleanup: desuscribirse al desmontar
    return () => {
      realtimeChannelIds.current.forEach(id => {
        realtimeService.unsubscribe(id);
      });
    };
  }, []);

  return (
    <InventarioContext.Provider
      value={{
        productos,
        categorias,
        unidades,
        isLoading,
        error,
        pagination,
        loadProductos,
        loadMore,
        refresh,
        addProducto,
        updateProducto,
        deleteProducto,
        getProductoById,
        searchProductos,
        searchProductosAPI,
        loadCategorias,
        loadUnidades,
        clearError,
      }}
    >
      {children}
    </InventarioContext.Provider>
  );
};

export const useInventario = () => {
  const context = useContext(InventarioContext);
  if (!context) {
    throw new Error('useInventario debe usarse dentro de InventarioProvider');
  }
  return context;
};
