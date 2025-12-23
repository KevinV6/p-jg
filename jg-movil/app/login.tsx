import { ErrorModal, InputField, LoadingModal, SwitchAuthLink } from '@/components/auth';
import { GradientButton } from '@/components/shared/GradientButton';
import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Redirect } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading: authLoading, isAuthenticated, error, errorTitle, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para modal de error personalizado
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalErrorTitle, setModalErrorTitle] = useState('Error');
  
  // Ref para evitar mostrar el mismo error dos veces
  const lastErrorRef = useRef<string | null>(null);

  // Mostrar error del contexto
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      setModalErrorTitle(errorTitle || 'Error');
      setErrorMessage(error);
      setShowErrorModal(true);
      clearError();
    }
  }, [error, errorTitle]);

  // Limpiar ref cuando se cierra el modal
  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setTimeout(() => {
      lastErrorRef.current = null;
    }, 500);
  };

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
      setModalErrorTitle('Campos incompletos');
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
            <InputField
              icon="person-outline"
              placeholder="Ingresa tu usuario"
              value={username}
              onChangeText={setUsername}
            />

            <InputField
              icon="lock-closed-outline"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

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
          <SwitchAuthLink
            question="¿No tienes una cuenta?"
            actionText="Regístrate"
            onPress={() => router.push('/register')}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Carga */}
      <LoadingModal
        visible={isSubmitting}
        message="Iniciando sesión..."
        submessage="Por favor espera"
      />

      {/* Modal de Error */}
      <ErrorModal
        visible={showErrorModal}
        title={modalErrorTitle}
        message={errorMessage}
        onClose={handleCloseErrorModal}
      />
    </ScreenContainer>
  );
}
