import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  showCancel?: boolean;
  onCancel?: () => void;
  cancelText?: string;
}

const alertConfig = {
  success: {
    color: '#22c55e',
    bgColor: '#22c55e15',
    icon: 'checkmark-circle' as const,
  },
  error: {
    color: '#FF5555',
    bgColor: '#FF555515',
    icon: 'close-circle' as const,
  },
  warning: {
    color: '#FFB800',
    bgColor: '#FFB80015',
    icon: 'warning' as const,
  },
  info: {
    color: '#3B82F6',
    bgColor: '#3B82F615',
    icon: 'information-circle' as const,
  },
};

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type = 'info',
  title,
  message,
  onClose,
  confirmText = 'Aceptar',
  showCancel = false,
  onCancel,
  cancelText = 'Cancelar',
}) => {
  const config = alertConfig[type];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm overflow-hidden">
          {/* Header con icono */}
          <View 
            className="px-4 py-5 items-center"
            style={{ backgroundColor: config.color }}
          >
            <View 
              className="rounded-full p-3 mb-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Ionicons name={config.icon} size={36} color="#FFFFFF" />
            </View>
            <Text className="text-lg font-poppins-bold text-white text-center">
              {title}
            </Text>
          </View>

          {/* Contenido */}
          <View className="p-5">
            <Text className="text-base font-poppins-regular text-[#402612] text-center leading-6">
              {message}
            </Text>
          </View>

          {/* Botones */}
          <View className={`px-4 pb-4 ${showCancel ? 'flex-row gap-3' : ''}`}>
            {showCancel && (
              <TouchableOpacity
                onPress={onCancel || onClose}
                className="flex-1 bg-[#8B5A3C] rounded-xl py-3"
              >
                <Text className="text-center text-white font-poppins-semibold">
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={onClose}
              className={`rounded-xl py-3 ${showCancel ? 'flex-1' : ''}`}
              style={{ backgroundColor: config.color }}
            >
              <Text className="text-center text-white font-poppins-bold">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Hook para usar el alert personalizado
export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<{
    visible: boolean;
    type: AlertType;
    title: string;
    message: string;
    onClose?: () => void;
    confirmText?: string;
    showCancel?: boolean;
    onCancel?: () => void;
    cancelText?: string;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (
    type: AlertType,
    title: string,
    message: string,
    options?: {
      onClose?: () => void;
      confirmText?: string;
      showCancel?: boolean;
      onCancel?: () => void;
      cancelText?: string;
    }
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      ...options,
    });
  };

  const hideAlert = () => {
    if (alertConfig.onClose) {
      alertConfig.onClose();
    }
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const AlertComponent = () => (
    <CustomAlert
      visible={alertConfig.visible}
      type={alertConfig.type}
      title={alertConfig.title}
      message={alertConfig.message}
      onClose={hideAlert}
      confirmText={alertConfig.confirmText}
      showCancel={alertConfig.showCancel}
      onCancel={alertConfig.onCancel}
      cancelText={alertConfig.cancelText}
    />
  );

  return {
    showAlert,
    hideAlert,
    AlertComponent,
    // Métodos de conveniencia
    showSuccess: (title: string, message: string, onClose?: () => void) =>
      showAlert('success', title, message, { onClose }),
    showError: (title: string, message: string, onClose?: () => void) =>
      showAlert('error', title, message, { onClose }),
    showWarning: (title: string, message: string, onClose?: () => void) =>
      showAlert('warning', title, message, { onClose }),
    showInfo: (title: string, message: string, onClose?: () => void) =>
      showAlert('info', title, message, { onClose }),
  };
};
