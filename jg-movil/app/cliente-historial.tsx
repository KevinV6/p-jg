import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { ConfirmModal } from '@/components/modales';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import { 
  DateFilterButtons, 
  TipoVentaFilter 
} from '@/components/clientes';
import type { DateRange, FilterType } from '@/components/clientes';
import { ventaService } from '@/services/ventaService';
import { Venta } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Skeleton para las ventas
function VentaSkeleton() {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 mx-4 border border-[#E5E5E5]">
      <View className="flex-row justify-between items-start mb-2">
        <View className="bg-[#8B5A3C40] h-5 w-24 rounded animate-pulse" />
        <View className="bg-[#8B5A3C40] h-6 w-20 rounded-full animate-pulse" />
      </View>
      <View className="bg-[#8B5A3C40] h-4 w-32 rounded mb-2 animate-pulse" />
      <View className="flex-row justify-between items-center">
        <View className="bg-[#8B5A3C40] h-4 w-24 rounded animate-pulse" />
        <View className="bg-[#8B5A3C40] h-5 w-20 rounded animate-pulse" />
      </View>
    </View>
  );
}

// Tarjeta de venta
interface VentaCardProps {
  venta: Venta;
  onPress: (venta: Venta) => void;
  onAnular: (venta: Venta) => void;
}

function VentaCard({ venta, onPress, onAnular }: VentaCardProps) {
  const formatFecha = (fecha: string) => {
    return format(new Date(fecha), "dd MMM yyyy, HH:mm", { locale: es });
  };

  const getTipoPagoStyles = () => {
    if (venta.tipo_pago === 'credito') {
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        label: 'Crédito',
      };
    }
    return {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Contado',
    };
  };

  const tipoStyles = getTipoPagoStyles();

  return (
    <TouchableOpacity
      onPress={() => onPress(venta)}
      className="bg-white rounded-xl p-4 mb-3 mx-4 border border-[#E5E5E5]"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-base font-poppins-bold text-[#402612]">
          {venta.folio || `V-${venta.idventa.toString().padStart(6, '0')}`}
        </Text>
        <View className="flex-row items-center gap-2">
          <View className={`px-3 py-1 rounded-full ${tipoStyles.bg}`}>
            <Text className={`text-xs font-poppins-semibold ${tipoStyles.text}`}>
              {tipoStyles.label}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => onAnular(venta)}
            className="bg-red-100 p-2 rounded-full"
          >
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text className="text-sm font-poppins-regular text-[#8B5A3C] mb-1">
        {formatFecha(venta.fecha)}
      </Text>
      
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
          {venta.detalles?.length || 0} producto(s)
        </Text>
        <Text className="text-lg font-poppins-bold text-[#402612]">
          Bs. {venta.total.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// Estado vacío
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <View className="flex-1 justify-center items-center px-8 py-16">
      <Ionicons name="receipt-outline" size={64} color="#8B5A3C" />
      <Text className="text-lg font-poppins-semibold text-[#402612] mt-4 text-center">
        {hasFilters 
          ? 'No se encontraron ventas con los filtros aplicados' 
          : 'No hay ventas registradas para este cliente'}
      </Text>
      <Text className="text-sm font-poppins-regular text-[#8B5A3C] mt-2 text-center">
        {hasFilters 
          ? 'Intenta con otros filtros de fecha o tipo de venta' 
          : 'Las ventas realizadas a este cliente aparecerán aquí'}
      </Text>
    </View>
  );
}

// Resumen de ventas
interface VentasSummaryProps {
  ventas: Venta[];
}

