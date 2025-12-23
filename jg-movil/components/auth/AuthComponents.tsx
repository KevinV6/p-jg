import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Loading Modal Component
interface LoadingModalProps {
  visible: boolean;
  message?: string;
  submessage?: string;
}

export function LoadingModal({ visible, message = 'Cargando...', submessage = 'Por favor espera' }: LoadingModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-3xl p-8 items-center" style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <ActivityIndicator size="large" color="#402612" />
          <Text className="text-lg font-poppins-semibold text-[#402612] mt-4">
            {message}
          </Text>
          <Text className="text-sm font-poppins text-gray-600 mt-2">
            {submessage}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

// Error Modal Component
interface ErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function ErrorModal({ visible, title, message, onClose }: ErrorModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-center items-center px-6">
        <View 
          className="bg-white rounded-3xl p-6 w-full max-w-sm"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Icono de Error */}
          <View className="items-center mb-4">
            <View className="bg-red-100 rounded-full p-4 mb-3">
              <Ionicons name="close-circle" size={48} color="#EF4444" />
            </View>
            <Text className="text-xl font-poppins-bold text-gray-900 text-center">
              {title}
            </Text>
          </View>

          {/* Mensaje de Error */}
          <Text className="text-base font-poppins text-gray-600 text-center mb-6">
            {message}
          </Text>

          {/* Botón de Cerrar */}
          <TouchableOpacity
            onPress={onClose}
            className="bg-[#402612] rounded-2xl py-4"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-poppins-bold text-base">
              Entendido
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Input Field Component
interface InputFieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

export function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  showPassword,
  onTogglePassword,
  autoCapitalize = 'none',
  keyboardType = 'default',
}: InputFieldProps) {
  return (
    <View className="bg-white rounded-xl flex-row items-center border border-[#8B5A3C] px-4 py-3">
      <Ionicons name={icon} size={20} color="#8B5A3C" />
      <TextInput
        className="flex-1 ml-3 text-base font-poppins-regular text-[#402612]"
        placeholder={placeholder}
        placeholderTextColor="#8B5A3C"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPassword}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
      />
      {secureTextEntry && onTogglePassword && (
        <TouchableOpacity onPress={onTogglePassword}>
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#8B5A3C"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

// Auth Header Component
interface AuthHeaderProps {
  title: string;
}

export function AuthHeader({ title }: AuthHeaderProps) {
  return (
    <View className="items-center mb-8">
      {/* eslint-disable-next-line @typescript-eslint/no-require-imports */}
      <View className="w-[180px] h-[180px] justify-center items-center">
        <Text className="text-6xl">🛒</Text>
      </View>
      <Text className="text-[18px] font-poppins-semibold text-[#3d2b1f] mb-2 mt-4">
        {title}
      </Text>
    </View>
  );
}

// Switch Auth Link Component
interface SwitchAuthLinkProps {
  question: string;
  actionText: string;
  onPress: () => void;
}

export function SwitchAuthLink({ question, actionText, onPress }: SwitchAuthLinkProps) {
  return (
    <View className="flex-row justify-center mt-6 mb-4">
      <Text className="text-gray-600 font-poppins-medium">
        {question}{' '}
      </Text>
      <TouchableOpacity onPress={onPress}>
        <Text className="text-[#402612] font-poppins-semibold">
          {actionText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
