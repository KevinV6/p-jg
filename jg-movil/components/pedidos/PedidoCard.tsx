import { Pedido } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface PedidoCardProps {
  pedido: Pedido;
  onPress: () => void;
}

export const PedidoCard: React.FC<PedidoCardProps> = ({ pedido, onPress }) => {
  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return { color: '#8B5A3C', text: 'Pendiente', bgColor: '#8B5A3C15', icon: 'time-outline' };
      case 'confirmado':
        return { color: '#5D8A66', text: 'Confirmado', bgColor: '#5D8A6615', icon: 'checkmark-circle-outline' };
      case 'preparando':
        return { color: '#F59E0B', text: 'Preparando', bgColor: '#F59E0B15', icon: 'construct-outline' };
      case 'listo':
        return { color: '#3B82F6', text: 'Listo', bgColor: '#3B82F615', icon: 'checkmark-done-outline' };
      case 'entregado':
        return { color: '#10B981', text: 'Entregado', bgColor: '#10B98115', icon: 'checkmark-done-circle-outline' };
      case 'cancelado':
        return { color: '#C45C5C', text: 'Cancelado', bgColor: '#C45C5C15', icon: 'close-circle-outline' };
      default:
        return { color: '#8B5A3C', text: 'Desconocido', bgColor: '#8B5A3C15', icon: 'help-outline' };
    }
  };

  const estadoConfig = getEstadoConfig(pedido.estado_pedido);
  const totalProductos = pedido.detalles?.length || 0;

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
            <Text className="text-sm font-poppins-medium text-[#8B5A3C] mb-0.5">
              Pedido
            </Text>
            <Text className="text-lg font-poppins-black text-[#402612]">
              #{pedido.idpedido.toString().padStart(4, '0')}
            </Text>
          </View>

          <View
            className="flex-row items-center px-3 py-1.5 rounded-full"
            style={{ backgroundColor: estadoConfig.bgColor }}
          >
            <Ionicons name={estadoConfig.icon as any} size={14} color={estadoConfig.color} />
            <Text
              className="text-xs font-poppins-bold ml-1"
              style={{ color: estadoConfig.color }}
            >
              {estadoConfig.text}
            </Text>
          </View>
        </View>

        {/* Cliente */}
        <View className="flex-row items-center mb-3">
          <View className="w-8 h-8 rounded-full bg-[#F6EBD7] justify-center items-center mr-2">
            <Ionicons name="person-outline" size={16} color="#402612" />
          </View>
          <Text className="text-base font-poppins-semibold text-[#402612] flex-1" numberOfLines={1}>
            {pedido.cliente?.nombrecliente || 'Cliente'}
          </Text>
        </View>

        {/* Notas */}
        {pedido.notas && (
          <View className="bg-[#F6EBD7] rounded-xl p-3 mb-3">
            <Text className="text-sm font-poppins-medium text-[#8B5A3C] italic" numberOfLines={2}>
              "{pedido.notas}"
            </Text>
          </View>
        )}

        {/* Footer */}
        <View className="flex-row justify-between items-center pt-3 border-t border-[#E8DFD4]">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#8B5A3C" />
            <Text className="text-xs font-poppins-medium text-[#8B5A3C] ml-1">
              {format(new Date(pedido.fecha), 'dd MMM yyyy, HH:mm')}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="cube-outline" size={14} color="#402612" />
            <Text className="text-xs font-poppins-bold text-[#402612] ml-1">
              {totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#8B5A3C" style={{ marginLeft: 8 }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
