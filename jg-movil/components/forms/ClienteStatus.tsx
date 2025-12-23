import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

// Client Status Indicator for Ventas
interface ClienteStatusVentaProps {
  clienteId: number | null;
  clienteNombre: string;
  tipoVenta: 'contado' | 'credito';
}

export function ClienteStatusVenta({ clienteId, clienteNombre, tipoVenta }: ClienteStatusVentaProps) {
  if (clienteId) {
    return (
      <View className="mt-3 flex-row items-center">
        <Ionicons name="person-circle" size={16} color="#22c55e" />
        <Text className="text-green-600 font-poppins-regular text-sm ml-1">
          Cliente existente seleccionado
        </Text>
      </View>
    );
  }
  
  if (clienteNombre.trim()) {
    return (
      <View className="mt-3 flex-row items-center">
        <Ionicons name="person-add" size={16} color="#8B5A3C" />
        <Text className="text-[#8B5A3C] font-poppins-regular text-sm ml-1">
          Se creará nuevo cliente al finalizar
          {tipoVenta === 'credito' && (
            <Text className="text-red-600 font-poppins-semibold"> (NO válido para crédito)</Text>
          )}
        </Text>
      </View>
    );
  }
  
  return (
    <View className="mt-3 flex-row items-center">
      <Ionicons name="information-circle" size={16} color="#8B5A3C" />
      <Text className="text-[#8B5A3C] font-poppins-regular text-sm ml-1">
        Sin cliente = "Sin Nombre"
        {tipoVenta === 'credito' && (
          <Text className="text-red-600 font-poppins-semibold"> (NO válido para crédito)</Text>
        )}
      </Text>
    </View>
  );
}

// Client Status Indicator for Cobros
interface ClienteStatusCobroProps {
  clienteId: number | null;
  clienteNombre: string;
}

export function ClienteStatusCobro({ clienteId, clienteNombre }: ClienteStatusCobroProps) {
  if (clienteId) {
    return (
      <View className="mt-3 flex-row items-center">
        <Ionicons name="person-circle" size={16} color="#22c55e" />
        <Text className="text-green-600 font-poppins-regular text-sm ml-1">
          Cliente existente seleccionado
        </Text>
      </View>
    );
  }
  
  if (clienteNombre.trim()) {
    return (
      <View className="mt-3 flex-row items-center">
        <Ionicons name="person-add" size={16} color="#DC2626" />
        <Text className="text-red-600 font-poppins-regular text-sm ml-1">
          <Text className="font-poppins-semibold">No válido:</Text> Debes seleccionar un cliente existente
        </Text>
      </View>
    );
  }
  
  return null;
}

// Client Data Card Wrapper
interface ClienteDataCardProps {
  title?: string;
  children: React.ReactNode;
}

export function ClienteDataCard({ title = 'Datos del Cliente', children }: ClienteDataCardProps) {
  return (
    <View className="mb-4 bg-white rounded-xl p-4 border border-[#E5E5E5]">
      <Text className="text-base font-poppins-bold text-[#402612] mb-3">
        {title}
      </Text>
      {children}
    </View>
  );
}

// Alert Banner for Credit/Cobro requirements
interface ClienteAlertBannerProps {
  type: 'credito' | 'cobro';
  visible: boolean;
}

export function ClienteAlertBanner({ type, visible }: ClienteAlertBannerProps) {
  if (!visible) return null;
  
  const message = type === 'credito' 
    ? 'Las ventas a crédito requieren seleccionar un cliente existente de la lista.'
    : 'Los cobros requieren seleccionar un cliente existente de la lista.';
  
  return (
    <View className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3 flex-row items-start">
      <Ionicons name="alert-circle" size={20} color="#DC2626" />
      <Text className="flex-1 text-red-600 font-poppins-regular text-xs ml-2">
        <Text className="font-poppins-semibold">Atención:</Text> {message}
      </Text>
    </View>
  );
}
