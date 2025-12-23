import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

// Password Input with Toggle
interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  showPassword: boolean;
  onTogglePassword: () => void;
}

export function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder,
  showPassword,
  onTogglePassword,
}: PasswordInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-2">
        {label}
      </Text>
      <View className="flex-row items-center bg-white border border-[#8B5A3C] rounded-xl px-4">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8B5A3C80"
          secureTextEntry={!showPassword}
          className="flex-1 py-3 font-poppins-regular text-[#402612]"
        />
        <TouchableOpacity onPress={onTogglePassword}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#8B5A3C" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Requirement Item
interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <View className="flex-row items-center mb-1 last:mb-0">
      <Ionicons 
        name={met ? 'checkmark-circle' : 'ellipse-outline'} 
        size={16} 
        color={met ? '#00D98E' : '#8B5A3C'} 
      />
      <Text className="ml-2 text-xs font-poppins-regular text-[#402612]">
        {text}
      </Text>
    </View>
  );
}

// Password Requirements Indicator
interface PasswordRequirementsProps {
  newPassword: string;
  confirmPassword: string;
}

export function PasswordRequirements({ newPassword, confirmPassword }: PasswordRequirementsProps) {
  const hasMinLength = newPassword.length >= 6;
  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';

  return (
    <View className="bg-[#402612]/10 rounded-xl p-3">
      <RequirementItem
        met={hasMinLength}
        text="Mínimo 6 caracteres"
      />
      <RequirementItem
        met={passwordsMatch}
        text="Las contraseñas coinciden"
      />
    </View>
  );
}
