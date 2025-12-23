import { 
  ProfileAvatar, 
  ProfileFormInput, 
  PhotoOptionsModal,
  PasswordInput,
  PasswordRequirements,
  SecurityCard,
  AccountInfoCard 
} from '@/components/perfil';
import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 180}
        extraHeight={Platform.OS === 'ios' ? 100 : 180}
        enableResetScrollToCoords={false}
        keyboardOpeningTime={0}
      >
          {/* Avatar y Info Básica */}
          <View className="items-center mb-6">
            <ProfileAvatar
              user={user}
              onPress={() => setShowPhotoOptions(true)}
              uploading={uploadingPhoto}
            />
            
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

            <ProfileFormInput
              label="Primer Nombre"
              value={formData.primernombre}
              onChangeText={(text) => setFormData(prev => ({ ...prev, primernombre: text }))}
              placeholder="Tu primer nombre"
              editable={editMode}
              required
            />

            <ProfileFormInput
              label="Apellido Paterno"
              value={formData.apellidopaterno}
              onChangeText={(text) => setFormData(prev => ({ ...prev, apellidopaterno: text }))}
              placeholder="Tu apellido paterno"
              editable={editMode}
              required
            />

            <ProfileFormInput
              label="Apellido Materno"
              value={formData.apellidomaterno}
              onChangeText={(text) => setFormData(prev => ({ ...prev, apellidomaterno: text }))}
              placeholder="Tu apellido materno (opcional)"
              editable={editMode}
            />

            <ProfileFormInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="tu@email.com (opcional)"
              editable={editMode}
              keyboardType="email-address"
              autoCapitalize="none"
            />


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
          <SecurityCard onChangePassword={() => setShowPasswordModal(true)} />

          {/* Info de Cuenta */}
          <AccountInfoCard user={user} />
      </KeyboardAwareScrollView>

      {/* Modal de Opciones de Foto */}
      <PhotoOptionsModal
        visible={showPhotoOptions}
        onClose={() => setShowPhotoOptions(false)}
        onTakePhoto={handleTakePhoto}
        onPickImage={handlePickImage}
        onDeletePhoto={() => {
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
        hasPhoto={!!user.photo}
      />


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
              <PasswordInput
                label="Contraseña Actual"
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                placeholder="Tu contraseña actual"
                showPassword={showPasswords.current}
                onTogglePassword={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
              />

              <PasswordInput
                label="Nueva Contraseña"
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                placeholder="Mínimo 6 caracteres"
                showPassword={showPasswords.new}
                onTogglePassword={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              />

              <View className="mb-6">
                <PasswordInput
                  label="Confirmar Nueva Contraseña"
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                  placeholder="Repite la nueva contraseña"
                  showPassword={showPasswords.confirm}
                  onTogglePassword={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                />
              </View>

              <PasswordRequirements
                newPassword={passwordData.newPassword}
                confirmPassword={passwordData.confirmPassword}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
