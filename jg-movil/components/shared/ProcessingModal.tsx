import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, Text, View } from 'react-native';

interface ProcessingModalProps {
  visible: boolean;
  message?: string;
  submessage?: string;
}

export function ProcessingModal({ 
  visible, 
  message = 'Procesando...', 
  submessage 
}: ProcessingModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-8">
        <View className="bg-white rounded-2xl p-8 items-center w-full max-w-xs">
          <View className="bg-[#402612] rounded-full p-4 mb-4">
            <ActivityIndicator size="large" color="#F6EBD7" />
          </View>
          <Text className="text-lg font-poppins-bold text-[#402612] text-center">
            {message}
          </Text>
          {submessage && (
            <Text className="text-sm font-poppins-regular text-[#8B5A3C] text-center mt-2">
              {submessage}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  loading?: boolean;
}

export function DeleteConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  loading = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm overflow-hidden">
          {/* Header */}
          <View className="bg-red-500 px-4 py-4 flex-row items-center">
            <Ionicons name="warning-outline" size={24} color="white" />
            <Text className="text-lg font-poppins-bold text-white ml-2">
              {title}
            </Text>
          </View>

          {/* Content */}
          <View className="p-6">
            <Text className="text-base font-poppins-regular text-[#402612] mb-2 text-center">
              {message}
            </Text>
            
            {itemName && (
              <View className="bg-white rounded-xl p-4 mt-3 mb-4">
                <Text className="text-base font-poppins-bold text-[#402612] text-center">
                  {itemName}
                </Text>
              </View>
            )}

            <Text className="text-sm font-poppins-regular text-[#8B5A3C] text-center mt-2">
              Esta acción no se puede deshacer.
            </Text>

            {/* Buttons */}
            {loading ? (
              <View className="flex-row items-center justify-center py-4 mt-4">
                <ActivityIndicator size="large" color="#EF4444" />
                <Text className="text-[#EF4444] font-poppins-semibold ml-3">
                  Eliminando...
                </Text>
              </View>
            ) : (
              <View className="flex-row gap-3 mt-6">
                <View className="flex-1">
                  <View 
                    className="bg-[#8B5A3C] rounded-xl py-3"
                    onTouchEnd={onClose}
                  >
                    <Text className="text-center text-white font-poppins-semibold">
                      Cancelar
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <View 
                    className="bg-red-500 rounded-xl py-3"
                    onTouchEnd={onConfirm}
                  >
                    <Text className="text-center text-white font-poppins-semibold">
                      Eliminar
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
