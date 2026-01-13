import api from './api';
import type { Cobro } from '../types';

export interface CobroFilters {
  page?: number;
  limit?: number;
  estado?: number;
  clienteid?: number;
  origen?: 'venta' | 'manual';
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface DetalleCobroInput {
  nombreproducto: string;
  cantidad: number;
  peso?: number;
  unidadmedida?: string;
  precio: number;
}

export interface CobroCreateData {
  clienteid: number;
  total: number;
  fecha_vencimiento?: string;
  notas?: string;
  detalles?: DetalleCobroInput[];
}

export interface CobroResumen {
  pendientes: {
    cantidad: number;
    total: number;
  };
  cobrados: {
    cantidad: number;
    total: number;
  };
  vencidos: {
    cantidad: number;
    total: number;
  };
  proximos_vencer: {
    cantidad: number;
    total: number;
  };
}

class CobroService {
  async getAll(filters: CobroFilters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.estado !== undefined) params.append('estado', String(filters.estado));
    if (filters.clienteid) params.append('clienteid', String(filters.clienteid));
    if (filters.origen) params.append('origen', filters.origen);
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    
    const query = params.toString();
    return api.get<Cobro[]>(`/cobros${query ? `?${query}` : ''}`);
  }

  async getById(id: number) {
    return api.get<Cobro>(`/cobros/${id}`);
  }

  async getResumen() {
    return api.get<CobroResumen>('/cobros/resumen');
  }

  async create(data: CobroCreateData) {
    return api.post<Cobro>('/cobros', data);
  }

  async update(id: number, data: Partial<CobroCreateData>) {
    return api.put<Cobro>(`/cobros/${id}`, data);
  }

  async marcarPagado(id: number, monto_pagado?: number, notas?: string) {
    return api.put<Cobro>(`/cobros/${id}/pagar`, { monto_pagado, notas });
  }

  async anular(id: number, motivo?: string) {
    return api.put(`/cobros/${id}/anular`, { motivo });
  }
}

export const cobroService = new CobroService();
export default cobroService;