function VentasSummary({ ventas }: VentasSummaryProps) {
  const totalVentas = ventas.length;
  const totalMonto = ventas.reduce((sum, v) => sum + v.total, 0);
  const ventasContado = ventas.filter(v => v.tipo_pago === 'contado');
  const ventasCredito = ventas.filter(v => v.tipo_pago === 'credito');

  return (
    <View className="mx-4 mb-4 bg-white rounded-xl p-4 border border-[#E5E5E5]">
      <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-3">
        Resumen
      </Text>
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm font-poppins-regular text-[#402612]">
          Total ventas:
        </Text>
        <Text className="text-sm font-poppins-bold text-[#402612]">
          {totalVentas}
        </Text>
      </View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm font-poppins-regular text-[#402612]">
          Contado ({ventasContado.length}):
        </Text>
        <Text className="text-sm font-poppins-semibold text-green-600">
          Bs. {ventasContado.reduce((sum, v) => sum + v.total, 0).toFixed(2)}
        </Text>
      </View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm font-poppins-regular text-[#402612]">
          Crédito ({ventasCredito.length}):
        </Text>
        <Text className="text-sm font-poppins-semibold text-orange-600">
          Bs. {ventasCredito.reduce((sum, v) => sum + v.total, 0).toFixed(2)}
        </Text>
      </View>
      <View className="h-px bg-[#E5E5E5] my-2" />
      <View className="flex-row justify-between">
        <Text className="text-base font-poppins-bold text-[#402612]">
          Total:
        </Text>
        <Text className="text-base font-poppins-bold text-[#402612]">
          Bs. {totalMonto.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

export default function ClienteHistorialScreen() {
  const router = useRouter();
  const { id, nombre } = useLocalSearchParams<{ id: string; nombre: string }>();
  const { showError, showSuccess, AlertComponent } = useCustomAlert();
  
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filtros
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [tipoFilter, setTipoFilter] = useState<'all' | 'contado' | 'credito'>('all');

  // Modal de anulación
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [ventaToAnular, setVentaToAnular] = useState<Venta | null>(null);
  const [anulando, setAnulando] = useState(false);

  const fetchVentas = async () => {
    if (!id) return;
    
    try {
      const response = await ventaService.getByCliente(Number(id));
      if (response.success && response.data) {
        setVentas(response.data);
      }
    } catch (error) {
      console.error('Error fetching ventas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVentas();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVentas();
    setRefreshing(false);
  };

  const handleFilterChange = (range: DateRange | null, type: FilterType) => {
    setDateRange(range);
    setFilterType(type);
  };

  // Filtrar ventas
  const filteredVentas = useMemo(() => {
    let filtered = [...ventas];

    // Filtro por tipo de pago
    if (tipoFilter !== 'all') {
      filtered = filtered.filter(v => v.tipo_pago === tipoFilter);
    }

    // Filtro por fecha
    if (dateRange) {
      filtered = filtered.filter(v => {
        const ventaDate = new Date(v.fecha);
        return isWithinInterval(ventaDate, {
          start: startOfDay(dateRange.startDate),
          end: endOfDay(dateRange.endDate),
        });
      });
    }

    // Ordenar por fecha descendente
    filtered.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    return filtered;
  }, [ventas, dateRange, tipoFilter]);

  const handleVentaPress = (venta: Venta) => {
    router.push(`/comprobante-venta?id=${venta.idventa}`);
  };

  const handleAnularRequest = (venta: Venta) => {
    setVentaToAnular(venta);
    setShowAnularModal(true);
  };

  const handleAnularVenta = async () => {
    if (!ventaToAnular) return;

    setAnulando(true);
    try {
      const response = await ventaService.anular(ventaToAnular.idventa);
      if (response.success) {
        showSuccess('Éxito', 'La venta ha sido anulada correctamente', () => {
          setShowAnularModal(false);
          setVentaToAnular(null);
          fetchVentas();
        });
      } else {
        showError('Error', response.error || 'No se pudo anular la venta');
      }
    } catch (error) {
      console.error('Error anulando venta:', error);
      showError('Error', 'Ocurrió un error al anular la venta');
    } finally {
      setAnulando(false);
    }
  };

  const hasFilters = filterType !== 'all' || tipoFilter !== 'all';

  return (
    <ScreenContainer safeTop={false} statusBarStyle="light" statusBarColor="#402612">
      {/* Header */}
      <SafeHeader>
        <View className="bg-[#402612] px-4 py-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#F6EBD7" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-poppins-bold text-[#F6EBD7]">
              Historial de Ventas
            </Text>
            <Text className="text-sm font-poppins-regular text-[#F6EBD7]/80">
              {nombre || 'Cliente'}
            </Text>
          </View>
        </View>
      </SafeHeader>

      {/* Filtros de fecha */}
      <DateFilterButtons
        dateRange={dateRange}
        filterType={filterType}
        onFilterChange={handleFilterChange}
      />

      {/* Filtro de tipo de venta */}
      <TipoVentaFilter
        tipoFilter={tipoFilter}
        onTipoChange={setTipoFilter}
      />

      {/* Contenido */}
      {isLoading ? (
        <View className="pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <VentaSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredVentas}
          keyExtractor={(item) => item.idventa.toString()}
          renderItem={({ item }) => (
            <VentaCard 
              venta={item} 
              onPress={handleVentaPress}
              onAnular={handleAnularRequest}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            filteredVentas.length > 0 ? (
              <VentasSummary ventas={filteredVentas} />
            ) : null
          }
          ListEmptyComponent={<EmptyState hasFilters={hasFilters} />}
        />
      )}

      {/* Modal de confirmación anular */}
      <ConfirmModal
        visible={showAnularModal}
        onClose={() => {
          setShowAnularModal(false);
          setVentaToAnular(null);
        }}
        onConfirm={handleAnularVenta}
        title="Anular Venta"
        message={`¿Estás seguro de anular la venta ${ventaToAnular?.folio || `V-${ventaToAnular?.idventa?.toString().padStart(6, '0')}`}?${ventaToAnular?.tipo_pago === 'credito' ? '\n\nNota: También se anulará el cobro asociado.' : ''}`}
        data={{
          cliente: ventaToAnular?.cliente?.nombrecliente || 'Cliente',
          productos: ventaToAnular?.detalles?.length || 0,
          total: ventaToAnular?.total || 0,
        }}
        confirmText={anulando ? 'Anulando...' : 'Anular'}
        confirmColor="#EF4444"
      />

      {/* Custom Alert Component */}
      <AlertComponent />
    </ScreenContainer>
  );
}
