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
import React from 'react';
import {
  Alert,
  ScrollView,
} from 'react-native';

export default function MenuScreen() {
  const router = useRouter();
  const navigation = useNavigation();
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
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'login' }],
              })
            );
          },
        },
      ]
    );
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
        </MenuSection>

        {/* Cerrar Sesión */}
        <LogoutButton onPress={handleLogout} />

        {/* Footer */}
        <MenuFooter />
      </ScrollView>
    </ScreenContainer>
  );
}
