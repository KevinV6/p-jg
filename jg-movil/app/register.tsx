import { ErrorModal, InputField, LoadingModal, SwitchAuthLink } from '@/components/auth';
import { GradientButton } from '@/components/shared/GradientButton';
import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, errorTitle, clearError } = useAuth();
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
  const [modalErrorTitle, setModalErrorTitle] = useState('Error');
  
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

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setTimeout(() => {
      lastErrorRef.current = null;
    }, 500);
  };

  const handleRegister = async () => {
    const { nombreusuario, contrasenia, confirmarContrasenia, primernombre, apellidopaterno } =
      formData;

    if (!nombreusuario || !contrasenia || !primernombre || !apellidopaterno) {
      setModalErrorTitle('Campos incompletos');
      setErrorMessage('Por favor complete los campos obligatorios');
      setShowErrorModal(true);
      return;
    }

    if (contrasenia !== confirmarContrasenia) {
      setModalErrorTitle('Error de validación');
      setErrorMessage('Las contraseñas no coinciden');
      setShowErrorModal(true);
      return;
    }

    if (contrasenia.length < 6) {
      setModalErrorTitle('Contraseña inválida');
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

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
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

          <View className="gap-4">
            <InputField
              icon="person-outline"
              placeholder="Nombre de usuario *"
              value={formData.nombreusuario}
              onChangeText={(text) => updateForm('nombreusuario', text)}
            />

            <InputField
              icon="person"
              placeholder="Primer nombre *"
              value={formData.primernombre}
              onChangeText={(text) => updateForm('primernombre', text)}
              autoCapitalize="words"
            />

            <InputField
              icon="person"
              placeholder="Apellido paterno *"
              value={formData.apellidopaterno}
              onChangeText={(text) => updateForm('apellidopaterno', text)}
              autoCapitalize="words"
            />

            <InputField
              icon="person"
              placeholder="Apellido materno (opcional)"
              value={formData.apellidomaterno}
              onChangeText={(text) => updateForm('apellidomaterno', text)}
              autoCapitalize="words"
            />

            <InputField
              icon="mail-outline"
              placeholder="Email (opcional)"
              value={formData.email}
              onChangeText={(text) => updateForm('email', text)}
              keyboardType="email-address"
            />

            <InputField
              icon="lock-closed-outline"
              placeholder="Contraseña *"
              value={formData.contrasenia}
              onChangeText={(text) => updateForm('contrasenia', text)}
              secureTextEntry={true}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            <InputField
              icon="lock-closed-outline"
              placeholder="Confirmar contraseña *"
              value={formData.confirmarContrasenia}
              onChangeText={(text) => updateForm('confirmarContrasenia', text)}
              secureTextEntry={true}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </View>

          {/* Botón Registrarse */}
          <GradientButton
            onPress={handleRegister}
            title={isLoading ? 'REGISTRANDO...' : 'REGISTRARSE'}
            loading={isLoading}
            disabled={isLoading}
            className="mt-6 mb-4"
          />

          {/* Link iniciar sesión */}
          <SwitchAuthLink
            question="¿Ya tienes cuenta?"
            actionText="Inicia sesión"
            onPress={() => router.back()}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Carga */}
      <LoadingModal
        visible={isLoading}
        message="Registrando..."
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
