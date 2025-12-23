import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, View } from 'react-native';

// Profile Form Input
interface ProfileFormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  editable: boolean;
  required?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function ProfileFormInput({
  label,
  value,
  onChangeText,
  placeholder,
  editable,
  required = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: ProfileFormInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-2">
        {label} {required && '*'}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8B5A3C80"
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className={`bg-[#F6EBD7] border rounded-xl px-4 py-3 font-poppins-regular text-[#402612] ${
          editable ? 'border-[#8B5A3C]' : 'border-transparent'
        }`}
      />
    </View>
  );
}
