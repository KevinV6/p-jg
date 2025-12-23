import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';

// Types
interface ColorSwatchProps {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

interface InfoCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBgColor: string;
  iconColor: string;
  title: string;
  description: string;
}

interface ThemeToggleCardProps {
  isDark: boolean;
  onToggle: () => void;
}

interface ConfigHeaderProps {
  onBack: () => void;
}

// Common shadow style
const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
};

// Components
export function ConfigHeader({ onBack }: ConfigHeaderProps) {
  return (
    <View 
      className="bg-[#51453C] px-5 py-4 flex-row items-center"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <TouchableOpacity 
        onPress={onBack} 
        className="mr-4 w-10 h-10 rounded-full justify-center items-center bg-white"
      >
        <Ionicons name="arrow-back" size={22} color="#402612" />
      </TouchableOpacity>
      <Text className="text-2xl font-poppins-black text-white">
        Configuración
      </Text>
    </View>
  );
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="mt-6 px-4">
      <Text className="text-xs font-poppins-black px-2 mb-3 text-[#8B5A3C] uppercase">
        {title}
      </Text>
      {children}
    </View>
  );
}

export function ThemeToggleCard({ isDark, onToggle }: ThemeToggleCardProps) {
  return (
    <View 
      className="rounded-3xl overflow-hidden"
      style={cardShadow}
    >
      <View className="flex-row items-center justify-between p-5 bg-white">
        <View className="flex-row items-center flex-1">
          <View 
            className="w-14 h-14 rounded-2xl justify-center items-center mr-4"
            style={{ 
              backgroundColor: '#40261220',
              shadowColor: '#402612',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
            }}
          >
            <Ionicons 
              name={isDark ? 'moon' : 'sunny'} 
              size={26} 
              color="#402612" 
            />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-poppins-black text-[#402612] mb-1">
              Modo Oscuro
            </Text>
            <Text className="text-sm font-poppins-semibold text-[#8B5A3C]">
              {isDark ? 'Activado' : 'Desactivado'}
            </Text>
          </View>
        </View>
        <Switch
          value={isDark}
          onValueChange={onToggle}
          trackColor={{ false: '#E2E8F0', true: '#402612' }}
          thumbColor={isDark ? '#FFFFFF' : '#F8FAFC'}
          ios_backgroundColor="#E2E8F0"
        />
      </View>
    </View>
  );
}

export function InfoCard({ icon, iconBgColor, iconColor, title, description }: InfoCardProps) {
  return (
    <View className="flex-row items-start mb-5 last:mb-0">
      <View 
        className="w-10 h-10 rounded-full justify-center items-center mr-3"
        style={{ backgroundColor: iconBgColor }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-poppins-bold mb-2 text-[#402612]">
          {title}
        </Text>
        <Text className="text-sm font-poppins-medium text-[#8B5A3C] leading-5">
          {description}
        </Text>
      </View>
    </View>
  );
}

export function InfoSection() {
  return (
    <View 
      className="rounded-3xl p-5 bg-white"
      style={cardShadow}
    >
      <InfoCard
        icon="color-palette"
        iconBgColor="#8B5A3C20"
        iconColor="#8B5A3C"
        title="Paleta de Colores Gralis"
        description="Diseño con tonos cálidos y terrosos que transmiten confianza y profesionalismo."
      />
      <InfoCard
        icon="contrast"
        iconBgColor="#D4A57420"
        iconColor="#D4A574"
        title="Tema Independiente"
        description="El modo oscuro/claro es independiente de la configuración del sistema. Colores optimizados para ambos modos."
      />
    </View>
  );
}

export function ColorSwatch({ color, icon, label }: ColorSwatchProps) {
  return (
    <View className="items-center">
      <View 
        className="w-20 h-20 rounded-2xl mb-3 justify-center items-center"
        style={{ 
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Ionicons name={icon} size={30} color="#FFFFFF" />
      </View>
      <Text className="text-xs font-poppins-bold text-[#402612]">
        {label}
      </Text>
    </View>
  );
}

export function ColorPreviewSection() {
  const colors: ColorSwatchProps[] = [
    { color: '#402612', icon: 'flash', label: 'Principal' },
    { color: '#8B5A3C', icon: 'star', label: 'Secundario' },
    { color: '#D4A574', icon: 'heart', label: 'Acento' },
    { color: '#00D98E', icon: 'checkmark-circle', label: 'Éxito' },
    { color: '#FFB800', icon: 'alert-circle', label: 'Advertencia' },
    { color: '#FF0055', icon: 'close-circle', label: 'Peligro' },
  ];

  return (
    <View 
      className="rounded-3xl p-6 bg-white"
      style={cardShadow}
    >
      <View className="flex-row flex-wrap gap-4">
        {colors.map((color) => (
          <ColorSwatch key={color.label} {...color} />
        ))}
      </View>
    </View>
  );
}
