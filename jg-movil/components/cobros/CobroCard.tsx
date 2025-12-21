import { Cobro } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CobroCardProps {
  cobro: Cobro;
  onPress: () => void;
  onMarcarPagado: () => void;
}

export const CobroCard: React.FC<CobroCardProps> = ({
  cobro,
  onPress,
  onMarcarPagado,
}) => {
  const getEstadoConfig = (estado: number) => {
    switch (estado) {
      case 1:
        return { color: '#8B5A3C', text: 'Pendiente', bgColor: '#8B5A3C15' };
      case 2:
        return { color: '#5D8A66', text: 'Pagado', bgColor: '#5D8A6615' };
      case 0:
        return { color: '#C45C5C', text: 'Anulado', bgColor: '#C45C5C15' };
      default:
        return { color: '#8B5A3C', text: 'Desconocido', bgColor: '#8B5A3C15' };
    }
  };

  const estadoConfig = getEstadoConfig(cobro.estado);
  const saldo = cobro.saldo ?? (cobro.total - cobro.monto_pagado);

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-3 overflow-hidden border border-[#E8DFD4]"
      style={{
        shadowColor: '#402612',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-base font-poppins-bold text-[#402612] mb-1" numberOfLines={1}>
              {cobro.cliente?.nombrecliente || 'Cliente'}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={14} color="#8B5A3C" />
              <Text className="text-sm font-poppins-medium text-[#8B5A3C] ml-1">
                {cobro.origen === 'venta' ? 'Venta a crédito' : 'Cobro manual'}
              </Text>
            </View>
          </View>
          
          <View
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: estadoConfig.bgColor }}
          >
            <Text
              className="text-xs font-poppins-bold"
              style={{ color: estadoConfig.color }}
            >
              {estadoConfig.text}
            </Text>
          </View>
        </View>

        {/* Monto y fecha */}
        <View className="flex-row justify-between items-end">
          <View>
            <Text className="text-xs font-poppins-medium text-[#8B5A3C] mb-1">
              Total
            </Text>
            <Text className="text-xl font-poppins-black text-[#402612]">
              Bs {cobro.total.toFixed(2)}
            </Text>
            {cobro.estado === 1 && saldo > 0 && (
              <Text className="text-xs font-poppins-medium text-[#C45C5C] mt-1">
                Saldo: Bs {saldo.toFixed(2)}
              </Text>
            )}
          </View>
          
          <View className="items-end">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#8B5A3C" />
              <Text className="text-xs font-poppins-medium text-[#8B5A3C] ml-1">
                {format(new Date(cobro.fecha), 'dd MMM yyyy')}
              </Text>
            </View>
            {cobro.estado === 2 && cobro.fechapago && (
              <Text className="text-xs font-poppins-medium text-[#5D8A66] mt-1">
                Pagado: {format(new Date(cobro.fechapago), 'dd/MM/yy')}
              </Text>
            )}
          </View>
        </View>

        {/* Botón marcar pagado */}
        {cobro.estado === 1 && (
          <TouchableOpacity
            className="flex-row items-center justify-center py-3 rounded-xl mt-4 bg-[#402612]"
            onPress={(e) => {
              e.stopPropagation();
              onMarcarPagado();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={18} color="#F6EBD7" />
            <Text className="text-sm font-poppins-bold ml-2 text-[#F6EBD7]">
              Marcar como pagado
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};
