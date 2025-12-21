import { supabase } from '@/config/supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 'producto' | 'venta' | 'cobro' | 'pedido' | 'cliente' | 'variante' | 'opcionvariante' | 'producto_variante_opcion' | 'precio_variante' | 'variante_catalogo' | 'opcion_catalogo';
type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface SubscriptionConfig {
  table: TableName;
  event?: EventType;
  filter?: string;
  callback: (payload: RealtimePostgresChangesPayload<any>) => void;
}

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    // Verificar si supabase está configurado
    this.isEnabled = !!supabase;
    if (!this.isEnabled) {
      console.warn('[Realtime] Supabase no está configurado - realtime deshabilitado');
    }
  }

  /**
   * Suscribirse a cambios en una tabla
   */
  subscribe(config: SubscriptionConfig): string | null {
    if (!this.isEnabled || !supabase) {
      console.log('[Realtime] Servicio deshabilitado');
      return null;
    }

    const { table, event = '*', filter, callback } = config;
    const channelId = `${table}-${event}-${filter || 'all'}-${Date.now()}`;

    try {
      const channelConfig: any = {
        event,
        schema: 'public',
        table,
      };

      if (filter) {
        channelConfig.filter = filter;
      }

      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          channelConfig,
          (payload: RealtimePostgresChangesPayload<any>) => {
            console.log(`[Realtime] ${table} - ${payload.eventType}`, payload.new || payload.old);
            callback(payload);
          }
        )
        .subscribe((status) => {
          console.log(`[Realtime] Canal ${table}: ${status}`);
        });

      this.channels.set(channelId, channel);
      console.log(`[Realtime] Suscrito a ${table} (${event})`);
      
      return channelId;
    } catch (error) {
      console.error(`[Realtime] Error al suscribirse a ${table}:`, error);
      return null;
    }
  }

  /**
   * Suscribirse a múltiples tablas con un solo callback
   */
  subscribeToMultiple(
    tables: TableName[],
    callback: (table: TableName, payload: RealtimePostgresChangesPayload<any>) => void
  ): string[] {
    const channelIds: string[] = [];

    for (const table of tables) {
      const channelId = this.subscribe({
        table,
        event: '*',
        callback: (payload) => callback(table, payload),
      });
      if (channelId) {
        channelIds.push(channelId);
      }
    }

    return channelIds;
  }

  /**
   * Cancelar suscripción específica
   */
  unsubscribe(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (channel && supabase) {
      supabase.removeChannel(channel);
      this.channels.delete(channelId);
      console.log(`[Realtime] Desuscrito de canal: ${channelId}`);
    }
  }

  /**
   * Cancelar todas las suscripciones
   */
  unsubscribeAll(): void {
    if (!supabase) return;
    
    const client = supabase; // Variable local para TypeScript
    this.channels.forEach((channel, channelId) => {
      try {
        client.removeChannel(channel);
        console.log(`[Realtime] Desuscrito de: ${channelId}`);
      } catch (error) {
        console.error(`[Realtime] Error desuscribiendo de ${channelId}:`, error);
      }
    });
    this.channels.clear();
  }

  /**
   * Verificar si el servicio está habilitado
   */
  isRealtimeEnabled(): boolean {
    return this.isEnabled;
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService;
