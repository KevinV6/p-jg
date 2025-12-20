import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Buscar...',
}) => {
  return (
    <View className="flex-row items-center mx-4 my-3 p-4 rounded-xl bg-white shadow-md">
      <Ionicons name="search" size={22} color="#402612" />
      <TextInput
        className="flex-1 ml-3 text-base font-poppins text-[#3d2b1f]"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={22} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );
};
