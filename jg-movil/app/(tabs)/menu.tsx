import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function MenuScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    color = '#402612',
    showArrow = true,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    color?: string;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity 
      className="flex-row items-center p-5 mb-2 rounded-2xl bg-white"
      style={{ 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View 
        className="w-14 h-14 rounded-2xl justify-center items-center mr-4" 
        style={{ 
          backgroundColor: `${color}20`,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        }}
      >
        <Ionicons name={icon as any} size={26} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-poppins-bold mb-1 text-[#402612]">{title}</Text>
        {subtitle && <Text className="text-sm font-poppins-medium text-[#8B5A3C]">{subtitle}</Text>}
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={22} color="#402612" />}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer hasTabBar={true}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header del perfil */}
        <View className="p-6 mb-2">
          <View className="items-center mb-6">
            <View 
              className="w-28 h-28 rounded-3xl justify-center items-center mb-4 overflow-hidden"
              style={{ 
                shadowColor: '#402612',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={['#402612', '#8B5A3C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full justify-center items-center"
              >
                <Ionicons name="person" size={50} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text className="text-2xl font-poppins-black text-[#402612] mb-2">
              {user?.primernombre} {user?.apellidopaterno}
            </Text>
            <Text className="text-base font-poppins-semibold text-[#8B5A3C] mb-3">
              @{user?.nombreusuario}
            </Text>
            <View 
              className="px-5 py-2 rounded-full"
              style={{ 
                backgroundColor: '#00D9FF25',
                shadowColor: '#402612',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
              }}
            >
              <Text className="text-sm font-poppins-black text-[#402612]">
                {user?.rol?.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Sección de Ventas */}
        <View className="px-6 mb-6">
          <Text className="text-xs font-poppins-black text-[#8B5A3C] px-2 mb-3 uppercase">
            Ventas
          </Text>
          <MenuItem
            icon="time-outline"
            title="Historial de Ventas"
            subtitle="Ver todas las ventas realizadas"
            onPress={() => router.push('/historial-ventas')}
            color="#402612"
          />
        </View>

        {/* Sección de Cuenta */}
        <View className="px-6 mb-6">
          <Text className="text-xs font-poppins-black text-[#8B5A3C] px-2 mb-3 uppercase">
            Cuenta
          </Text>
          <MenuItem
            icon="person-outline"
            title="Mi Perfil"
            subtitle="Ver y editar información personal"
            onPress={() => Alert.alert('Perfil', 'Funcionalidad en desarrollo')}
            color="#8B5A3C"
          />
          <MenuItem
            icon="settings-outline"
            title="Configuración"
            subtitle="Preferencias de la aplicación"
            onPress={() => router.push('/configuracion')}
            color="#D4A574"
          />
        </View>

        {/* Sección de Información */}
        <View className="px-6 mb-6">
          <Text className="text-xs font-poppins-black text-[#8B5A3C] px-2 mb-3 uppercase">
            Información
          </Text>
          <MenuItem
            icon="help-circle-outline"
            title="Ayuda y Soporte"
            subtitle="Obtén ayuda sobre la aplicación"
            onPress={() => Alert.alert('Ayuda', 'Funcionalidad en desarrollo')}
            color="#00D98E"
          />
          <MenuItem
            icon="information-circle-outline"
            title="Acerca de"
            subtitle="Versión 1.0.0"
            onPress={() => Alert.alert('JG', 'Sistema de Gestión Comercial\nVersión 1.0.0')}
            color="#FFB800"
          />
        </View>

        {/* Cerrar Sesión */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            className="flex-row items-center p-5 rounded-2xl bg-white"
            style={{
              shadowColor: '#FF0055',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 3,
            }}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View
              className="w-14 h-14 rounded-2xl justify-center items-center mr-4"
              style={{ backgroundColor: '#FF005515' }}
            >
              <Ionicons name="log-out-outline" size={26} color="#FF0055" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-poppins-bold text-[#FF0055]">
                Cerrar Sesión
              </Text>
              <Text className="text-sm font-poppins-medium text-[#FF005590] mt-0.5">
                Salir de la aplicación
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#FF0055" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center p-6 pb-8">
          <Text className="text-sm font-poppins-bold text-[#8B5A3C]">JG © 2024</Text>
          <Text className="text-xs font-poppins-medium text-[#8B5A3C] mt-1">
            Sistema de Gestión Comercial
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
