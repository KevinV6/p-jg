import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  actionColor?: string;
  onActionPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText = 'Ver todos →',
  actionColor = '#402612',
  onActionPress,
}) => {
  return (
    <View className="flex-row justify-between items-center mb-3">
      <Text className="text-lg font-poppins-bold text-[#3d2b1f]">{title}</Text>
      {onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text
            className="text-sm font-poppins-semibold"
            style={{ color: actionColor }}
          >
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
