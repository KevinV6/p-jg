import React, { createContext, ReactNode, useContext, useState, useEffect, useCallback } from 'react';
import type { Cobro } from '@/types/types';
import { cobroService, CobroFilters, CobroCreateData, CobroResumen } from '@/services/cobroService';

interface CobrosContextData {
  cobros: Cobro[];
  isLoading: boolean;
  error: string | null;
  resumen: CobroResumen | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loadCobros: (filters?: CobroFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  loadResumen: () => Promise<void>;
  addCobro: (cobro: CobroCreateData) => Promise<Cobro | null>;
  updateCobro: (id: number, cobro: Partial<CobroCreateData>) => Promise<boolean>;
  deleteCobro: (id: number) => Promise<boolean>;
  getCobroById: (id: number) => Promise<Cobro | null>;
  getCobrosPendientes: () => Cobro[];
  marcarComoPagado: (id: number, monto_pagado?: number, notas?: string) => Promise<boolean>;
  getCobrosVencidos: () => Cobro[];
  clearError: () => void;
}

const CobrosContext = createContext<CobrosContextData>({} as CobrosContextData);

export const CobrosProvider = ({ children }: { children: ReactNode }) => {
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<CobroResumen | null>(null);
  const [currentFilters, setCurrentFilters] = useState<CobroFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const loadCobros = useCallback(async (filters: CobroFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentFilters(filters);

      const response = await cobroService.getAll({ ...filters, page: 1 });

      if (response.success) {
        setCobros(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.error || 'Error al cargar cobros');
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
      const response = await cobroService.getAll({ ...currentFilters, page: nextPage });

      if (response.success && response.data) {
        setCobros(prev => [...prev, ...response.data!]);
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
    await loadCobros(currentFilters);
  }, [loadCobros, currentFilters]);

  const loadResumen = async () => {
    try {
      const response = await cobroService.getResumen();
      if (response.success && response.data) {
        setResumen(response.data);
      }
    } catch (err) {
      console.error('Error loading resumen:', err);
    }
  };

  const addCobro = async (cobroData: CobroCreateData): Promise<Cobro | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await cobroService.create(cobroData);

      if (response.success && response.data) {
        setCobros(prev => [response.data!, ...prev]);
        return response.data;
      }

      setError(response.error || 'Error al crear cobro');
      return null;
    } catch (err) {
      setError('Error de conexión');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCobro = async (id: number, cobroData: Partial<CobroCreateData>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await cobroService.update(id, cobroData);

      if (response.success && response.data) {
        setCobros(prev =>
          prev.map(c => c.idcobro === id ? response.data! : c)
        );
        return true;
      }

      setError(response.error || 'Error al actualizar cobro');
      return false;
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCobro = async (id: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await cobroService.anular(id);

      if (response.success) {
        setCobros(prev => prev.map(c => 
          c.idcobro === id ? { ...c, estado: 0 } : c
        ));
        return true;
      }

      setError(response.error || 'Error al anular cobro');
      return false;
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCobroById = async (id: number): Promise<Cobro | null> => {
    try {
      const response = await cobroService.getById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  const getCobrosPendientes = (): Cobro[] => {
    return cobros.filter((c) => c.estado === 1);
  };

  const marcarComoPagado = async (id: number, monto_pagado?: number, notas?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await cobroService.marcarPagado(id, monto_pagado, notas);

      if (response.success && response.data) {
        setCobros(prev =>
          prev.map(c => c.idcobro === id ? response.data! : c)
        );
        return true;
      }

      setError(response.error || 'Error al marcar como pagado');
      return false;
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCobrosVencidos = (): Cobro[] => {
    const now = new Date();
    return cobros.filter((c) => {
      if (c.estado !== 1) return false;
      if (!c.fecha_vencimiento) return false;
      return new Date(c.fecha_vencimiento) < now;
    });
  };

  const clearError = () => setError(null);

  useEffect(() => {
    loadCobros();
    loadResumen();
  }, []);

  return (
    <CobrosContext.Provider
      value={{
        cobros,
        isLoading,
        error,
        resumen,
        pagination,
        loadCobros,
        loadMore,
        refresh,
        loadResumen,
        addCobro,
        updateCobro,
        deleteCobro,
        getCobroById,
        getCobrosPendientes,
        marcarComoPagado,
        getCobrosVencidos,
        clearError,
      }}
    >
      {children}
    </CobrosContext.Provider>
  );
};

export const useCobros = () => {
  const context = useContext(CobrosContext);
  if (!context) {
    throw new Error('useCobros debe usarse dentro de CobrosProvider');
  }
  return context;
};
