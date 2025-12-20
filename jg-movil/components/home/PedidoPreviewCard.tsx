import { Pedido } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface PedidoPreviewCardProps {
  pedido: Pedido;
  onPress: () => void;
}

export const PedidoPreviewCard: React.FC<PedidoPreviewCardProps> = ({
  pedido,
  onPress,
}) => {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-3 p-4 shadow-md flex-row items-center"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: '#F9731620' }}
      >
        <Ionicons name="document-text" size={22} color="#F97316" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-poppins-bold text-[#3d2b1f] mb-1">
          {pedido.cliente?.cliente}
        </Text>
        <Text className="text-sm font-poppins text-gray-500">
          {format(pedido.fechapedido, 'dd/MM/yyyy')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#402612" />
    </TouchableOpacity>
  );
};
