import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Cliente } from './ClienteCard';

export interface ClienteFormData {
  nombrecliente: string;
  ci_nit: string;
  telefono: string;
  direccion: string;
}

interface ClienteFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  editingCliente: Cliente | null;
  formData: ClienteFormData;
  setFormData: React.Dispatch<React.SetStateAction<ClienteFormData>>;
  saving: boolean;
}

export function ClienteFormModal({
  visible,
  onClose,
  onSave,
  editingCliente,
  formData,
  setFormData,
  saving,
}: ClienteFormModalProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 24);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => !saving && onClose()}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <View className="flex-1 bg-black/50 justify-center px-4">
          <View 
            className="bg-[#F6EBD7] rounded-2xl max-h-[85%]"
            style={{ marginBottom: bottomPadding }}
          >
            {/* Header del modal */}
            <View className="bg-[#402612] rounded-t-2xl px-4 py-4 flex-row items-center justify-between">
              <Text className="text-lg font-poppins-bold text-[#F6EBD7]">
                {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </Text>
              <TouchableOpacity onPress={() => !saving && onClose()}>
                <Ionicons name="close" size={24} color="#F6EBD7" />
              </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView
              className="p-4"
              keyboardShouldPersistTaps="handled"
              enableOnAndroid={true}
              enableAutomaticScroll={true}
              extraScrollHeight={Platform.OS === 'android' ? 120 : 80}
              extraHeight={Platform.OS === 'android' ? 120 : 80}
              enableResetScrollToCoords={false}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
            {/* Nombre */}
            <View className="mb-4">
              <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
                Nombre *
              </Text>
              <TextInput
                className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                placeholder="Nombre del cliente"
                placeholderTextColor="#8B5A3C80"
                value={formData.nombrecliente}
                onChangeText={(text) => setFormData({ ...formData, nombrecliente: text })}
              />
            </View>

            {/* CI/NIT */}
            <View className="mb-4">
              <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
                CI/NIT <Text className="text-xs font-poppins-regular">(opcional, mín. 8 dígitos)</Text>
              </Text>
              <TextInput
                className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                placeholder="Ej: 12345678 (mínimo 8)"
                placeholderTextColor="#8B5A3C80"
                value={formData.ci_nit}
                onChangeText={(text) => setFormData({ ...formData, ci_nit: text })}
                maxLength={20}
              />
            </View>

            {/* Teléfono */}
            <View className="mb-4">
              <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
                Teléfono <Text className="text-xs font-poppins-regular">(opcional, mín. 8 dígitos)</Text>
              </Text>
              <TextInput
                className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                placeholder="Ej: 77712345 (mínimo 8)"
                placeholderTextColor="#8B5A3C80"
                value={formData.telefono}
                onChangeText={(text) => setFormData({ ...formData, telefono: text })}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            {/* Dirección */}
            <View className="mb-4">
              <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
                Dirección
              </Text>
              <TextInput
                className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                placeholder="Dirección del cliente"
                placeholderTextColor="#8B5A3C80"
                value={formData.direccion}
                onChangeText={(text) => setFormData({ ...formData, direccion: text })}
              />
            </View>

            {/* Botón guardar */}
            <TouchableOpacity
              onPress={onSave}
              disabled={saving}
              className={`rounded-xl py-4 flex-row items-center justify-center mb-4 ${saving ? 'bg-[#8B5A3C]/50' : 'bg-[#402612]'
                }`}
            >
              {saving ? (
                <ActivityIndicator color="#F6EBD7" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={22} color="#F6EBD7" />
                  <Text className="text-[#F6EBD7] font-poppins-bold text-lg ml-2">
                    {editingCliente ? 'Actualizar' : 'Guardar'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
    </Modal>
  );
}

