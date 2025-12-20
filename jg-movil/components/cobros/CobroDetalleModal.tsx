import { Cobro } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface CobroDetalleModalProps {
  visible: boolean;
  cobro: Cobro | null;
  onClose: () => void;
  onMarcarPagado?: (id: number) => void;
  onVerComprobante?: (cobro: Cobro) => void;
}

export const CobroDetalleModal: React.FC<CobroDetalleModalProps> = ({
  visible,
  cobro,
  onClose,
  onMarcarPagado,
  onVerComprobante,
}) => {
  if (!cobro) return null;

  const getEstadoConfig = (estado: number) => {
    return estado === 1
      ? { color: '#8B5A3C', text: 'Pendiente', bgColor: '#8B5A3C15', icon: 'time-outline' as const }
      : { color: '#5D8A66', text: 'Pagado', bgColor: '#5D8A6615', icon: 'checkmark-circle-outline' as const };
  };

  const estadoConfig = getEstadoConfig(cobro.estado);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(64, 38, 18, 0.6)' }}>
        <View
          className="bg-[#F6EBD7] rounded-t-3xl max-h-[85%]"
          style={{
            shadowColor: '#402612',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-[#E8DFD4]">
            <Text className="text-lg font-poppins-bold text-[#402612]">
              Detalle del Cobro
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 rounded-full justify-center items-center bg-white"
              style={{
                shadowColor: '#402612',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="close" size={20} color="#402612" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
            {/* Info principal */}
            <View className="bg-white rounded-2xl p-4 mb-4 border border-[#E8DFD4]">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-poppins-medium text-[#8B5A3C] mb-1">
                    Cliente
                  </Text>
                  <Text className="text-lg font-poppins-bold text-[#402612]">
                    {cobro.nombrecobro}
                  </Text>
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

              <View className="flex-row">
                <View className="flex-1 mr-4">
                  <Text className="text-xs font-poppins-medium text-[#8B5A3C] mb-1">
                    Teléfono
                  </Text>
                  <Text className="text-base font-poppins-semibold text-[#402612]">
                    {cobro.telefono}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-poppins-medium text-[#8B5A3C] mb-1">
                    Fecha
                  </Text>
                  <Text className="text-base font-poppins-semibold text-[#402612]">
                    {format(cobro.fechacreacion, 'dd/MM/yyyy')}
                  </Text>
                </View>
              </View>

              {cobro.estado === 2 && cobro.fechapago && (
                <View className="mt-4 pt-4 border-t border-[#E8DFD4]">
                  <Text className="text-xs font-poppins-medium text-[#5D8A66] mb-1">
                    Fecha de pago
                  </Text>
                  <Text className="text-base font-poppins-semibold text-[#5D8A66]">
                    {format(cobro.fechapago, 'dd/MM/yyyy')}
                  </Text>
                </View>
              )}
            </View>

            {/* Productos */}
            <Text className="text-sm font-poppins-bold text-[#402612] mb-3">
              Productos
            </Text>
            <View className="bg-white rounded-2xl border border-[#E8DFD4] overflow-hidden mb-4">
              {cobro.auxDetalles?.map((detalle, index) => (
                <View
                  key={index}
                  className={`flex-row items-center p-4 ${
                    index !== (cobro.auxDetalles?.length || 0) - 1 ? 'border-b border-[#E8DFD4]' : ''
                  }`}
                >
                  {/* Imagen del producto */}
                  <View className="w-14 h-14 rounded-xl bg-[#F6EBD7] mr-3 overflow-hidden items-center justify-center">
                    {cobro.imagen ? (
                      <Image 
                        source={{ uri: cobro.imagen }} 
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="cube-outline" size={24} color="#8B5A3C" />
                    )}
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-sm font-poppins-semibold text-[#402612] mb-1">
                      {detalle.nombreproductoaux}
                    </Text>
                    <Text className="text-xs font-poppins-medium text-[#8B5A3C]">
                      {detalle.cantidadaux} {detalle.unidadmedida} × Bs {detalle.precio.toFixed(2)}
                    </Text>
                  </View>
                  <Text className="text-base font-poppins-bold text-[#402612]">
                    Bs {(detalle.cantidadaux * detalle.precio).toFixed(2)}
                  </Text>
                </View>
              ))}
              
              {/* Si no hay detalles */}
              {(!cobro.auxDetalles || cobro.auxDetalles.length === 0) && (
                <View className="p-6 items-center">
                  <Ionicons name="cube-outline" size={40} color="#8B5A3C" />
                  <Text className="text-sm font-poppins-medium text-[#8B5A3C] mt-2">
                    Sin productos registrados
                  </Text>
                </View>
              )}
            </View>

            {/* Total */}
            <View
              className="flex-row justify-between items-center p-4 rounded-2xl bg-[#402612]"
            >
              <Text className="text-base font-poppins-bold text-[#F6EBD7]">
                Total
              </Text>
              <Text className="text-xl font-poppins-black text-[#F6EBD7]">
                Bs {cobro.total.toFixed(2)}
              </Text>
            </View>

            {/* Botones de acción */}
            <View className="mt-4 gap-3">
              {/* Botón Ver Comprobante */}
              {onVerComprobante && (
                <TouchableOpacity
                  onPress={() => onVerComprobante(cobro)}
                  className="flex-row items-center justify-center bg-white border-2 border-[#402612] rounded-xl py-3.5"
                >
                  <Ionicons name="receipt-outline" size={20} color="#402612" />
                  <Text className="text-base font-poppins-bold text-[#402612] ml-2">
                    Ver Comprobante
                  </Text>
                </TouchableOpacity>
              )}

              {/* Botón Marcar como Pagado */}
              {cobro.estado === 1 && onMarcarPagado && (
                <TouchableOpacity
                  onPress={() => onMarcarPagado(cobro.idcobro)}
                  className="flex-row items-center justify-center bg-[#5D8A66] rounded-xl py-3.5"
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  <Text className="text-base font-poppins-bold text-white ml-2">
                    Marcar como Pagado
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
