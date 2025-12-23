import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';

// Product Header Component
interface ProductoFormHeaderProps {
  title: string;
  onBack: () => void;
}

export function ProductoFormHeader({ title, onBack }: ProductoFormHeaderProps) {
  return (
    <View className="bg-[#402612] px-4 py-4 flex-row items-center">
      <TouchableOpacity onPress={onBack} className="mr-3">
        <Ionicons name="arrow-back" size={24} color="#F6EBD7" />
      </TouchableOpacity>
      <Text className="text-xl font-poppins-semibold text-[#F6EBD7]">
        {title}
      </Text>
    </View>
  );
}

// Image Picker Component
interface ProductImagePickerProps {
  imagen: string;
  onPress: () => void;
}

export function ProductImagePicker({ imagen, onPress }: ProductImagePickerProps) {
  return (
    <View className="mb-6">
      <Text className="text-base font-poppins-bold mb-3 text-[#3d2b1f]">Imagen del Producto *</Text>
      <TouchableOpacity 
        className="w-full h-[200px] rounded-2xl overflow-hidden bg-white shadow-md"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 3,
        }}
        onPress={onPress}
      >
        {imagen ? (
          <View className="flex-1">
            <Image 
              source={{ uri: imagen }} 
              className="w-full h-full"
              resizeMode="cover"
            />
            <View className="absolute bottom-3 right-3 bg-black/50 rounded-full p-2">
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center bg-[#F6EBD7]">
            <View className="bg-[#402612]/20 rounded-full p-4 mb-2">
              <Ionicons name="camera-outline" size={36} color="#402612" />
            </View>
            <Text className="text-sm font-poppins-semibold text-[#8B5A3C]">Toca para agregar imagen</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// Image Source Modal
interface ImageSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
}

export function ImageSourceModal({ visible, onClose, onSelectCamera, onSelectGallery }: ImageSourceModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-xl font-poppins-bold text-[#402612] text-center mb-6">
            Seleccionar imagen
          </Text>
          <TouchableOpacity
            onPress={onSelectCamera}
            className="bg-[#402612] rounded-xl py-4 mb-3 flex-row items-center justify-center"
          >
            <Ionicons name="camera" size={24} color="#F6EBD7" />
            <Text className="text-[#F6EBD7] font-poppins-bold text-base ml-3">
              Tomar foto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSelectGallery}
            className="bg-[#8B5A3C] rounded-xl py-4 mb-3 flex-row items-center justify-center"
          >
            <Ionicons name="images" size={24} color="#F6EBD7" />
            <Text className="text-[#F6EBD7] font-poppins-bold text-base ml-3">
              Elegir de galería
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            className="py-4 mt-2"
          >
            <Text className="text-[#8B5A3C] font-poppins-semibold text-base text-center">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
