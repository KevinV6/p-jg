import api from './api';
import type { Pedido } from '../types';

export interface PedidoFilters {
  page?: number;
  limit?: number;
  estado_pedido?: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  clienteid?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface DetallePedidoInput {
  productoid: number;
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
  notas?: string;
}

export interface PedidoCreateData {
  clienteid?: number;
  detalles: DetallePedidoInput[];
  notas?: string;
  fecha_entrega?: string;
}

class PedidoService {
  async getAll(filters: PedidoFilters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.estado_pedido) params.append('estado_pedido', filters.estado_pedido);
    if (filters.clienteid) params.append('clienteid', String(filters.clienteid));
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    
    const query = params.toString();
    return api.get<Pedido[]>(`/pedidos${query ? `?${query}` : ''}`);
  }

  async getById(id: number) {
    return api.get<Pedido>(`/pedidos/${id}`);
  }

  async create(data: PedidoCreateData) {
    return api.post<Pedido>('/pedidos', data);
  }

  async update(id: number, data: Partial<PedidoCreateData>) {
    return api.put<Pedido>(`/pedidos/${id}`, data);
  }

  async cambiarEstado(id: number, estado_pedido: string) {
    return api.put(`/pedidos/${id}/estado`, { estado_pedido });
  }

  async convertirAVenta(id: number, tipo_pago: 'contado' | 'credito' = 'contado', clienteid?: number) {
    return api.post(`/pedidos/${id}/convertir-venta`, { tipo_pago, clienteid });
  }

  async cancelar(id: number, motivo?: string) {
    return api.put(`/pedidos/${id}/cancelar`, { motivo });
  }

  async remove(id: number) {
    return api.delete(`/pedidos/${id}`);
  }
}

export const pedidoService = new PedidoService();
export default pedidoService;
