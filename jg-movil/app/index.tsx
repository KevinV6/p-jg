import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar spinner mientras verifica la autenticación
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FFF8F0]">
        <ActivityIndicator size="large" color="#402612" />
      </View>
    );
  }

  // Redirigir según el estado de autenticación
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
