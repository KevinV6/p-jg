import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Types
interface Categoria {
  idcategoria: number;
  nombrecategoria: string;
}

// Category Selector
interface CategorySelectorProps {
  selectedId: number;
  categorias: Categoria[];
  onPress: () => void;
}

export function CategorySelector({ selectedId, categorias, onPress }: CategorySelectorProps) {
  const selectedCategoria = categorias.find(c => c.idcategoria === selectedId);
  
  return (
    <View className="mb-6">
      <Text className="text-base font-poppins-bold mb-3 text-[#3d2b1f]">Categoría</Text>
      <TouchableOpacity 
        onPress={onPress}
        className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-4 flex-row items-center justify-between"
      >
        <Text className="font-poppins-regular text-[#402612]">
          {selectedCategoria?.nombrecategoria || 'Seleccionar categoría'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#8B5A3C" />
      </TouchableOpacity>
    </View>
  );
}

// Category Modal
interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  categorias: Categoria[];
  selectedId: number;
  onSelect: (id: number) => void;
}

export function CategoryModal({ visible, onClose, categorias, selectedId, onSelect }: CategoryModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-[#F6EBD7] rounded-t-3xl max-h-[70%]">
          <View className="bg-[#402612] rounded-t-3xl px-4 py-4 flex-row items-center justify-between">
            <Text className="text-lg font-poppins-bold text-[#F6EBD7]">Seleccionar Categoría</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#F6EBD7" />
            </TouchableOpacity>
          </View>
          <View className="p-4">
            {categorias.map(cat => (
              <TouchableOpacity
                key={cat.idcategoria}
                onPress={() => {
                  onSelect(cat.idcategoria);
                  onClose();
                }}
                className={`py-4 px-4 rounded-xl mb-2 ${
                  selectedId === cat.idcategoria 
                    ? 'bg-[#402612]' 
                    : 'bg-white border border-[#E5E5E5]'
                }`}
              >
                <Text className={`font-poppins-semibold ${
                  selectedId === cat.idcategoria ? 'text-[#F6EBD7]' : 'text-[#402612]'
                }`}>
                  {cat.nombrecategoria}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Text Input Field
interface ProductTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
}

export function ProductTextInput({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  multiline = false,
  required = false
}: ProductTextInputProps) {
  return (
    <View className="mb-6">
      <Text className="text-base font-poppins-bold mb-3 text-[#3d2b1f]">
        {label} {required && '*'}
      </Text>
      <TextInput
        className={`bg-white border border-[#8B5A3C] rounded-xl px-4 font-poppins-regular text-[#402612] ${
          multiline ? 'h-24 py-3' : 'py-4'
        }`}
        placeholder={placeholder}
        placeholderTextColor="#8B5A3C80"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}
