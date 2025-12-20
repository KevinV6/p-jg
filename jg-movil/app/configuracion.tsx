import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ConfiguracionScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <ScreenContainer safeTop={false} statusBarStyle="light" statusBarColor="#51453C">
      {/* Header */}
      <SafeHeader backgroundColor="#51453C">
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
            onPress={() => router.back()} 
            className="mr-4 w-10 h-10 rounded-full justify-center items-center bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#402612" />
          </TouchableOpacity>
          <Text className="text-2xl font-poppins-black text-white">
            Configuración
          </Text>
        </View>
      </SafeHeader>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Sección Apariencia */}
        <View className="mt-6 px-4">
          <Text className="text-xs font-poppins-black px-2 mb-3 text-[#8B5A3C] uppercase">
            Apariencia
          </Text>
          <View 
            className="rounded-3xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View 
              className="flex-row items-center justify-between p-5 bg-white"
            >
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
                onValueChange={toggleTheme}
                trackColor={{ false: '#E2E8F0', true: '#402612' }}
                thumbColor={isDark ? '#FFFFFF' : '#F8FAFC'}
                ios_backgroundColor="#E2E8F0"
              />
            </View>
          </View>
        </View>

        {/* Sección Información */}
        <View className="mt-6 px-4">
          <Text className="text-xs font-poppins-black px-2 mb-3 text-[#8B5A3C] uppercase">
            Información
          </Text>
          <View 
            className="rounded-3xl p-5 bg-white"
            style={{ 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-row items-start mb-5">
              <View 
                className="w-10 h-10 rounded-full justify-center items-center mr-3"
                style={{ backgroundColor: '#8B5A3C20' }}
              >
                <Ionicons 
                  name="color-palette" 
                  size={20} 
                  color="#8B5A3C" 
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-poppins-bold mb-2 text-[#402612]">
                  Paleta de Colores Gralis
                </Text>
                <Text className="text-sm font-poppins-medium text-[#8B5A3C] leading-5">
                  Diseño con tonos cálidos y terrosos que transmiten confianza y profesionalismo.
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View 
                className="w-10 h-10 rounded-full justify-center items-center mr-3"
                style={{ backgroundColor: '#D4A57420' }}
              >
                <Ionicons 
                  name="contrast" 
                  size={20} 
                  color="#D4A574" 
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-poppins-bold mb-2 text-[#402612]">
                  Tema Independiente
                </Text>
                <Text className="text-sm font-poppins-medium text-[#8B5A3C] leading-5">
                  El modo oscuro/claro es independiente de la configuración del sistema. Colores optimizados para ambos modos.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vista Previa de Colores */}
        <View className="mt-6 px-4 mb-8">
          <Text className="text-xs font-poppins-black px-2 mb-4 text-[#8B5A3C] uppercase">
            Vista Previa de Colores
          </Text>
          <View 
            className="rounded-3xl p-6 bg-white"
            style={{ 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-row flex-wrap gap-4">
              <View className="items-center">
                <View 
                  className="w-20 h-20 rounded-2xl mb-3 justify-center items-center bg-[#402612]"
                  style={{ 
                    shadowColor: '#402612',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                >
                  <Ionicons name="flash" size={30} color="#FFFFFF" />
                </View>
                <Text className="text-xs font-poppins-bold text-[#402612]">
                  Principal
                </Text>
              </View>

              <View className="items-center">
                <View 
                  className="w-20 h-20 rounded-2xl mb-3 justify-center items-center bg-[#8B5A3C]"
                  style={{ 
                    shadowColor: '#8B5A3C',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                >
                  <Ionicons name="star" size={30} color="#FFFFFF" />
                </View>
                <Text className="text-xs font-poppins-bold text-[#402612]">
                  Secundario
                </Text>
              </View>

              <View className="items-center">
                <View 
                  className="w-20 h-20 rounded-2xl mb-3 justify-center items-center bg-[#D4A574]"
                  style={{ 
                    shadowColor: '#D4A574',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                >
                  <Ionicons name="heart" size={30} color="#FFFFFF" />
                </View>
                <Text className="text-xs font-poppins-bold text-[#402612]">
                  Acento
                </Text>
              </View>

              <View className="items-center">
                <View 
                  className="w-20 h-20 rounded-2xl mb-3 justify-center items-center bg-[#00D98E]"
                  style={{ 
                    shadowColor: '#00D98E',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={30} color="#FFFFFF" />
                </View>
                <Text className="text-xs font-poppins-bold text-[#402612]">
                  Éxito
                </Text>
              </View>

              <View className="items-center">
                <View 
                  className="w-20 h-20 rounded-2xl mb-3 justify-center items-center bg-[#FFB800]"
                  style={{ 
                    shadowColor: '#FFB800',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                >
                  <Ionicons name="alert-circle" size={30} color="#FFFFFF" />
                </View>
                <Text className="text-xs font-poppins-bold text-[#402612]">
                  Advertencia
                </Text>
              </View>

              <View className="items-center">
                <View 
                  className="w-20 h-20 rounded-2xl mb-3 justify-center items-center bg-[#FF0055]"
                  style={{ 
                    shadowColor: '#FF0055',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                >
                  <Ionicons name="close-circle" size={30} color="#FFFFFF" />
                </View>
                <Text className="text-xs font-poppins-bold text-[#402612]">
                  Peligro
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
