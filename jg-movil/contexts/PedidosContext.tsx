import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Pedido, Venta } from '@/types/types';
import { pedidoService, PedidoFilters, PedidoCreateData } from '@/services/pedidoService';

interface PedidosContextData {
  pedidos: Pedido[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loadPedidos: (filters?: PedidoFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  addPedido: (pedido: PedidoCreateData) => Promise<Pedido | null>;
  updatePedido: (id: number, pedido: Partial<PedidoCreateData>) => Promise<boolean>;
  deletePedido: (id: number) => Promise<boolean>;
  getPedidoById: (id: number) => Promise<Pedido | null>;
  getPedidosPendientes: () => Pedido[];
  cambiarEstado: (id: number, estado: string) => Promise<boolean>;
  confirmarPedido: (id: number) => Promise<boolean>;
  cancelarPedido: (id: number, motivo?: string) => Promise<boolean>;
  convertirAVenta: (id: number, tipo_pago: 'contado' | 'credito', clienteid?: number) => Promise<Venta | null>;
  clearError: () => void;
}

const PedidosContext = createContext<PedidosContextData>({} as PedidosContextData);

export const PedidosProvider = ({ children }: { children: ReactNode }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<PedidoFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const loadPedidos = useCallback(async (filters: PedidoFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentFilters(filters);

      const response = await pedidoService.getAll({ ...filters, page: 1 });

      if (response.success) {
        setPedidos(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.error || 'Error al cargar pedidos');
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
      const response = await pedidoService.getAll({ ...currentFilters, page: nextPage });

      if (response.success && response.data) {
        setPedidos(prev => [...prev, ...response.data!]);
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
    await loadPedidos(currentFilters);
  }, [loadPedidos, currentFilters]);

  const addPedido = async (pedidoData: PedidoCreateData): Promise<Pedido | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await pedidoService.create(pedidoData);

      if (response.success && response.data) {
        setPedidos(prev => [response.data!, ...prev]);
        return response.data;
      }

      setError(response.error || 'Error al crear pedido');
      return null;
    } catch (err) {
      setError('Error de conexión');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePedido = async (id: number, pedidoData: Partial<PedidoCreateData>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await pedidoService.update(id, pedidoData);

      if (response.success && response.data) {
        setPedidos(prev =>
          prev.map(p => p.idpedido === id ? response.data! : p)
        );
        return true;
      }

      setError(response.error || 'Error al actualizar pedido');
      return false;
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePedido = async (id: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await pedidoService.remove(id);

      if (response.success) {
        setPedidos(prev => prev.filter(p => p.idpedido !== id));
        return true;
      }

      setError(response.error || 'Error al eliminar pedido');
      return false;
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getPedidoById = async (id: number): Promise<Pedido | null> => {
    try {
      const response = await pedidoService.getById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  const getPedidosPendientes = (): Pedido[] => {
    return pedidos.filter((p) => p.estado_pedido === 'pendiente');
  };

  const cambiarEstado = async (id: number, estado: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await pedidoService.cambiarEstado(id, estado);

      if (response.success) {
        setPedidos(prev =>
          prev.map(p => p.idpedido === id ? { ...p, estado_pedido: estado as any } : p)
        );
        return true;
      }

      setError(response.error || 'Error al cambiar estado');
      return false;
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmarPedido = async (id: number): Promise<boolean> => {
    return cambiarEstado(id, 'en_proceso');
  };

  const cancelarPedido = async (id: number, motivo?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await pedidoService.cancelar(id, motivo);

      if (response.success) {
        setPedidos(prev =>
          prev.map(p => p.idpedido === id ? { ...p, estado_pedido: 'cancelado' } : p)
        );
        return true;
      }

      setError(response.error || 'Error al cancelar pedido');
      return false;
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const convertirAVenta = async (id: number, tipo_pago: 'contado' | 'credito', clienteid?: number): Promise<Venta | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await pedidoService.convertirAVenta(id, tipo_pago, clienteid);

      if (response.success && response.data) {
        // Actualizar estado del pedido a completado
        setPedidos(prev =>
          prev.map(p => p.idpedido === id ? { ...p, estado_pedido: 'completado' } : p)
        );
        return response.data as any;
      }

      setError(response.error || 'Error al convertir a venta');
      return null;
    } catch (err) {
      setError('Error de conexión');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    loadPedidos();
  }, []);

  return (
    <PedidosContext.Provider
      value={{
        pedidos,
        isLoading,
        error,
        pagination,
        loadPedidos,
        loadMore,
        refresh,
        addPedido,
        updatePedido,
        deletePedido,
        getPedidoById,
        getPedidosPendientes,
        cambiarEstado,
        confirmarPedido,
        cancelarPedido,
        convertirAVenta,
        clearError,
      }}
    >
      {children}
    </PedidosContext.Provider>
  );
};

export const usePedidos = () => {
  const context = useContext(PedidosContext);
  if (!context) {
    throw new Error('usePedidos debe usarse dentro de PedidosProvider');
  }
  return context;
};
