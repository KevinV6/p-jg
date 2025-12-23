import api from './api';
import type { Venta, DetalleVenta } from '../types';

export interface VentaFilters {
  page?: number;
  limit?: number;
  tipo_pago?: 'contado' | 'credito';
  clienteid?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface DetalleVentaInput {
  productoid: number;
  productounidadid?: number;
  opcionvarianteid?: number | null;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface VentaCreateData {
  clienteid: number;
  detalle: DetalleVentaInput[];
  tipo_pago: 'contado' | 'credito';
  fecha?: string; // Fecha ISO desde el cliente
  total?: number;
}

export interface VentaResumen {
  hoy: {
    cantidad: number;
    total: number;
  };
  semana: {
    cantidad: number;
    total: number;
  };
  mes: {
    cantidad: number;
    total: number;
  };
  creditos_pendientes: {
    cantidad: number;
    total: number;
  };
}

class VentaService {
  async getAll(filters: VentaFilters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.tipo_pago) params.append('tipo_pago', filters.tipo_pago);
    if (filters.clienteid) params.append('clienteid', String(filters.clienteid));
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    
    const query = params.toString();
    return api.get<Venta[]>(`/ventas${query ? `?${query}` : ''}`);
  }

  async getById(id: number) {
    return api.get<Venta>(`/ventas/${id}`);
  }

  async getByFolio(folio: string) {
    return api.get<Venta>(`/ventas/folio/${encodeURIComponent(folio)}`);
  }

  async getResumen() {
    return api.get<VentaResumen>('/ventas/resumen');
  }

  async getByCliente(clienteId: number, filters?: { fecha_desde?: string; fecha_hasta?: string; tipo_pago?: 'contado' | 'credito' }) {
    const params = new URLSearchParams();
    params.append('clienteid', String(clienteId));
    if (filters?.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters?.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters?.tipo_pago) params.append('tipo_pago', filters.tipo_pago);
    
    return api.get<Venta[]>(`/ventas?${params.toString()}`);
  }

  async create(data: VentaCreateData) {
    return api.post<Venta>('/ventas', data);
  }

  async anular(id: number, motivo?: string) {
    return api.put(`/ventas/${id}/anular`, { motivo });
  }
}

export const ventaService = new VentaService();
export default ventaService;
