import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

// Tipo de Venta Selector
interface TipoVentaSelectorProps {
  tipoVenta: 'contado' | 'credito';
  onPress: () => void;
}

export function TipoVentaSelector({ tipoVenta, onPress }: TipoVentaSelectorProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
        Tipo de Venta
      </Text>
      <TouchableOpacity
        onPress={onPress}
        className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 flex-row items-center justify-between"
      >
        <Text className="text-[#402612] font-poppins-regular">
          {tipoVenta === 'contado' ? 'Contado' : 'Crédito'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#8B5A3C" />
      </TouchableOpacity>
    </View>
  );
}

// Tipo de Venta Modal
interface TipoVentaModalProps {
  visible: boolean;
  tipoVenta: 'contado' | 'credito';
  onSelect: (tipo: 'contado' | 'credito') => void;
  onClose: () => void;
}

export function TipoVentaModal({ visible, tipoVenta, onSelect, onClose }: TipoVentaModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm">
          <View className="bg-[#402612] rounded-t-2xl px-4 py-4">
            <Text className="text-lg font-poppins-bold text-[#F6EBD7]">
              Tipo de Venta
            </Text>
          </View>

          <View className="p-4">
            <TouchableOpacity
              onPress={() => onSelect('contado')}
              className={`border-2 rounded-xl p-4 mb-3 ${
                tipoVenta === 'contado' ? 'border-[#402612] bg-[#402612]/10' : 'border-[#8B5A3C]'
              }`}
            >
              <Text className="text-base font-poppins-semibold text-[#402612]">
                Contado
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSelect('credito')}
              className={`border-2 rounded-xl p-4 ${
                tipoVenta === 'credito' ? 'border-[#402612] bg-[#402612]/10' : 'border-[#8B5A3C]'
              }`}
            >
              <Text className="text-base font-poppins-semibold text-[#402612]">
                Crédito
              </Text>
            </TouchableOpacity>
          </View>

          <View className="px-4 pb-4">
            <TouchableOpacity
              onPress={onClose}
              className="bg-[#8B5A3C] rounded-xl py-3"
            >
              <Text className="text-center text-white font-poppins-semibold">
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Credit Blocked Modal
interface CreditoBlockedModalProps {
  visible: boolean;
  deudaInfo: { cantidad: number; total: number } | null;
  onCambiarContado: () => void;
  onClose: () => void;
}

export function CreditoBlockedModal({ visible, deudaInfo, onCambiarContado, onClose }: CreditoBlockedModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm">
          {/* Header con icono de alerta */}
          <View className="bg-[#FF5555] rounded-t-2xl px-4 py-5 items-center">
            <View className="bg-white/20 rounded-full p-3 mb-2">
              <Ionicons name="warning" size={36} color="#FFFFFF" />
            </View>
            <Text className="text-lg font-poppins-bold text-white text-center">
              Crédito No Disponible
            </Text>
          </View>

          <View className="p-5">
            <Text className="text-base font-poppins-regular text-[#402612] text-center mb-4">
              Este cliente tiene{' '}
              <Text className="font-poppins-bold">{deudaInfo?.cantidad} cobro(s) pendiente(s)</Text>{' '}
              por un total de:
            </Text>
            
            <View className="bg-[#FF5555]/10 rounded-xl p-4 mb-4 items-center">
              <Text className="text-3xl font-poppins-black text-[#FF5555]">
                Bs. {deudaInfo?.total.toFixed(2)}
              </Text>
            </View>

            <Text className="text-sm font-poppins-regular text-[#8B5A3C] text-center mb-4">
              No puede realizar ventas a crédito hasta que pague su deuda pendiente.
            </Text>

            <View className="bg-[#3B82F6]/10 rounded-xl p-3 flex-row items-center">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text className="text-sm font-poppins-regular text-[#3B82F6] ml-2 flex-1">
                Puede realizar la venta al contado.
              </Text>
            </View>
          </View>

          <View className="px-4 pb-4 flex-row gap-3">
            <TouchableOpacity
              onPress={onCambiarContado}
              className="flex-1 bg-[#402612] rounded-xl py-3"
            >
              <Text className="text-center text-white font-poppins-bold">
                Cambiar a Contado
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-[#8B5A3C] rounded-xl py-3"
            >
              <Text className="text-center text-white font-poppins-semibold">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
