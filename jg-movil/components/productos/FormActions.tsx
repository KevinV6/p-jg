import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Variantes Toggle
interface VariantesToggleProps {
  showVariantes: boolean;
  onToggle: () => void;
}

export function VariantesToggle({ showVariantes, onToggle }: VariantesToggleProps) {
  return (
    <View className="mb-6">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between bg-white border border-[#8B5A3C] rounded-xl px-4 py-4"
      >
        <View className="flex-row items-center">
          <Ionicons name="color-palette-outline" size={24} color="#8B5A3C" />
          <Text className="font-poppins-semibold text-[#402612] ml-3">
            Agregar variantes (Color, Sabor, etc.)
          </Text>
        </View>
        <View className={`w-12 h-7 rounded-full ${showVariantes ? 'bg-[#402612]' : 'bg-gray-300'} justify-center ${showVariantes ? 'items-end' : 'items-start'} px-1`}>
          <View className="w-5 h-5 bg-white rounded-full" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

// Save Button
interface SaveButtonProps {
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
  isEditing: boolean;
}

export function SaveButton({ onPress, disabled, loading, isEditing }: SaveButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-xl py-4 flex-row items-center justify-center mt-4 ${
        disabled || loading ? 'bg-[#8B5A3C]/50' : 'bg-[#402612]'
      }`}
    >
      {loading ? (
        <Text className="text-[#F6EBD7] font-poppins-bold text-lg">
          Guardando...
        </Text>
      ) : (
        <>
          <Ionicons name="save-outline" size={24} color="#F6EBD7" />
          <Text className="text-[#F6EBD7] font-poppins-bold text-lg ml-2">
            {isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
