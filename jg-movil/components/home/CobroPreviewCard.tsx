import { Cobro } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CobroPreviewCardProps {
  cobro: Cobro;
  onPress?: () => void;
}

export const CobroPreviewCard: React.FC<CobroPreviewCardProps> = ({
  cobro,
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
        style={{ backgroundColor: '#9333EA20' }}
      >
        <Ionicons name="calendar" size={22} color="#9333EA" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-poppins-bold text-[#3d2b1f] mb-1">
          {cobro.nombrecobro}
        </Text>
        <Text className="text-sm font-poppins text-gray-500">
          {format(cobro.fechacreacion, 'dd/MM/yyyy')}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-xl font-poppins-bold text-[#3d2b1f]">
          Bs {cobro.total.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
