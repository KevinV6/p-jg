import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  data?: {
    cliente: string;
    productos: number;
    total: number;
  };
  loading?: boolean;
  confirmText?: string;
  confirmColor?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  data,
  loading = false,
  confirmText = 'Confirmar',
  confirmColor,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm">
          <View className="bg-[#402612] rounded-t-2xl px-4 py-4 flex-row items-center">
            <Ionicons name={loading ? "hourglass-outline" : "help-circle-outline"} size={24} color="#F6EBD7" />
            <Text className="text-lg font-poppins-bold text-[#F6EBD7] ml-2">
              {title}
            </Text>
          </View>

          <View className="p-6">
            <Text className="text-base font-poppins-regular text-[#402612] mb-4 text-center">
              {message}
            </Text>

            {data && (
              <View className="bg-white rounded-xl p-4 mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="font-poppins-regular text-[#8B5A3C]">Cliente:</Text>
                  <Text className="font-poppins-semibold text-[#402612] flex-1 text-right" numberOfLines={1}>
                    {data.cliente || 'Sin Nombre'}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="font-poppins-regular text-[#8B5A3C]">Productos:</Text>
                  <Text className="font-poppins-semibold text-[#402612]">
                    {data.productos}
                  </Text>
                </View>
                <View className="flex-row justify-between border-t border-[#E5E5E5] pt-2">
                  <Text className="font-poppins-bold text-[#402612]">Total:</Text>
                  <Text className="font-poppins-bold text-[#402612] text-lg">
                    Bs. {data.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {loading ? (
              <View className="flex-row items-center justify-center py-4">
                <ActivityIndicator size="large" color="#402612" />
                <Text className="text-[#402612] font-poppins-semibold ml-3">
                  Procesando...
                </Text>
              </View>
            ) : (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 bg-[#8B5A3C] rounded-xl py-3"
                >
                  <Text className="text-center text-white font-poppins-semibold">
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  className="flex-1 rounded-xl py-3"
                  style={{ backgroundColor: confirmColor || '#402612' }}
                >
                  <Text className="text-center text-[#F6EBD7] font-poppins-semibold">
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};