import { GradientButton } from '@/components/shared/GradientButton';
import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    nombreusuario: '',
    contrasenia: '',
    confirmarContrasenia: '',
    email: '',
    primernombre: '',
    apellidopaterno: '',
    apellidomaterno: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Mostrar error del contexto
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowErrorModal(true);
      clearError();
    }
  }, [error]);

  const handleRegister = async () => {
    const { nombreusuario, contrasenia, confirmarContrasenia, primernombre, apellidopaterno } =
      formData;

    if (!nombreusuario || !contrasenia || !primernombre || !apellidopaterno) {
      setErrorMessage('Por favor complete los campos obligatorios');
      setShowErrorModal(true);
      return;
    }

    if (contrasenia !== confirmarContrasenia) {
      setErrorMessage('Las contraseñas no coinciden');
      setShowErrorModal(true);
      return;
    }

    if (contrasenia.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres');
      setShowErrorModal(true);
      return;
    }

    const success = await register({
      nombreusuario: formData.nombreusuario,
      contrasenia: formData.contrasenia,
      email: formData.email || undefined,
      primernombre: formData.primernombre,
      apellidopaterno: formData.apellidopaterno,
      apellidomaterno: formData.apellidomaterno || undefined,
    });

    if (success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Ionicons name="arrow-back" size={24} color="#402612" />
          </TouchableOpacity>

          <View className="mb-6 items-center">
            <Image
              source={require('@/assets/images/logos/Logo carrito JG.png')}
              style={{ width: 140, height: 140 }}
              resizeMode="contain"
            />
          </View>

          <View className="mb-8">
            <Text className="text-4xl font-poppins-black text-[#402612] mb-2">
              Crear Cuenta
            </Text>
            <Text className="text-base font-poppins-regular text-[#8B5A3C]">
              Complete sus datos para registrarse
            </Text>
          </View>

          {/* Nombre de usuario */}
          <View className="mb-4">
            <View className="bg-white rounded-xl flex-row items-center border border-[#8B5A3C] px-4 py-3">
              <Ionicons name="person-outline" size={20} color="#8B5A3C" />
              <TextInput
                className="flex-1 ml-3 text-base font-poppins-regular text-[#402612]"
                placeholder="Nombre de usuario *"
                placeholderTextColor="#8B5A3C"
                value={formData.nombreusuario}
                onChangeText={(text) => setFormData({ ...formData, nombreusuario: text })}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Primer nombre */}
          <View className="mb-4">
            <View className="bg-white rounded-xl flex-row items-center border border-[#8B5A3C] px-4 py-3">
              <Ionicons name="person" size={20} color="#8B5A3C" />
              <TextInput
                className="flex-1 ml-3 text-base font-poppins-regular text-[#402612]"
                placeholder="Primer nombre *"
                placeholderTextColor="#8B5A3C"
                value={formData.primernombre}
                onChangeText={(text) => setFormData({ ...formData, primernombre: text })}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Apellido paterno */}
          <View className="mb-4">
            <View className="bg-white rounded-xl flex-row items-center border border-[#8B5A3C] px-4 py-3">
              <Ionicons name="person" size={20} color="#8B5A3C" />
              <TextInput
                className="flex-1 ml-3 text-base font-poppins-regular text-[#402612]"
                placeholder="Apellido paterno *"
                placeholderTextColor="#8B5A3C"
                value={formData.apellidopaterno}
                onChangeText={(text) => setFormData({ ...formData, apellidopaterno: text })}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Apellido materno */}
          <View className="mb-4">
            <View className="bg-white rounded-xl flex-row items-center border border-[#8B5A3C] px-4 py-3">
              <Ionicons name="person" size={20} color="#8B5A3C" />
              <TextInput
                className="flex-1 ml-3 text-base font-poppins-regular text-[#402612]"
                placeholder="Apellido materno (opcional)"
                placeholderTextColor="#8B5A3C"
                value={formData.apellidomaterno}
                onChangeText={(text) => setFormData({ ...formData, apellidomaterno: text })}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-4">
            <View className="bg-white rounded-xl flex-row items-center border border-[#8B5A3C] px-4 py-3">
              <Ionicons name="mail-outline" size={20} color="#8B5A3C" />
              <TextInput
                className="flex-1 ml-3 text-base font-poppins-regular text-[#402612]"
                placeholder="Email (opcional)"
                placeholderTextColor="#8B5A3C"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Contraseña */}
          <View className="mb-4">
            <View className="bg-white rounded-xl flex-row items-center border border-[#8B5A3C] px-4 py-3">
              <Ionicons name="lock-closed-outline" size={20} color="#8B5A3C" />
              <TextInput
                className="flex-1 ml-3 text-base font-poppins-regular text-[#402612]"
                placeholder="Contraseña *"
                placeholderTextColor="#8B5A3C"
                value={formData.contrasenia}
                onChangeText={(text) => setFormData({ ...formData, contrasenia: text })}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#8B5A3C"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar contraseña */}
          <View className="mb-6">
            <View className="bg-white rounded-xl flex-row items-center border border-[#8B5A3C] px-4 py-3">
              <Ionicons name="lock-closed-outline" size={20} color="#8B5A3C" />
              <TextInput
                className="flex-1 ml-3 text-base font-poppins-regular text-[#402612]"
                placeholder="Confirmar contraseña *"
                placeholderTextColor="#8B5A3C"
                value={formData.confirmarContrasenia}
                onChangeText={(text) => setFormData({ ...formData, confirmarContrasenia: text })}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#8B5A3C"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón Registrarse */}
          <GradientButton
            onPress={handleRegister}
            title={isLoading ? 'REGISTRANDO...' : 'REGISTRARSE'}
            loading={isLoading}
            disabled={isLoading}
            className="mb-4"
          />

          {/* Link iniciar sesión */}
          <TouchableOpacity className="items-center py-2" onPress={() => router.back()}>
            <Text className="text-base font-poppins-regular text-[#8B5A3C]">
              ¿Ya tienes cuenta?{' '}
              <Text className="font-poppins-bold text-[#402612]">Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de error */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm">
            <View className="bg-[#D32F2F] rounded-t-2xl px-4 py-4">
              <Text className="text-lg font-poppins-bold text-white">Error</Text>
            </View>

            <View className="p-6">
              <Text className="text-base font-poppins-regular text-[#402612] mb-6 text-center">
                {errorMessage}
              </Text>

              <TouchableOpacity
                onPress={() => setShowErrorModal(false)}
                className="bg-[#402612] rounded-xl py-3"
              >
                <Text className="text-center text-white font-poppins-semibold">Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
