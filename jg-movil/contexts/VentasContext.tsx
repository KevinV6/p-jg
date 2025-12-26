import React, { createContext, ReactNode, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import type { Venta, Cliente, CarritoItem } from '@/types/types';
import { ventaService, VentaFilters, VentaCreateData, VentaResumen } from '@/services/ventaService';
import { clienteService } from '@/services/clienteService';
import { realtimeService } from '@/services/realtimeService';
import { executeWithConnection } from '@/utils/connection';

interface VentasContextData {
  ventas: Venta[];
  clientes: Cliente[];
  carrito: CarritoItem[];
  isLoading: boolean;
  error: string | null;
  resumen: VentaResumen | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loadVentas: (filters?: VentaFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  loadClientes: (search?: string) => Promise<void>;
  loadResumen: () => Promise<void>;
  crearVenta: (data: VentaCreateData) => Promise<Venta | null>;
  anularVenta: (id: number, motivo?: string) => Promise<boolean>;
  getVentaById: (id: number) => Promise<Venta | null>;
  getVentaByFolio: (folio: string) => Promise<Venta | null>;
  // Helpers para compatibilidad
  getVentasRecientes: (count?: number) => Venta[];
  getTotalVentas: () => number;
  // Carrito
  agregarAlCarrito: (item: CarritoItem) => void;
  quitarDelCarrito: (productoid: number) => void;
  actualizarCantidad: (productoid: number, cantidad: number) => void;
  limpiarCarrito: () => void;
  getTotalCarrito: () => number;
  clearError: () => void;
}

const VentasContext = createContext<VentasContextData>({} as VentasContextData);

export const VentasProvider = ({ children }: { children: ReactNode }) => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<VentaResumen | null>(null);
  const [currentFilters, setCurrentFilters] = useState<VentaFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const loadVentas = useCallback(async (filters: VentaFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentFilters(filters);

      const response = await ventaService.getAll({ ...filters, page: 1 });

      if (response.success) {
        setVentas(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.error || 'Error al cargar ventas');
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
      const response = await ventaService.getAll({ ...currentFilters, page: nextPage });

      if (response.success && response.data) {
        setVentas(prev => [...prev, ...response.data!]);
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
    await loadVentas(currentFilters);
  }, [loadVentas, currentFilters]);

  const loadClientes = async (search?: string) => {
    try {
      const response = await clienteService.getAll({ search, limit: 100 });
      if (response.success && response.data) {
        setClientes(response.data);
      }
    } catch (err) {
      console.error('Error loading clientes:', err);
    }
  };

  const loadResumen = async () => {
    try {
      const response = await ventaService.getResumen();
      if (response.success && response.data) {
        setResumen(response.data);
      }
    } catch (err) {
      console.error('Error loading resumen:', err);
    }
  };

  const crearVenta = async (data: VentaCreateData): Promise<Venta | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[VentasContext] crearVenta - Datos recibidos:', JSON.stringify(data, null, 2));

      // Ejecutar con verificación de conexión y reintentos automáticos
      const response = await executeWithConnection(
        () => ventaService.create(data),
        {
          maxRetries: 3,
          onConnectionCheck: (connected) => {
            console.log('[VentasContext] Verificación de conexión:', connected);
            if (!connected) {
              setError('No hay conexión a internet');
            }
          },
          onRetry: (attempt, error) => {
            console.log(`[VentasContext] Reintento ${attempt}/3 - Error:`, error?.message);
          }
        }
      );

      console.log('[VentasContext] crearVenta - Respuesta del servidor:', JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        console.log('[VentasContext] crearVenta - ÉXITO, venta creada:', response.data.idventa);
        setVentas(prev => [response.data!, ...prev]);
        limpiarCarrito();
        
        // Recargar resumen después de crear venta
        loadResumen();
        
        // Si es venta a crédito, notificar a otros contextos que se actualicen
        if (data.tipo_pago === 'credito') {
          console.log('[VentasContext] Venta a crédito - triggering cobros refresh');
          // Disparar evento para actualizar cobros
          setTimeout(() => {
            DeviceEventEmitter.emit('ventaCreditoCreada');
          }, 500);
        }
        
        return response.data;
      }

      console.warn('[VentasContext] crearVenta - ERROR:', response.error);
      setError(response.error || 'Error al crear venta');
      return null;
    } catch (err: any) {
      console.warn('[VentasContext] crearVenta - EXCEPCIÓN:', err);
      setError(err?.message || 'Error de conexión. Por favor verifica tu conexión a internet e intenta nuevamente.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const anularVenta = async (id: number, motivo?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ventaService.anular(id, motivo);

      if (response.success) {
        setVentas(prev => prev.map(v => 
          v.idventa === id ? { ...v, estado: 0 } : v
        ));
        return true;
      }

      setError(response.error || 'Error al anular venta');
      return false;
    } catch (err) {
      setError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getVentaById = async (id: number): Promise<Venta | null> => {
    try {
      const response = await ventaService.getById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  const getVentaByFolio = async (folio: string): Promise<Venta | null> => {
    try {
      const response = await ventaService.getByFolio(folio);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Métodos del carrito
  const agregarAlCarrito = (item: CarritoItem) => {
    setCarrito(prev => {
      const existente = prev.find(i => i.producto.idproducto === item.producto.idproducto);
      if (existente) {
        return prev.map(i =>
          i.producto.idproducto === item.producto.idproducto
            ? { ...i, cantidad: i.cantidad + item.cantidad, subtotal: (i.cantidad + item.cantidad) * i.precio_unitario - i.descuento }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const quitarDelCarrito = (productoid: number) => {
    setCarrito(prev => prev.filter(i => i.producto.idproducto !== productoid));
  };

  const actualizarCantidad = (productoid: number, cantidad: number) => {
    if (cantidad <= 0) {
      quitarDelCarrito(productoid);
      return;
    }
    setCarrito(prev =>
      prev.map(i =>
        i.producto.idproducto === productoid
          ? { ...i, cantidad, subtotal: cantidad * i.precio_unitario - i.descuento }
          : i
      )
    );
  };

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  const getTotalCarrito = (): number => {
    return carrito.reduce((sum, item) => sum + item.subtotal, 0);
  };

  // Helpers para compatibilidad con pantallas existentes
  const getVentasRecientes = (count: number = 5): Venta[] => {
    return ventas
      .filter(v => v.estado === 1)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, count);
  };

  const getTotalVentas = (): number => {
    // Usar el total del mes del resumen, o calcular desde ventas cargadas
    return resumen?.mes?.total || ventas
      .filter(v => v.estado === 1)
      .reduce((sum, v) => sum + v.total, 0);
  };

  const clearError = () => setError(null);

  // Referencia para controlar suscripciones
  const realtimeChannelIds = useRef<string[]>([]);

  useEffect(() => {
    loadVentas();
    loadClientes();
    loadResumen();

    // Suscribirse a cambios en tiempo real
    const channelIds = realtimeService.subscribeToMultiple(
      ['venta', 'cliente'],
      (table, payload) => {
        console.log(`[VentasContext] Cambio detectado en ${table}:`, payload.eventType);
        
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
          setTimeout(() => {
            if (table === 'venta') {
              loadVentas(currentFilters);
              loadResumen();
            } else if (table === 'cliente') {
              loadClientes();
            }
          }, 500);
        }
      }
    );

    realtimeChannelIds.current = channelIds;

    // Cleanup
    return () => {
      realtimeChannelIds.current.forEach(id => {
        realtimeService.unsubscribe(id);
      });
    };
  }, []);

  return (
    <VentasContext.Provider
      value={{
        ventas,
        clientes,
        carrito,
        isLoading,
        error,
        resumen,
        pagination,
        loadVentas,
        loadMore,
        refresh,
        loadClientes,
        loadResumen,
        crearVenta,
        anularVenta,
        getVentaById,
        getVentaByFolio,
        agregarAlCarrito,
        quitarDelCarrito,
        actualizarCantidad,
        limpiarCarrito,
        getTotalCarrito,
        getVentasRecientes,
        getTotalVentas,
        clearError,
      }}
    >
      {children}
    </VentasContext.Provider>
  );
};

export const useVentas = () => {
  const context = useContext(VentasContext);
  if (!context) {
    throw new Error('useVentas debe usarse dentro de VentasProvider');
  }
  return context;
};
