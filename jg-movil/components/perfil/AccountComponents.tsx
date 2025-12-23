import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Types
interface Usuario {
  idusuario?: number;
  nombreusuario?: string;
  primernombre?: string;
  apellidopaterno?: string;
  apellidomaterno?: string;
  email?: string;
  rol?: string;
  photo?: string;
}

// Security Card
interface SecurityCardProps {
  onChangePassword: () => void;
}

export function SecurityCard({ onChangePassword }: SecurityCardProps) {
  return (
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
        onPress={onChangePassword}
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
  );
}

// Account Info Row
interface AccountInfoRowProps {
  label: string;
  value: string;
  capitalize?: boolean;
  noBorder?: boolean;
}

function AccountInfoRow({ label, value, capitalize, noBorder }: AccountInfoRowProps) {
  return (
    <View className={`flex-row justify-between items-center py-2 ${!noBorder ? 'border-b border-gray-100' : ''}`}>
      <Text className="font-poppins-regular text-[#8B5A3C]">{label}</Text>
      <Text className={`font-poppins-semibold text-[#402612] ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </Text>
    </View>
  );
}

// Account Info Card
interface AccountInfoCardProps {
  user: Usuario;
}

export function AccountInfoCard({ user }: AccountInfoCardProps) {
  return (
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

      <AccountInfoRow label="Usuario" value={`@${user.nombreusuario}`} />
      <AccountInfoRow label="Rol" value={user.rol || ''} capitalize />
      <AccountInfoRow label="ID de Usuario" value={`#${user.idusuario}`} noBorder />
    </View>
  );
}
