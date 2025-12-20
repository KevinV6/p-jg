import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface EmptySectionProps {
  icon: string;
  iconBgColor: string;
  message: string;
}

export const EmptySection: React.FC<EmptySectionProps> = ({
  icon,
  iconBgColor,
  message,
}) => {
  return (
    <View className="bg-white rounded-2xl p-6 items-center justify-center shadow-md">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: iconBgColor }}
      >
        <Ionicons name={icon as any} size={32} color="#9ca3af" />
      </View>
      <Text className="text-base font-poppins-medium text-gray-500">
        {message}
      </Text>
    </View>
  );
};
