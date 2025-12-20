import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type ViewMode = 'list' | 'grid';

interface ViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ mode, onModeChange }) => {
  return (
    <View className="flex-row bg-[#F6EBD7] rounded-xl p-1">
      <TouchableOpacity
        className={`flex-row items-center px-3 py-2 rounded-lg ${
          mode === 'list' ? 'bg-[#402612]' : 'bg-transparent'
        }`}
        onPress={() => onModeChange('list')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="list"
          size={18}
          color={mode === 'list' ? '#FFFFFF' : '#8B5A3C'}
        />
        <Text
          className={`ml-1.5 text-xs font-poppins-semibold ${
            mode === 'list' ? 'text-white' : 'text-[#8B5A3C]'
          }`}
        >
          Lista
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-row items-center px-3 py-2 rounded-lg ${
          mode === 'grid' ? 'bg-[#402612]' : 'bg-transparent'
        }`}
        onPress={() => onModeChange('grid')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="grid"
          size={18}
          color={mode === 'grid' ? '#FFFFFF' : '#8B5A3C'}
        />
        <Text
          className={`ml-1.5 text-xs font-poppins-semibold ${
            mode === 'grid' ? 'text-white' : 'text-[#8B5A3C]'
          }`}
        >
          Cuadros
        </Text>
      </TouchableOpacity>
    </View>
  );
};

interface InventarioHeaderProps {
  totalProductos: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const InventarioHeader: React.FC<InventarioHeaderProps> = ({
  totalProductos,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <View className="flex-row items-center justify-between px-4 mb-3">
      <View>
        <Text className="text-sm font-poppins-medium text-[#8B5A3C]">
          {totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}
        </Text>
      </View>
      <ViewToggle mode={viewMode} onModeChange={onViewModeChange} />
    </View>
  );
};
