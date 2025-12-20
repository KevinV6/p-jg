import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Modal de confirmación profesional
interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'info' | 'warning' | 'danger' | 'success';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'info',
}) => {
  const getConfig = () => {
    switch (type) {
      case 'danger':
        return { icon: 'alert-circle', color: '#C45C5C', bgColor: '#C45C5C15' };
      case 'warning':
        return { icon: 'warning', color: '#D4A054', bgColor: '#D4A05415' };
      case 'success':
        return { icon: 'checkmark-circle', color: '#5D8A66', bgColor: '#5D8A6615' };
      default:
        return { icon: 'information-circle', color: '#5C7CA5', bgColor: '#5C7CA515' };
    }
  };

  const config = getConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        className="flex-1 justify-center items-center px-5"
        style={{ backgroundColor: 'rgba(64, 38, 18, 0.6)' }}
      >
        <View
          className="bg-[#F6EBD7] rounded-3xl p-6 w-full max-w-[340px]"
          style={{
            shadowColor: '#402612',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 10,
          }}
        >
          {/* Icono */}
          <View className="items-center mb-5">
            <View
              className="w-16 h-16 rounded-2xl justify-center items-center"
              style={{ backgroundColor: config.bgColor }}
            >
              <Ionicons name={config.icon as any} size={36} color={config.color} />
            </View>
          </View>

          {/* Título y mensaje */}
          <Text className="text-lg font-poppins-bold text-[#402612] text-center mb-2">
            {title}
          </Text>
          <Text className="text-sm font-poppins-medium text-[#8B5A3C] text-center mb-6 leading-5">
            {message}
          </Text>

          {/* Botones */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-3.5 rounded-xl items-center bg-white border border-[#E8DFD4]"
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-poppins-bold text-[#8B5A3C]">
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-3.5 rounded-xl items-center"
              style={{ backgroundColor: config.color }}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text className="text-sm font-poppins-bold text-white">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Modal de alerta simple
interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  buttonText = 'Entendido',
  onClose,
  type = 'info',
}) => {
  const getConfig = () => {
    switch (type) {
      case 'error':
        return { icon: 'close-circle', color: '#C45C5C', bgColor: '#C45C5C15' };
      case 'warning':
        return { icon: 'warning', color: '#D4A054', bgColor: '#D4A05415' };
      case 'success':
        return { icon: 'checkmark-circle', color: '#5D8A66', bgColor: '#5D8A6615' };
      default:
        return { icon: 'information-circle', color: '#5C7CA5', bgColor: '#5C7CA515' };
    }
  };

  const config = getConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center px-5"
        style={{ backgroundColor: 'rgba(64, 38, 18, 0.6)' }}
      >
        <View
          className="bg-[#F6EBD7] rounded-3xl p-6 w-full max-w-[340px]"
          style={{
            shadowColor: '#402612',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 10,
          }}
        >
          {/* Icono */}
          <View className="items-center mb-5">
            <View
              className="w-16 h-16 rounded-2xl justify-center items-center"
              style={{ backgroundColor: config.bgColor }}
            >
              <Ionicons name={config.icon as any} size={36} color={config.color} />
            </View>
          </View>

          {/* Título y mensaje */}
          <Text className="text-lg font-poppins-bold text-[#402612] text-center mb-2">
            {title}
          </Text>
          <Text className="text-sm font-poppins-medium text-[#8B5A3C] text-center mb-6 leading-5">
            {message}
          </Text>

          {/* Botón */}
          <TouchableOpacity
            className="w-full py-3.5 rounded-xl items-center bg-[#402612]"
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text className="text-sm font-poppins-bold text-[#F6EBD7]">
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Modal de carga
interface LoadingModalProps {
  visible: boolean;
  message?: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  visible,
  message = 'Cargando...',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        className="flex-1 justify-center items-center px-5"
        style={{ backgroundColor: 'rgba(64, 38, 18, 0.6)' }}
      >
        <View
          className="bg-[#F6EBD7] rounded-2xl p-6 items-center min-w-[180px]"
          style={{
            shadowColor: '#402612',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 10,
          }}
        >
          <ActivityIndicator size="large" color="#402612" />
          <Text className="mt-4 text-sm font-poppins-medium text-[#8B5A3C]">
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};
