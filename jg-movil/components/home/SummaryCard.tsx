import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  badge?: number;
  badgeBgClass?: string;
  badgeTextClass?: string;
  onPress?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  iconBgColor,
  badge,
  badgeBgClass = 'bg-gray-100',
  badgeTextClass = 'text-gray-600',
  onPress,
}) => {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 shadow-md"
      style={{ minWidth: '47%', flex: 1 }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        {badge !== undefined && (
          <View className={`px-2 py-1 rounded-full ${badgeBgClass}`}>
            <Text className={`text-xs font-poppins-bold ${badgeTextClass}`}>
              {badge}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-2xl font-poppins-bold text-[#3d2b1f] mb-1">
        {value}
      </Text>
      <Text className="text-xs text-gray-500 font-poppins">{title}</Text>
    </TouchableOpacity>
  );
};
