import api from './api';
import type { Cliente } from '../types';

export interface ClienteFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ClienteCreateData {
  nombre: string;
  ci_nit: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface DeudaInfo {
  tiene_deuda: boolean;
  total_deuda: number;
  cobros_pendientes: number;
}

class ClienteService {
  async getAll(filters: ClienteFilters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.search) params.append('search', filters.search);
    
    const query = params.toString();
    return api.get<Cliente[]>(`/clientes${query ? `?${query}` : ''}`);
  }

  async getById(id: number) {
    return api.get<Cliente>(`/clientes/${id}`);
  }

  async getGenerico() {
    return api.get<Cliente>('/clientes/generico');
  }

  async getByCiNit(ciNit: string) {
    return api.get<Cliente>(`/clientes/buscar/${encodeURIComponent(ciNit)}`);
  }

  async checkDeuda(id: number) {
    return api.get<DeudaInfo>(`/clientes/${id}/deuda`);
  }

  async create(data: ClienteCreateData) {
    return api.post<Cliente>('/clientes', data);
  }

  async update(id: number, data: Partial<ClienteCreateData>) {
    return api.put<Cliente>(`/clientes/${id}`, data);
  }

  async remove(id: number) {
    return api.delete(`/clientes/${id}`);
  }

  async delete(id: number) {
    return api.delete(`/clientes/${id}`);
  }
}

export const clienteService = new ClienteService();
export default clienteService;
