import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface Cliente {
  idcliente: number;
  nombrecliente: string;
  ci_nit?: string;
  telefono?: string;
  direccion?: string;
  estado: number;
}

interface ClienteCardProps {
  cliente: Cliente;
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
  onViewHistory?: (cliente: Cliente) => void;
}

export function ClienteCard({ cliente, onEdit, onDelete, onViewHistory }: ClienteCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onEdit(cliente)}
      className="bg-white rounded-xl p-4 mb-3 border border-[#E5E5E5]"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-[#402612]/10 items-center justify-center mr-3">
          <Ionicons name="person" size={24} color="#402612" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-poppins-bold text-[#402612]">
            {cliente.nombrecliente}
          </Text>
          {cliente.ci_nit && cliente.ci_nit !== 'S/N' && (
            <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
              CI/NIT: {cliente.ci_nit}
            </Text>
          )}
          {cliente.telefono && (
            <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
              Tel: {cliente.telefono}
            </Text>
          )}
        </View>
        <View className="flex-row items-center">
          {onViewHistory && (
            <TouchableOpacity
              onPress={() => onViewHistory(cliente)}
              className="p-2 mr-1"
            >
              <Ionicons name="receipt-outline" size={20} color="#402612" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onEdit(cliente)}
            className="p-2 mr-1"
          >
            <Ionicons name="create-outline" size={20} color="#8B5A3C" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(cliente)}
            className="p-2"
          >
            <Ionicons name="trash-outline" size={20} color="#FF5555" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
