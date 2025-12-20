import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigationType } from '@/hooks/use-navigation-type';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
}) => {
  return (
    <View className="items-center justify-center py-16 px-8">
      <View
        className="w-20 h-20 rounded-2xl justify-center items-center mb-5 bg-[#F6EBD7]"
      >
        <Ionicons name={icon as any} size={40} color="#8B5A3C" />
      </View>
      <Text className="text-lg font-poppins-bold text-[#402612] text-center mb-2">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-sm font-poppins-medium text-[#8B5A3C] text-center">
          {subtitle}
        </Text>
      )}
    </View>
  );
};

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  /** Si está en una pantalla con tab bar (ajusta la posición del botón) */
  hasTabBar?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'add',
  hasTabBar = true,
}) => {
  const { tabBarPaddingBottom } = useNavigationType();
  
  // Calcular la posición bottom del botón
  // Si tiene tab bar, debe estar por encima del tab bar
  const bottomPosition = hasTabBar ? 65 + tabBarPaddingBottom + 16 : 20;
  
  return (
    <TouchableOpacity
      className="absolute right-5 w-14 h-14 rounded-2xl justify-center items-center bg-[#402612]"
      style={{
        bottom: bottomPosition,
        shadowColor: '#402612',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon as any} size={28} color="#F6EBD7" />
    </TouchableOpacity>
  );
};
