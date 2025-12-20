import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface FilterOption {
  key: string;
  label: string;
}

interface FilterTabsProps {
  options: FilterOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  options,
  selectedKey,
  onSelect,
}) => {
  return (
    <View className="px-4 py-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {options.map((option) => {
          const isSelected = selectedKey === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              className={`px-4 py-2.5 rounded-xl ${
                isSelected ? 'bg-[#402612]' : 'bg-white border border-[#E8DFD4]'
              }`}
              onPress={() => onSelect(option.key)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-poppins-semibold ${
                  isSelected ? 'text-[#F6EBD7]' : 'text-[#8B5A3C]'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
