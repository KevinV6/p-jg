import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ConnectionErrorScreenProps {
  error: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ConnectionErrorScreen: React.FC<ConnectionErrorScreenProps> = ({
  error,
  onRetry,
  isRetrying = false,
}) => {
  return (
    <View className="flex-1 bg-[#F6EBD7] justify-center items-center px-8">
      {/* Icono de error */}
      <View className="mb-8">
        <LinearGradient
          colors={['#FF5555', '#FF7777']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-32 h-32 rounded-full justify-center items-center"
          style={{
            shadowColor: '#FF5555',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Ionicons name="cloud-offline" size={64} color="#FFFFFF" />
        </LinearGradient>
      </View>

      {/* Título */}
      <Text className="text-2xl font-poppins-black text-[#402612] text-center mb-4">
        Sin Conexión
      </Text>

      {/* Mensaje de error */}
      <Text className="text-base font-poppins-regular text-[#8B5A3C] text-center mb-8 leading-6">
        {error}
      </Text>

      {/* Consejos */}
      <View className="bg-white rounded-2xl p-5 mb-8 w-full" style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}>
        <Text className="text-sm font-poppins-bold text-[#402612] mb-3">
          Verifica lo siguiente:
        </Text>
        
        <View className="flex-row items-start mb-2">
          <Ionicons name="checkmark-circle" size={20} color="#8B5A3C" style={{ marginTop: 2 }} />
          <Text className="text-sm font-poppins-regular text-[#8B5A3C] ml-3 flex-1">
            Tu conexión a Internet está activa
          </Text>
        </View>
        
        <View className="flex-row items-start mb-2">
          <Ionicons name="checkmark-circle" size={20} color="#8B5A3C" style={{ marginTop: 2 }} />
          <Text className="text-sm font-poppins-regular text-[#8B5A3C] ml-3 flex-1">
            El servidor está disponible
          </Text>
        </View>
        
        <View className="flex-row items-start">
          <Ionicons name="checkmark-circle" size={20} color="#8B5A3C" style={{ marginTop: 2 }} />
          <Text className="text-sm font-poppins-regular text-[#8B5A3C] ml-3 flex-1">
            No estás en modo avión
          </Text>
        </View>
      </View>

      {/* Botón de reintentar */}
      <TouchableOpacity
        onPress={onRetry}
        disabled={isRetrying}
        className="bg-[#402612] rounded-2xl px-8 py-4 flex-row items-center justify-center min-w-[200px]"
        style={{
          shadowColor: '#402612',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
          opacity: isRetrying ? 0.7 : 1,
        }}
      >
        {isRetrying ? (
          <>
            <ActivityIndicator color="#F6EBD7" size="small" />
            <Text className="text-[#F6EBD7] font-poppins-bold text-lg ml-3">
              Verificando...
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="refresh" size={24} color="#F6EBD7" />
            <Text className="text-[#F6EBD7] font-poppins-bold text-lg ml-3">
              Reintentar
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};
