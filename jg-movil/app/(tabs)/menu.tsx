import { 
  MenuItem, 
  MenuSection, 
  ProfileHeader, 
  LogoutButton, 
  MenuFooter 
} from '@/components/menu';
import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MenuScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutRequest = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'login' }],
        })
      );
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ScreenContainer hasTabBar={true}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header del perfil */}
        <ProfileHeader user={user} />

        {/* Sección de Ventas */}
        <MenuSection title="Ventanas">
          <MenuItem
            icon="time-outline"
            title="Historial de Ventas"
            subtitle="Ver todas las ventas realizadas"
            onPress={() => router.push('/historial-ventas')}
            color="#402612"
          />
          <MenuItem
            icon="people-outline"
            title="Clientes"
            subtitle="Gestionar clientes registrados"
            onPress={() => router.push('/clientes')}
            color="#3B82F6"
          />
        </MenuSection>

        {/* Sección de Cuenta */}
        <MenuSection title="Cuenta">
          <MenuItem
            icon="person-outline"
            title="Mi Perfil"
            subtitle="Ver y editar información personal"
            onPress={() => router.push('/perfil')}
            color="#8B5A3C"
          />
          <MenuItem
            icon="settings-outline"
            title="Configuración"
            subtitle="Preferencias de la aplicación"
            onPress={() => router.push('/configuracion')}
            color="#D4A574"
          />
        </MenuSection>

        {/* Sección de Información */}
        <MenuSection title="Información">
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

          {/* Cerrar Sesión */}
          <LogoutButton onPress={handleLogoutRequest} />
        </MenuSection>

        {/* Footer */}
        <MenuFooter />
      </ScrollView>

      {/* Modal de Cerrar Sesión */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent
        onRequestClose={() => !isLoggingOut && setShowLogoutModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            <View className="bg-gradient-to-br from-red-500 to-red-600 px-6 py-8 items-center" style={{ backgroundColor: '#EF4444' }}>
              <View className="w-20 h-20 rounded-full bg-white/20 justify-center items-center mb-4">
                <Ionicons name="log-out-outline" size={40} color="white" />
              </View>
              <Text className="text-2xl font-poppins-black text-white mb-2">
                Cerrar Sesión
              </Text>
              <Text className="text-base font-poppins-regular text-white/90 text-center">
                ¿Estás seguro que deseas salir?
              </Text>
            </View>

            {/* Info del usuario */}
            <View className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-[#402612] justify-center items-center mr-3">
                  <Ionicons name="person" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-poppins-bold text-[#402612]">
                    {user?.primernombre} {user?.apellidopaterno}
                  </Text>
                  <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
                    @{user?.nombreusuario}
                  </Text>
                </View>
              </View>
            </View>

            {/* Botones */}
            <View className="p-6">
              <TouchableOpacity
                onPress={handleLogoutConfirm}
                disabled={isLoggingOut}
                className="bg-[#EF4444] rounded-2xl py-4 mb-3 flex-row items-center justify-center"
                style={{
                  opacity: isLoggingOut ? 0.7 : 1,
                  shadowColor: '#EF4444',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
                activeOpacity={0.8}
              >
                {isLoggingOut ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-poppins-bold text-base ml-2">
                      Cerrando sesión...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="log-out-outline" size={20} color="white" />
                    <Text className="text-white font-poppins-bold text-base ml-2">
                      Sí, cerrar sesión
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="bg-gray-100 rounded-2xl py-4 flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
                <Text className="text-gray-700 font-poppins-semibold text-base ml-2">
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
