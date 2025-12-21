import api from './api';
import type { Producto, Categoria, UnidadMedida } from '../types';

export interface ProductoFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoriaid?: number;
}

export interface ProductoCreateData {
  nombre: string;
  descripcion?: string;
  precio: number;
  categoriaid?: number;
  imagen?: string;
  unidades?: Array<{
    unidadmedidaid: number;
    factor_conversion: number;
    precio_unidad: number;
  }>;
  variantes?: Array<{
    nombre: string;
    precio: number;
    imagen?: string;
  }>;
}

class ProductoService {
  async getAll(filters: ProductoFilters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.search) params.append('search', filters.search);
    if (filters.categoriaid) params.append('categoriaid', String(filters.categoriaid));
    
    const query = params.toString();
    return api.get<Producto[]>(`/productos${query ? `?${query}` : ''}`);
  }

  async getById(id: number) {
    return api.get<Producto>(`/productos/${id}`);
  }

  async create(data: ProductoCreateData) {
    return api.post<Producto>('/productos', data);
  }

  async update(id: number, data: Partial<ProductoCreateData>) {
    return api.put<Producto>(`/productos/${id}`, data);
  }

  async remove(id: number) {
    return api.delete(`/productos/${id}`);
  }

  // Subir imagen (sin asociar a producto - para nuevos productos)
  async uploadImage(file: { uri: string; mimeType?: string; fileName?: string }) {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.mimeType || 'image/jpeg',
      name: file.fileName || `producto_${Date.now()}.jpg`,
    } as any);

    return api.request<{ url: string; path: string }>('/productos/upload-imagen', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  }

  // Actualizar imagen de producto existente
  async updateImage(id: number, file: { uri: string; mimeType?: string; fileName?: string }) {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.mimeType || 'image/jpeg',
      name: file.fileName || `producto_${id}_${Date.now()}.jpg`,
    } as any);

    return api.request<{ url: string; path: string }>(`/productos/${id}/imagen`, {
      method: 'PUT',
      body: formData,
      isFormData: true,
    });
  }

  // Subir imagen de variante
  async uploadVarianteImage(file: { uri: string; mimeType?: string; fileName?: string }) {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.mimeType || 'image/jpeg',
      name: file.fileName || `variante_${Date.now()}.jpg`,
    } as any);

    return api.request<{ url: string; path: string }>('/productos/upload-variante-imagen', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  }

  // Catálogo
  async getCategorias() {
    return api.get<Categoria[]>('/catalogo/categorias');
  }

  async createCategoria(nombre: string, descripcion?: string) {
    return api.post<Categoria>('/catalogo/categorias', { nombre, descripcion });
  }

  async updateCategoria(id: number, nombre: string, descripcion?: string) {
    return api.put<Categoria>(`/catalogo/categorias/${id}`, { nombre, descripcion });
  }

  async deleteCategoria(id: number) {
    return api.delete(`/catalogo/categorias/${id}`);
  }

  async getUnidades() {
    return api.get<UnidadMedida[]>('/catalogo/unidades');
  }

  async createUnidad(nombre: string, abreviatura: string) {
    return api.post<UnidadMedida>('/catalogo/unidades', { nombre, abreviatura });
  }

  async updateUnidad(id: number, nombre: string, abreviatura: string) {
    return api.put<UnidadMedida>(`/catalogo/unidades/${id}`, { nombre, abreviatura });
  }

  async deleteUnidad(id: number) {
    return api.delete(`/catalogo/unidades/${id}`);
  }
}

export const productoService = new ProductoService();
export default productoService;
