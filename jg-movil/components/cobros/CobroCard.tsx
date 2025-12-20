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
    return estado === 1
      ? { color: '#8B5A3C', text: 'Pendiente', bgColor: '#8B5A3C15' }
      : { color: '#5D8A66', text: 'Pagado', bgColor: '#5D8A6615' };
  };

  const estadoConfig = getEstadoConfig(cobro.estado);

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
              {cobro.nombrecobro}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={14} color="#8B5A3C" />
              <Text className="text-sm font-poppins-medium text-[#8B5A3C] ml-1">
                {cobro.telefono}
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
            <Text className="text-xs font-poppins-medium text-[#8B5A3C] mt-1">
              {cobro.auxDetalles?.length || 0} producto(s)
            </Text>
          </View>
          
          <View className="items-end">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#8B5A3C" />
              <Text className="text-xs font-poppins-medium text-[#8B5A3C] ml-1">
                {format(cobro.fechacreacion, 'dd MMM yyyy')}
              </Text>
            </View>
            {cobro.estado === 2 && cobro.fechapago && (
              <Text className="text-xs font-poppins-medium text-[#5D8A66] mt-1">
                Pagado: {format(cobro.fechapago, 'dd/MM/yy')}
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
