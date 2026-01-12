import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useVentas } from '@/contexts/VentasContext';
import { Venta } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { endOfDay, endOfMonth, format, isWithinInterval, startOfDay, startOfMonth, subDays } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function HistorialVentasScreen() {
  const router = useRouter();
  const { ventas } = useVentas();
  const [filterPeriodo, setFilterPeriodo] = useState<'hoy' | 'semana' | 'mes' | 'todos'>('todos');

  const getFilteredVentas = () => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    switch (filterPeriodo) {
      case 'hoy':
        return ventas.filter((v: Venta) => {
          // La fecha puede venir como string ISO con zona horaria
          const ventaDate = new Date(v.fecha);
          const ventaDateOnly = startOfDay(ventaDate);
          const todayDateOnly = startOfDay(now);
          
          // Comparar solo las fechas sin considerar la hora
          return ventaDateOnly.getTime() === todayDateOnly.getTime();
        });
      case 'semana':
        const weekAgo = startOfDay(subDays(now, 7));
        return ventas.filter((v: Venta) => {
          const ventaDate = startOfDay(new Date(v.fecha));
          return ventaDate >= weekAgo && ventaDate <= startOfDay(now);
        });
      case 'mes':
        return ventas.filter((v: Venta) => {
          const ventaDate = new Date(v.fecha);
          return isWithinInterval(ventaDate, {
            start: startOfMonth(now),
            end: endOfDay(endOfMonth(now)),
          });
        });
      default:
        return ventas;
    }
  };

  const filteredVentas = getFilteredVentas().sort(
    (a: Venta, b: Venta) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const totalVentas = filteredVentas.reduce((sum: number, v: Venta) => sum + v.total, 0);

  const renderVenta = ({ item }: { item: Venta }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 border border-[#E5E5E5]"
      onPress={() => router.push(`/comprobante-venta?id=${item.idventa}`)}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-base font-poppins-bold text-[#402612] mb-1">
            Venta #{item.idventa.toString().padStart(6, '0')}
          </Text>
          <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
            {item.cliente?.nombrecliente || 'Sin Nombre'}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xl font-poppins-black text-[#402612] mb-1">
            Bs. {item.total.toFixed(2)}
          </Text>
          <View
            className={`px-3 py-1 rounded-full ${
              item.tipo_pago === 'contado' ? 'bg-green-100' : 'bg-orange-100'
            }`}
          >
            <Text
              className={`text-xs font-poppins-semibold ${
                item.tipo_pago === 'contado' ? 'text-green-700' : 'text-orange-700'
              }`}
            >
              {item.tipo_pago === 'contado' ? 'Contado' : 'Crédito'}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center pt-2 border-t border-[#E5E5E5]">
        <View className="flex-row items-center gap-2">
          <Ionicons name="calendar-outline" size={16} color="#8B5A3C" />
          <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
            {format(new Date(item.fecha), 'dd/MM/yyyy HH:mm')}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Ionicons name="person-outline" size={16} color="#8B5A3C" />
          <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
            {item.usuario?.primernombre || 'Usuario'} {item.usuario?.apellidopaterno || ''}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-end mt-2 gap-2">
        <Text className="text-xs font-poppins-regular text-[#8B5A3C]">
          {item.detalles?.length || 0} producto(s)
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#402612" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer safeTop={false} statusBarStyle="light" statusBarColor="#402612">
      {/* Header */}
      <SafeHeader>
        <View className="bg-[#402612] px-4 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#F6EBD7" />
          </TouchableOpacity>
          <Text className="text-xl font-poppins-semibold text-[#F6EBD7]">
            Historial de Ventas
          </Text>
        </View>
        </View>
      </SafeHeader>

      {/* Filtros */}
      <View className="flex-row px-4 py-3 gap-2">
        <TouchableOpacity
          onPress={() => setFilterPeriodo('hoy')}
          className={`flex-1 py-2 rounded-xl items-center ${
            filterPeriodo === 'hoy' ? 'bg-[#402612]' : 'bg-[#F6EBD7] border border-[#8B5A3C]'
          }`}
        >
          <Text
            className={`font-poppins-semibold text-sm ${
              filterPeriodo === 'hoy' ? 'text-[#F6EBD7]' : 'text-[#402612]'
            }`}
          >
            Hoy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterPeriodo('semana')}
          className={`flex-1 py-2 rounded-xl items-center ${
            filterPeriodo === 'semana' ? 'bg-[#402612]' : 'bg-[#F6EBD7] border border-[#8B5A3C]'
          }`}
        >
          <Text
            className={`font-poppins-semibold text-sm ${
              filterPeriodo === 'semana' ? 'text-[#F6EBD7]' : 'text-[#402612]'
            }`}
          >
            Semana
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterPeriodo('mes')}
          className={`flex-1 py-2 rounded-xl items-center ${
            filterPeriodo === 'mes' ? 'bg-[#402612]' : 'bg-[#F6EBD7] border border-[#8B5A3C]'
          }`}
        >
          <Text
            className={`font-poppins-semibold text-sm ${
              filterPeriodo === 'mes' ? 'text-[#F6EBD7]' : 'text-[#402612]'
            }`}
          >
            Mes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterPeriodo('todos')}
          className={`flex-1 py-2 rounded-xl items-center ${
            filterPeriodo === 'todos' ? 'bg-[#402612]' : 'bg-[#F6EBD7] border border-[#8B5A3C]'
          }`}
        >
          <Text
            className={`font-poppins-semibold text-sm ${
              filterPeriodo === 'todos' ? 'text-[#F6EBD7]' : 'text-[#402612]'
            }`}
          >
            Todos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Total */}
      <View className="bg-[#402612] mx-4 my-3 rounded-xl p-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-sm font-poppins-regular text-[#F6EBD7]/70 mb-1">
              Total {filterPeriodo === 'todos' ? 'general' : `de ${filterPeriodo}`}
            </Text>
            <Text className="text-xs font-poppins-regular text-[#F6EBD7]/70">
              {filteredVentas.length} venta(s)
            </Text>
          </View>
          <Text className="text-2xl font-poppins-black text-[#F6EBD7]">
            Bs. {totalVentas.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredVentas}
        renderItem={renderVenta}
        keyExtractor={(item) => item.idventa.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="receipt-outline" size={64} color="#8B5A3C" />
            <Text className="text-base font-poppins-regular text-[#8B5A3C] mt-4">
              No hay ventas en este período
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
