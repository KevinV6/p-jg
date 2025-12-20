import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ComprobanteItem {
  producto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  imagen?: string;
  unidad?: string;
}

interface ComprobanteProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: () => void;
  tipo: 'venta' | 'cobro';
  titulo: string;
  cliente: string;
  total: number;
  items: ComprobanteItem[];
  fecha?: Date;
  folio?: string;
  telefono?: string;
}

export default function ComprobanteModal({
  visible,
  onClose,
  onNavigate,
  tipo,
  titulo,
  cliente,
  total,
  items,
  fecha = new Date(),
  folio,
  telefono,
}: ComprobanteProps) {
  const formatFecha = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-[#F6EBD7]">
        {/* Header */}
        <View className="bg-[#402612] px-4 py-12 items-center">
          <View className="bg-white rounded-full p-4 mb-4">
            <Ionicons name="checkmark-circle" size={48} color="#00D98E" />
          </View>
          <Text className="text-2xl font-poppins-black text-[#F6EBD7] text-center mb-2">
            {tipo === 'venta' ? '¡Venta Realizada!' : '¡Cobro Registrado!'}
          </Text>
          <Text className="text-base font-poppins-regular text-[#F6EBD7]/80 text-center">
            {titulo}
          </Text>
        </View>

        {/* Comprobante */}
        <ScrollView className="flex-1 px-4 py-6">
          <View className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            {/* Encabezado del comprobante */}
            <View className="items-center mb-6 pb-4 border-b border-gray-200">
              <Text className="text-xl font-poppins-bold text-[#402612] mb-2">
                COMPROBANTE DE {tipo === 'venta' ? 'VENTA' : 'COBRO'}
              </Text>
              {folio && (
                <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
                  Folio: {folio}
                </Text>
              )}
              <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
                {formatFecha(fecha)}
              </Text>
            </View>

            {/* Información del cliente */}
            <View className="mb-6 pb-4 border-b border-gray-200">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-poppins-semibold text-[#8B5A3C]">Cliente:</Text>
                <Text className="font-poppins-regular text-[#402612]">{cliente}</Text>
              </View>
              {telefono && (
                <View className="flex-row justify-between items-center">
                  <Text className="font-poppins-semibold text-[#8B5A3C]">Teléfono:</Text>
                  <Text className="font-poppins-regular text-[#402612]">{telefono}</Text>
                </View>
              )}
            </View>

            {/* Items */}
            <View className="mb-6">
              <Text className="font-poppins-bold text-[#402612] mb-4">
                {tipo === 'venta' ? 'Productos Vendidos:' : 'Productos del Cobro:'}
              </Text>
              
              {items.map((item, index) => (
                <View key={index} className="flex-row items-center mb-3 p-3 bg-[#F6EBD7] rounded-xl">
                  {item.imagen && (
                    <Image
                      source={{ uri: item.imagen }}
                      className="w-12 h-12 rounded-lg mr-3"
                    />
                  )}
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-[#402612] text-sm">
                      {item.producto}
                    </Text>
                    <Text className="font-poppins-regular text-[#8B5A3C] text-xs">
                      {item.cantidad} {item.unidad || 'und'} x Bs. {item.precio.toFixed(2)}
                    </Text>
                  </View>
                  <Text className="font-poppins-bold text-[#402612]">
                    Bs. {item.subtotal.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Total */}
            <View className="pt-4 border-t-2 border-[#402612]">
              <View className="flex-row justify-between items-center">
                <Text className="text-xl font-poppins-black text-[#402612]">
                  TOTAL:
                </Text>
                <Text className="text-2xl font-poppins-black text-[#402612]">
                  Bs. {total.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Mensaje de agradecimiento */}
          <View className="bg-[#402612] rounded-2xl p-4 mb-6">
            <Text className="text-center text-[#F6EBD7] font-poppins-semibold">
              ¡Gracias por su {tipo === 'venta' ? 'compra' : 'confianza'}!
            </Text>
            <Text className="text-center text-[#F6EBD7]/80 font-poppins-regular text-sm mt-1">
              {tipo === 'venta' 
                ? 'Su pedido ha sido procesado exitosamente'
                : 'Su cobro ha sido registrado correctamente'
              }
            </Text>
          </View>
        </ScrollView>

        {/* Botones */}
        <View className="px-4 pb-8 pt-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            onPress={onNavigate}
            className="bg-[#402612] rounded-xl py-4 flex-row items-center justify-center mb-3"
          >
            <Ionicons name="arrow-forward-outline" size={24} color="#F6EBD7" />
            <Text className="text-[#F6EBD7] font-poppins-bold text-lg ml-2">
              Ir a {tipo === 'venta' ? 'Ventas' : 'Cobros'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="bg-[#8B5A3C] rounded-xl py-3 items-center"
          >
            <Text className="text-white font-poppins-semibold">
              Cerrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}