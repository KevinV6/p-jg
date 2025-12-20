import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  title,
  disabled = false,
  loading = false,
  className = '',
}) => {
  return (
    <TouchableOpacity
      className={`overflow-hidden rounded-xl ${disabled || loading ? 'opacity-60' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={['#402612', '#8B5A3C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="py-4 items-center"
      >
        <Text className="text-white text-lg font-poppins-black">
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};
