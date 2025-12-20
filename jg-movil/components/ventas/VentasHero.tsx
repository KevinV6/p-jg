import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ActionButtonProps {
  title: string;
  icon: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  icon,
  onPress,
  variant = 'primary',
}) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center py-5 px-8 rounded-3xl w-full ${
        isPrimary ? 'bg-[#402612]' : 'bg-white'
      }`}
      style={
        isPrimary
          ? {
              shadowColor: '#402612',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 6,
            }
          : {
              borderWidth: 2,
              borderColor: '#402612',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }
      }
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons
        name={icon as any}
        size={28}
        color={isPrimary ? '#FFFFFF' : '#402612'}
      />
      <Text
        className={`text-lg font-poppins-black ml-3 ${
          isPrimary ? 'text-white' : 'text-[#402612]'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

interface VentasHeroProps {
  onNuevaVenta: () => void;
  onHistorial: () => void;
}

export const VentasHero: React.FC<VentasHeroProps> = ({
  onNuevaVenta,
  onHistorial,
}) => {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <View
        className="w-40 h-40 rounded-full justify-center items-center mb-8 border-4 bg-white"
        style={{
          borderColor: '#402612',
          shadowColor: '#402612',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Ionicons name="cart" size={90} color="#402612" />
      </View>
      <Text className="text-4xl font-poppins-black text-[#402612] mb-4 text-center">
        Nueva Venta
      </Text>
      <Text className="text-lg font-poppins-medium text-[#8B5A3C] text-center mb-10 px-4">
        Comienza a registrar una nueva venta seleccionando los productos
      </Text>

      <View className="w-full gap-4">
        <ActionButton
          title="INICIAR NUEVA VENTA"
          icon="add-circle"
          onPress={onNuevaVenta}
          variant="primary"
        />
        <ActionButton
          title="VER HISTORIAL"
          icon="time"
          onPress={onHistorial}
          variant="outline"
        />
      </View>
    </View>
  );
};
