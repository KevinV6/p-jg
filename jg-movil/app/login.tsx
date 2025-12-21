import { GradientButton } from '@/components/shared/GradientButton';
import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Redirect } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading: authLoading, isAuthenticated, error, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para modal de error personalizado
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('Error');

  // Mostrar error del contexto
  useEffect(() => {
    if (error) {
      setErrorTitle('Error de autenticación');
      setErrorMessage(error);
      setShowErrorModal(true);
      clearError();
    }
  }, [error]);

  // Si ya está autenticado, redirigir a tabs
  if (isAuthenticated && !authLoading) {
    return <Redirect href="/(tabs)" />;
  }

  // Si está verificando la autenticación inicial, mostrar loading
  if (authLoading && !isSubmitting) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FFF8F0]">
        <ActivityIndicator size="large" color="#402612" />
      </View>
    );
  }

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorTitle('Campos incompletos');
      setErrorMessage('Por favor ingrese usuario y contraseña');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    const success = await login({ nombreusuario: username, contrasenia: password });
    setIsSubmitting(false);

    if (success) {
      router.replace('/(tabs)');
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 16 }}
          keyboardShouldPersistTaps="handled"
        >

          {/* Header */}
          <View className="items-center mb-8">
            <Image
              source={require('@/assets/images/logos/Logo carrito JG.png')}
              style={{ width: 180, height: 180 }}
              resizeMode="contain"
            />
            <Text className="text-[18px] font-poppins-semibold text-[#3d2b1f] mb-2 mt-4">
              Iniciar Sesión
            </Text>
          </View>

          {/* Form fields */}
          <View className="gap-5">
            {/* Usuario field */}
            <View>
              <View
                className="bg-white rounded-xl flex-row items-center border border-[#8B5A3C] px-4 py-3"
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#8B5A3C"
                />
                <TextInput
                  className="flex-1 ml-3 text-base font-poppins-regular text-[#402612]"
                  placeholder="Ingresa tu usuario"
                  placeholderTextColor="#8B5A3C"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field estilo Gralis */}
            <View>
              <View
                className="bg-white rounded-xl flex-row items-center border border-[#8B5A3C] px-4 py-3"
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#8B5A3C"
                />
                <TextInput
                  className="flex-1 ml-3 text-base font-poppins-regular text-[#402612]"
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor="#8B5A3C"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#8B5A3C"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón de Login */}
            <GradientButton
              onPress={handleLogin}
              title={isSubmitting ? "INICIANDO SESIÓN..." : "INICIAR SESIÓN"}
              disabled={!username || !password || isSubmitting}
              loading={isSubmitting}
              className="mt-4"
            />
          </View>

          {/* Switch to Sign Up Link */}
          <View className="flex-row justify-center mt-6 mb-4">
            <Text className="text-gray-600 font-poppins-medium">
              ¿No tienes una cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text className="text-[#402612] font-poppins-semibold">
                Regístrate
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Carga */}
      <Modal
        visible={isSubmitting}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-3xl p-8 items-center" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <ActivityIndicator size="large" color="#402612" />
            <Text className="text-lg font-poppins-semibold text-[#402612] mt-4">
              Iniciando sesión...
            </Text>
            <Text className="text-sm font-poppins text-gray-600 mt-2">
              Por favor espera
            </Text>
          </View>
        </View>
      </Modal>

      {/* Modal de Error estilo Gralis */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View 
            className="bg-white rounded-3xl p-6 w-full max-w-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {/* Icono de Error */}
            <View className="items-center mb-4">
              <View className="bg-red-100 rounded-full p-4 mb-3">
                <Ionicons name="close-circle" size={48} color="#EF4444" />
              </View>
              <Text className="text-xl font-poppins-bold text-gray-900 text-center">
                {errorTitle}
              </Text>
            </View>

            {/* Mensaje de Error */}
            <Text className="text-base font-poppins text-gray-600 text-center mb-6">
              {errorMessage}
            </Text>

            {/* Botón de Cerrar */}
            <TouchableOpacity
              onPress={() => setShowErrorModal(false)}
              className="bg-[#402612] rounded-2xl py-4"
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-poppins-bold text-base">
                Entendido
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
