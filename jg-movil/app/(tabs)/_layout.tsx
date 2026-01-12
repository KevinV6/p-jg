import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigationType } from '@/hooks/use-navigation-type';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Padding mínimo para dispositivos con botones virtuales
const MIN_TAB_BAR_PADDING = 8;

export default function TabLayout() {
  const { tabBarElevation, tabBarPaddingBottom, hasVirtualButtons, isGestural } = useNavigationType();
  const insets = useSafeAreaInsets();
  
  // Garantizar padding mínimo para dispositivos con botones virtuales
  const effectivePaddingBottom = hasVirtualButtons 
    ? Math.max(tabBarPaddingBottom, MIN_TAB_BAR_PADDING) 
    : tabBarPaddingBottom;
  
  // Calcular altura total del tab bar incluyendo zona segura
  const tabBarHeight = 65 + effectivePaddingBottom;
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#402612',
        tabBarInactiveTintColor: '#8B5A3C',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5E5',
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: effectivePaddingBottom, // Padding dinámico según navegación
          paddingTop: 8,
          // Elevación diferenciada según tipo de navegación
          elevation: tabBarElevation,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: hasVirtualButtons ? -3 : -2 },
          shadowOpacity: hasVirtualButtons ? 0.15 : 0.1,
          shadowRadius: hasVirtualButtons ? 12 : 8,
          // Asegurar que respete la zona segura inferior
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Poppins-SemiBold',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventario"
        options={{
          title: 'Inventario',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "cube" : "cube-outline"} size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cobros"
        options={{
          title: 'Cobros',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ventas"
        options={{
          title: 'Ventas',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "cart" : "cart-outline"} size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "document-text" : "document-text-outline"} size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menú',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "menu" : "menu-outline"} size={size + 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
