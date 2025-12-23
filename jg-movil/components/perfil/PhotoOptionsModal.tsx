import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

// Photo Option Button
interface PhotoOptionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  titleColor?: string;
}

function PhotoOptionButton({
  icon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  onPress,
  titleColor = 'text-[#402612]',
}: PhotoOptionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-xl px-4 py-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View 
        className="w-12 h-12 rounded-xl justify-center items-center mr-3" 
        style={{ backgroundColor: iconBgColor }}
      >
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className={`font-poppins-semibold ${titleColor}`}>{title}</Text>
        <Text className="text-xs font-poppins-regular text-[#8B5A3C]">
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#8B5A3C" />
    </TouchableOpacity>
  );
}

// Photo Options Modal
interface PhotoOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onPickImage: () => void;
  onDeletePhoto?: () => void;
  hasPhoto: boolean;
}

export function PhotoOptionsModal({
  visible,
  onClose,
  onTakePhoto,
  onPickImage,
  onDeletePhoto,
  hasPhoto,
}: PhotoOptionsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-[#F6EBD7] rounded-t-3xl pb-8">
          {/* Header del Modal */}
          <View className="items-center py-4 border-b border-gray-200">
            <View className="w-12 h-1 bg-gray-300 rounded-full mb-3" />
            <Text className="text-lg font-poppins-bold text-[#402612]">
              Cambiar Foto de Perfil
            </Text>
          </View>

          <View className="p-4 gap-3">
            {/* Tomar Foto */}
            <PhotoOptionButton
              icon="camera"
              iconColor="#3b82f6"
              iconBgColor="#3b82f620"
              title="Tomar Foto"
              subtitle="Usar la cámara"
              onPress={onTakePhoto}
            />

            {/* Seleccionar de Galería */}
            <PhotoOptionButton
              icon="images"
              iconColor="#00D98E"
              iconBgColor="#00D98E20"
              title="Seleccionar de Galería"
              subtitle="Elegir una foto existente"
              onPress={onPickImage}
            />

            {/* Eliminar Foto */}
            {hasPhoto && onDeletePhoto && (
              <PhotoOptionButton
                icon="trash"
                iconColor="#DC2626"
                iconBgColor="#DC262620"
                title="Eliminar Foto"
                subtitle="Remover foto actual"
                onPress={onDeletePhoto}
                titleColor="text-red-600"
              />
            )}

            {/* Cancelar */}
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-200 rounded-xl py-3 mt-2"
            >
              <Text className="text-center font-poppins-semibold text-gray-600">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
