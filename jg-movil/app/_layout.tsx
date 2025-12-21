import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

import { AuthProvider } from '@/contexts/AuthContext';
import { CobrosProvider } from '@/contexts/CobrosContext';
import { InventarioProvider } from '@/contexts/InventarioContext';
import { PedidosProvider } from '@/contexts/PedidosContext';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { VentasProvider } from '@/contexts/VentasContext';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { useConnection } from '@/hooks/use-connection';
import { ConnectionErrorScreen } from '@/components/shared/ConnectionErrorScreen';

// Prevenir que el splash screen se oculte automáticamente
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'login',
};

function RootNavigator() {
  const { theme } = useTheme();
  const { isFullyConnected, isChecking, checkConnection } = useConnection();
  const [loaded, error] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  // Mostrar pantalla de error de conexión si no hay conectividad completa
  if (!isFullyConnected && !isChecking) {
    return (
      <ConnectionErrorScreen
        error="No hay conexión a internet o no se puede conectar con el servidor"
        onRetry={checkConnection}
        isRetrying={isChecking}
      />
    );
  }
  
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <InventarioProvider>
          <VentasProvider>
            <PedidosProvider>
              <CobrosProvider>
                <AppDataProvider>
                  <PaperProvider>
                    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
                        <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="login" options={{ headerShown: false }} />
                      <Stack.Screen name="register" options={{ headerShown: false }} />
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen
                        name="producto-form"
                        options={{ 
                          headerShown: false,
                          presentation: 'modal'
                        }}
                      />
                      <Stack.Screen
                        name="cobro-form"
                        options={{ 
                          headerShown: false,
                          presentation: 'modal'
                        }}
                      />
                      <Stack.Screen
                        name="pedido-detalle"
                        options={{ 
                          headerShown: false,
                          title: 'Detalle del Pedido'
                        }}
                      />
                      <Stack.Screen
                        name="comprobante-venta"
                        options={{ 
                          headerShown: false,
                          title: 'Comprobante de Venta'
                        }}
                      />
                      <Stack.Screen
                        name="historial-ventas"
                        options={{ 
                          headerShown: false,
                          title: 'Historial de Ventas'
                        }}
                      />
                      <Stack.Screen
                        name="nueva-venta"
                        options={{ 
                          headerShown: false,
                          title: 'Nueva Venta'
                        }}
                      />
                      <Stack.Screen
                        name="configuracion"
                        options={{ 
                          headerShown: false
                        }}
                      />
                    </Stack>
                    <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
                  </ThemeProvider>
                </PaperProvider>
              </AppDataProvider>
            </CobrosProvider>
          </PedidosProvider>
        </VentasProvider>
      </InventarioProvider>
    </AuthProvider>
  </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootNavigator />
    </AppThemeProvider>
  );
}
