import api from './api';

export interface DashboardData {
  ventas_hoy: number;
  total_ventas_hoy: number;
  total_ventas: number;
  total_ingresos: number;
  cobros_pendientes: number;
  total_cobros_pendientes: number;
  pedidos_pendientes: number;
  total_productos: number;
  total_clientes: number;
}

export interface ConfigEmpresa {
  idconfig: number;
  nombre_empresa: string;
  direccion: string;
  telefono: string;
  logo: string;
  moneda: string;
  mensaje_comprobante: string;
}

export interface Notificacion {
  idnotificacion: number;
  usuarioid: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  datos: any;
  leida: boolean;
  fechacreacion: string;
}

class ConfigService {
  // Dashboard
  async getDashboard() {
    return api.get<DashboardData>('/config/dashboard');
  }

  // Configuración empresa
  async getConfig() {
    return api.get<ConfigEmpresa>('/config/empresa');
  }

  async updateConfig(data: Partial<ConfigEmpresa>) {
    return api.put<ConfigEmpresa>('/config/empresa', data);
  }

  async uploadLogo(file: any) {
    return api.uploadFile<{ url: string }>('/config/empresa/logo', file);
  }

  // Notificaciones
  async getNotificaciones(leidas = false, limit = 20) {
    const params = new URLSearchParams();
    params.append('leidas', String(leidas));
    params.append('limit', String(limit));
    return api.get<Notificacion[]>(`/config/notificaciones?${params.toString()}`);
  }

  async marcarNotificacionLeida(id: number) {
    return api.put(`/config/notificaciones/${id}/leida`);
  }

  async marcarTodasLeidas() {
    return api.put('/config/notificaciones/leer-todas');
  }
}

export const configService = new ConfigService();
export default configService;
