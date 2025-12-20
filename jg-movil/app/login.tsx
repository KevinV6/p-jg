import { GradientButton } from '@/components/shared/GradientButton';
import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estado para modal de error personalizado tipo Gralis
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('Error');
  const [loadingMessage, setLoadingMessage] = useState('Iniciando sesión...');

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorTitle('Campos incompletos');
      setErrorMessage('Por favor ingrese usuario y contraseña');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    setLoadingMessage('Iniciando sesión...');
    const success = await login(username, password);
    setLoading(false);

    if (success) {
      router.replace('/(tabs)');
    } else {
      setErrorTitle('Error de autenticación');
      setErrorMessage('Usuario o contraseña incorrectos');
      setShowErrorModal(true);
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
       

          {/* Header estilo Gralis */}
          <View className="items-center mb-8">
            <Text className="font-serif text-[40px] font-bold mb-5 text-[#3d2b1f] tracking-[2px]">
              JG
            </Text>
            <View className="w-[90px] h-[90px] rounded-full justify-center items-center mb-4 bg-white">
              <Ionicons name="storefront" size={50} color="#402612" />
            </View>
            <Text className="text-[18px] font-poppins-semibold text-[#3d2b1f] mb-2">
              Iniciar Sesión
            </Text>
          </View>

          {/* Form fields estilo Gralis */}
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

            {/* Botón de Login estilo Gralis */}
            <GradientButton
              onPress={handleLogin}
              title={loading ? "INICIANDO SESIÓN..." : "INICIAR SESIÓN"}
              disabled={!username || !password}
              loading={loading}
              className="mt-4"
            />

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 font-poppins-medium">
                O
              </Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Google sign-in button */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl py-4"
            >
              <View className="w-6 h-6 mr-3">
                <Image
                  source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-gray-800 font-poppins-medium text-base">
                Continuar con Google
              </Text>
            </TouchableOpacity>
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

          {/* Credenciales de prueba */}
          {/* <View 
            className="mt-4 p-4 rounded-xl border-l-4 bg-white"
            style={{ borderLeftColor: '#402612' }}
          >
            <Text className="text-base font-poppins-bold mb-2 text-[#402612]">
              Credenciales de prueba:
            </Text>
            <Text className="text-sm font-poppins-medium text-gray-600">Usuario: admin</Text>
            <Text className="text-sm font-poppins-medium text-gray-600">Contraseña: admin123</Text>
          </View> */}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Carga estilo Gralis */}
      <Modal
        visible={loading}
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
              {loadingMessage}
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
