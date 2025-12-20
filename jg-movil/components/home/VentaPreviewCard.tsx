import { Venta } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface VentaPreviewCardProps {
  venta: Venta;
  onPress: () => void;
}

export const VentaPreviewCard: React.FC<VentaPreviewCardProps> = ({
  venta,
  onPress,
}) => {
  const isContado = venta.tipoventa === 1;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-3 p-4 shadow-md flex-row items-center"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: '#40261220' }}
      >
        <Ionicons name="cart" size={22} color="#402612" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-poppins-bold text-[#3d2b1f] mb-1">
          {venta.cliente?.cliente}
        </Text>
        <Text className="text-sm font-poppins text-gray-500">
          {format(venta.fecha, 'dd/MM/yyyy HH:mm')}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-lg font-poppins-bold text-[#3d2b1f] mb-1">
          Bs {venta.total.toFixed(2)}
        </Text>
        <View
          className={`px-2 py-1 rounded-full ${
            isContado ? 'bg-green-100' : 'bg-purple-100'
          }`}
        >
          <Text
            className={`text-xs font-poppins-bold ${
              isContado ? 'text-green-600' : 'text-purple-600'
            }`}
          >
            {isContado ? 'CONTADO' : 'CRÉDITO'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
