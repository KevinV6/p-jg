import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface CobroSummaryCardProps {
  totalPendiente: number;
  cantidadPendientes: number;
}

export const CobroSummaryCard: React.FC<CobroSummaryCardProps> = ({
  totalPendiente,
  cantidadPendientes,
}) => {
  return (
    <View
      className="mx-4 mt-4 rounded-2xl p-5 bg-[#402612]"
      style={{
        shadowColor: '#402612',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-xl justify-center items-center mr-4"
          style={{ backgroundColor: 'rgba(246, 235, 215, 0.15)' }}
        >
          <Ionicons name="wallet-outline" size={24} color="#F6EBD7" />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-poppins-medium text-[#F6EBD7] opacity-80 mb-1">
            Total pendiente
          </Text>
          <Text className="text-2xl font-poppins-black text-[#F6EBD7]">
            Bs {totalPendiente.toFixed(2)}
          </Text>
        </View>
        <View className="items-end">
          <View className="bg-[#F6EBD7] px-3 py-1.5 rounded-full">
            <Text className="text-xs font-poppins-bold text-[#402612]">
              {cantidadPendientes} {cantidadPendientes === 1 ? 'cobro' : 'cobros'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
