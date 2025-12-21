import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
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

export default function PerfilScreen() {
  const router = useRouter();
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const { showError, showSuccess, AlertComponent } = useCustomAlert();

  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    primernombre: '',
    apellidopaterno: '',
    apellidomaterno: '',
    email: '',
  });

  // Datos del cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        primernombre: user.primernombre || '',
        apellidopaterno: user.apellidopaterno || '',
        apellidomaterno: user.apellidomaterno || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    // Validaciones
    if (!formData.primernombre.trim()) {
      showError('Error', 'El primer nombre es requerido');
      return;
    }
    if (!formData.apellidopaterno.trim()) {
      showError('Error', 'El apellido paterno es requerido');
      return;
    }
    if (formData.email.trim() && !formData.email.includes('@')) {
      showError('Error', 'El email no es válido');
      return;
    }

    setIsLoading(true);
    try {
      const success = await updateUser({
        primernombre: formData.primernombre.trim(),
        apellidopaterno: formData.apellidopaterno.trim(),
        apellidomaterno: formData.apellidomaterno.trim() || undefined,
        email: formData.email.trim() || undefined,
      });

      if (success) {
        showSuccess('Éxito', 'Perfil actualizado correctamente');
        setEditMode(false);
      } else {
        showError('Error', 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      showError('Error', 'Ocurrió un error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validaciones
    if (!passwordData.currentPassword) {
      showError('Error', 'Ingresa tu contraseña actual');
      return;
    }
    if (!passwordData.newPassword) {
      showError('Error', 'Ingresa la nueva contraseña');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showError('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Error', 'Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (response.success) {
        showSuccess('Éxito', 'Contraseña actualizada correctamente');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showError('Error', response.error || 'No se pudo cambiar la contraseña');
      }
    } catch (error) {
      showError('Error', 'Ocurrió un error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        primernombre: user.primernombre || '',
        apellidopaterno: user.apellidopaterno || '',
        apellidomaterno: user.apellidomaterno || '',
        email: user.email || '',
      });
    }
    setEditMode(false);
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showError('Permisos Requeridos', 'Se necesita acceso a la cámara para tomar fotos');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showError('Permisos Requeridos', 'Se necesita acceso a la galería para seleccionar fotos');
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    setShowPhotoOptions(false);
    
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      showError('Error', 'No se pudo tomar la foto');
    }
  };

  const handlePickImage = async () => {
    setShowPhotoOptions(false);
    
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      showError('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const uploadPhoto = async (image: ImagePicker.ImagePickerAsset) => {
    setUploadingPhoto(true);
    try {
      const file = {
        uri: image.uri,
        mimeType: image.mimeType || 'image/jpeg',
        fileName: image.fileName || `avatar_${Date.now()}.jpg`,
      };

      const response = await authService.updateAvatar(file);

      if (response.success && response.data) {
        // Actualizar el contexto con el nuevo usuario
        await updateUser(response.data);
        showSuccess('Éxito', 'Foto de perfil actualizada');
      } else {
        showError('Error', response.error || 'No se pudo actualizar la foto');
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      showError('Error', 'Ocurrió un error al actualizar la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!user) {
    return (
      <ScreenContainer>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#402612" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer safeTop={false} statusBarStyle="light" statusBarColor="#402612">
      {AlertComponent()}
      
      {/* Header */}
      <SafeHeader>
        <View className="bg-[#402612] px-4 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#F6EBD7" />
            </TouchableOpacity>
            <Text className="text-xl font-poppins-semibold text-[#F6EBD7]">
              Mi Perfil
            </Text>
          </View>
          {!editMode && (
            <TouchableOpacity onPress={() => setEditMode(true)}>
              <Ionicons name="create-outline" size={24} color="#F6EBD7" />
            </TouchableOpacity>
          )}
        </View>
      </SafeHeader>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          {/* Avatar y Info Básica */}
          <View className="items-center mb-6">
            <TouchableOpacity
              onPress={() => setShowPhotoOptions(true)}
              activeOpacity={0.8}
              disabled={uploadingPhoto}
            >
              <View 
                className="w-28 h-28 rounded-3xl justify-center items-center mb-4 overflow-hidden"
                style={{ 
                  shadowColor: '#402612',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                {user.photo ? (
                  <>
                    <Image
                      source={{ uri: user.photo }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    {uploadingPhoto && (
                      <View className="absolute inset-0 bg-black/50 justify-center items-center">
                        <ActivityIndicator size="large" color="#FFFFFF" />
                      </View>
                    )}
                  </>
                ) : (
                  <LinearGradient
                    colors={['#402612', '#8B5A3C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full h-full justify-center items-center"
                  >
                    {uploadingPhoto ? (
                      <ActivityIndicator size="large" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="person" size={50} color="#FFFFFF" />
                    )}
                  </LinearGradient>
                )}
              </View>
              
              {/* Botón de cámara */}
              <View 
                className="absolute bottom-2 right-0 bg-[#402612] rounded-full p-2"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <Ionicons name="camera" size={16} color="#F6EBD7" />
              </View>
            </TouchableOpacity>
            
            <Text className="text-sm font-poppins-semibold text-[#8B5A3C]">
              @{user.nombreusuario}
            </Text>
            <View 
              className="px-4 py-1 rounded-full mt-2"
              style={{ backgroundColor: '#00D9FF25' }}
            >
              <Text className="text-xs font-poppins-black text-[#402612]">
                {user.rol?.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Formulario de Datos */}
          <View className="bg-white rounded-2xl p-5 mb-4" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <Text className="text-base font-poppins-bold text-[#402612] mb-4">
              Información Personal
            </Text>

            {/* Primer Nombre */}
            <View className="mb-4">
              <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-2">
                Primer Nombre *
              </Text>
              <TextInput
                value={formData.primernombre}
                onChangeText={(text) => setFormData(prev => ({ ...prev, primernombre: text }))}
                placeholder="Tu primer nombre"
                placeholderTextColor="#8B5A3C80"
                editable={editMode}
                className={`bg-[#F6EBD7] border rounded-xl px-4 py-3 font-poppins-regular text-[#402612] ${
                  editMode ? 'border-[#8B5A3C]' : 'border-transparent'
                }`}
              />
            </View>

            {/* Apellido Paterno */}
            <View className="mb-4">
              <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-2">
                Apellido Paterno *
              </Text>
              <TextInput
                value={formData.apellidopaterno}
                onChangeText={(text) => setFormData(prev => ({ ...prev, apellidopaterno: text }))}
                placeholder="Tu apellido paterno"
                placeholderTextColor="#8B5A3C80"
                editable={editMode}
                className={`bg-[#F6EBD7] border rounded-xl px-4 py-3 font-poppins-regular text-[#402612] ${
                  editMode ? 'border-[#8B5A3C]' : 'border-transparent'
                }`}
              />
            </View>

            {/* Apellido Materno */}
            <View className="mb-4">
              <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-2">
                Apellido Materno
              </Text>
              <TextInput
                value={formData.apellidomaterno}
                onChangeText={(text) => setFormData(prev => ({ ...prev, apellidomaterno: text }))}
                placeholder="Tu apellido materno (opcional)"
                placeholderTextColor="#8B5A3C80"
                editable={editMode}
                className={`bg-[#F6EBD7] border rounded-xl px-4 py-3 font-poppins-regular text-[#402612] ${
                  editMode ? 'border-[#8B5A3C]' : 'border-transparent'
                }`}
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-2">
                Email
              </Text>
              <TextInput
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="tu@email.com (opcional)"
                placeholderTextColor="#8B5A3C80"
                editable={editMode}
                keyboardType="email-address"
                autoCapitalize="none"
                className={`bg-[#F6EBD7] border rounded-xl px-4 py-3 font-poppins-regular text-[#402612] ${
                  editMode ? 'border-[#8B5A3C]' : 'border-transparent'
                }`}
              />
            </View>

            {/* Botones de acción */}
            {editMode && (
              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="flex-1 bg-gray-200 rounded-xl py-3"
                  disabled={isLoading}
                >
                  <Text className="text-center font-poppins-semibold text-gray-600">
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  className="flex-1 bg-[#402612] rounded-xl py-3 flex-row justify-center items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#F6EBD7" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#F6EBD7" />
                      <Text className="text-center font-poppins-semibold text-[#F6EBD7] ml-1">
                        Guardar
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Seguridad */}
          <View className="bg-white rounded-2xl p-5 mb-4" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <Text className="text-base font-poppins-bold text-[#402612] mb-4">
              Seguridad
            </Text>

            <TouchableOpacity
              onPress={() => setShowPasswordModal(true)}
              className="flex-row items-center justify-between bg-[#F6EBD7] rounded-xl px-4 py-4"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl justify-center items-center mr-3" style={{ backgroundColor: '#8B5A3C20' }}>
                  <Ionicons name="lock-closed" size={20} color="#8B5A3C" />
                </View>
                <View>
                  <Text className="font-poppins-semibold text-[#402612]">Cambiar Contraseña</Text>
                  <Text className="text-xs font-poppins-regular text-[#8B5A3C]">
                    Actualiza tu contraseña de acceso
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B5A3C" />
            </TouchableOpacity>
          </View>

          {/* Info de Cuenta */}
          <View className="bg-white rounded-2xl p-5 mb-6" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <Text className="text-base font-poppins-bold text-[#402612] mb-4">
              Información de Cuenta
            </Text>

            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="font-poppins-regular text-[#8B5A3C]">Usuario</Text>
              <Text className="font-poppins-semibold text-[#402612]">@{user.nombreusuario}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="font-poppins-regular text-[#8B5A3C]">Rol</Text>
              <Text className="font-poppins-semibold text-[#402612] capitalize">{user.rol}</Text>
            </View>

            <View className="flex-row justify-between items-center py-2">
              <Text className="font-poppins-regular text-[#8B5A3C]">ID de Usuario</Text>
              <Text className="font-poppins-semibold text-[#402612]">#{user.idusuario}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Opciones de Foto */}
      <Modal
        visible={showPhotoOptions}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPhotoOptions(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-[#F6EBD7] rounded-t-3xl pb-8">
            {/* Header del Modal */}
            <View className="items-center py-4 border-b border-gray-200">
              <View className="w-12 h-1 bg-gray-300 rounded-full mb-3" />
              <Text className="text-lg font-poppins-bold text-[#402612]">
                Cambiar Foto de Perfil
              </Text>
            </View>

            <View className="p-4 gap-3">
              {/* Tomar Foto */}
              <TouchableOpacity
                onPress={handleTakePhoto}
                className="flex-row items-center bg-white rounded-xl px-4 py-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View className="w-12 h-12 rounded-xl justify-center items-center mr-3" style={{ backgroundColor: '#3b82f620' }}>
                  <Ionicons name="camera" size={24} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="font-poppins-semibold text-[#402612]">Tomar Foto</Text>
                  <Text className="text-xs font-poppins-regular text-[#8B5A3C]">
                    Usar la cámara
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8B5A3C" />
              </TouchableOpacity>

              {/* Seleccionar de Galería */}
              <TouchableOpacity
                onPress={handlePickImage}
                className="flex-row items-center bg-white rounded-xl px-4 py-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View className="w-12 h-12 rounded-xl justify-center items-center mr-3" style={{ backgroundColor: '#00D98E20' }}>
                  <Ionicons name="images" size={24} color="#00D98E" />
                </View>
                <View className="flex-1">
                  <Text className="font-poppins-semibold text-[#402612]">Seleccionar de Galería</Text>
                  <Text className="text-xs font-poppins-regular text-[#8B5A3C]">
                    Elegir una foto existente
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8B5A3C" />
              </TouchableOpacity>

              {/* Eliminar Foto (solo si tiene foto) */}
              {user.photo && (
                <TouchableOpacity
                  onPress={() => {
                    setShowPhotoOptions(false);
                    Alert.alert(
                      'Eliminar Foto',
                      '¿Estás seguro de eliminar tu foto de perfil?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await updateUser({ photo: '' });
                              showSuccess('Éxito', 'Foto eliminada');
                            } catch (error) {
                              showError('Error', 'No se pudo eliminar la foto');
                            }
                          },
                        },
                      ]
                    );
                  }}
                  className="flex-row items-center bg-white rounded-xl px-4 py-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <View className="w-12 h-12 rounded-xl justify-center items-center mr-3" style={{ backgroundColor: '#DC262620' }}>
                    <Ionicons name="trash" size={24} color="#DC2626" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-red-600">Eliminar Foto</Text>
                    <Text className="text-xs font-poppins-regular text-[#8B5A3C]">
                      Remover foto actual
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#8B5A3C" />
                </TouchableOpacity>
              )}

              {/* Cancelar */}
              <TouchableOpacity
                onPress={() => setShowPhotoOptions(false)}
                className="bg-gray-200 rounded-xl py-3 mt-2"
              >
                <Text className="text-center font-poppins-semibold text-gray-600">
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Cambio de Contraseña */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-[#F6EBD7] rounded-t-3xl">
            {/* Header del Modal */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => {
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}>
                <Text className="font-poppins-regular text-[#8B5A3C]">Cancelar</Text>
              </TouchableOpacity>
              <Text className="text-lg font-poppins-bold text-[#402612]">Cambiar Contraseña</Text>
              <TouchableOpacity onPress={handleChangePassword} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#402612" />
                ) : (
                  <Text className="font-poppins-bold text-[#402612]">Guardar</Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="p-4">
              {/* Contraseña Actual */}
              <View className="mb-4">
                <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-2">
                  Contraseña Actual
                </Text>
                <View className="flex-row items-center bg-white border border-[#8B5A3C] rounded-xl px-4">
                  <TextInput
                    value={passwordData.currentPassword}
                    onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                    placeholder="Tu contraseña actual"
                    placeholderTextColor="#8B5A3C80"
                    secureTextEntry={!showPasswords.current}
                    className="flex-1 py-3 font-poppins-regular text-[#402612]"
                  />
                  <TouchableOpacity onPress={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}>
                    <Ionicons name={showPasswords.current ? 'eye-off' : 'eye'} size={20} color="#8B5A3C" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Nueva Contraseña */}
              <View className="mb-4">
                <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-2">
                  Nueva Contraseña
                </Text>
                <View className="flex-row items-center bg-white border border-[#8B5A3C] rounded-xl px-4">
                  <TextInput
                    value={passwordData.newPassword}
                    onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#8B5A3C80"
                    secureTextEntry={!showPasswords.new}
                    className="flex-1 py-3 font-poppins-regular text-[#402612]"
                  />
                  <TouchableOpacity onPress={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}>
                    <Ionicons name={showPasswords.new ? 'eye-off' : 'eye'} size={20} color="#8B5A3C" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirmar Contraseña */}
              <View className="mb-6">
                <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-2">
                  Confirmar Nueva Contraseña
                </Text>
                <View className="flex-row items-center bg-white border border-[#8B5A3C] rounded-xl px-4">
                  <TextInput
                    value={passwordData.confirmPassword}
                    onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                    placeholder="Repite la nueva contraseña"
                    placeholderTextColor="#8B5A3C80"
                    secureTextEntry={!showPasswords.confirm}
                    className="flex-1 py-3 font-poppins-regular text-[#402612]"
                  />
                  <TouchableOpacity onPress={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}>
                    <Ionicons name={showPasswords.confirm ? 'eye-off' : 'eye'} size={20} color="#8B5A3C" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Indicador de requisitos */}
              <View className="bg-[#402612]/10 rounded-xl p-3">
                <View className="flex-row items-center mb-1">
                  <Ionicons 
                    name={passwordData.newPassword.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'} 
                    size={16} 
                    color={passwordData.newPassword.length >= 6 ? '#00D98E' : '#8B5A3C'} 
                  />
                  <Text className="ml-2 text-xs font-poppins-regular text-[#402612]">
                    Mínimo 6 caracteres
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword !== '' ? 'checkmark-circle' : 'ellipse-outline'} 
                    size={16} 
                    color={passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword !== '' ? '#00D98E' : '#8B5A3C'} 
                  />
                  <Text className="ml-2 text-xs font-poppins-regular text-[#402612]">
                    Las contraseñas coinciden
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
