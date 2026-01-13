import { Cobro } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CobroDetalleModalProps {
  visible: boolean;
  cobro: Cobro | null;
  onClose: () => void;
  onMarcarPagado?: (id: number) => void;
  onVerComprobante?: (cobro: Cobro) => void;
}

export const CobroDetalleModal: React.FC<CobroDetalleModalProps> = ({
  visible,
  cobro,
  onClose,
  onMarcarPagado,
  onVerComprobante,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);
  
  if (!cobro) return null;

  const getEstadoConfig = (estado: number) => {
    switch (estado) {
      case 1:
        return { color: '#8B5A3C', text: 'Pendiente', bgColor: '#8B5A3C15', icon: 'time-outline' as const };
      case 2:
        return { color: '#5D8A66', text: 'Pagado', bgColor: '#5D8A6615', icon: 'checkmark-circle-outline' as const };
      case 0:
        return { color: '#C45C5C', text: 'Anulado', bgColor: '#C45C5C15', icon: 'close-circle-outline' as const };
      default:
        return { color: '#8B5A3C', text: 'Desconocido', bgColor: '#8B5A3C15', icon: 'help-outline' as const };
    }
  };

  const estadoConfig = getEstadoConfig(cobro.estado);
  const saldo = cobro.saldo ?? (cobro.total - cobro.monto_pagado);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(64, 38, 18, 0.6)' }}>
        <View
          className="bg-[#F6EBD7] rounded-t-3xl max-h-[85%]"
          style={{
            paddingBottom: bottomPadding,
            shadowColor: '#402612',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-[#E8DFD4]">
            <Text className="text-lg font-poppins-bold text-[#402612]">
              Detalle del Cobro
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 rounded-full justify-center items-center bg-white"
              style={{
                shadowColor: '#402612',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="close" size={20} color="#402612" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
            {/* Info principal */}
            <View className="bg-white rounded-2xl p-4 mb-4 border border-[#E8DFD4]">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-poppins-medium text-[#8B5A3C] mb-1">
                    Cliente
                  </Text>
                  <Text className="text-lg font-poppins-bold text-[#402612]">
                    {cobro.cliente?.nombrecliente || 'Cliente'}
                  </Text>
                  {cobro.cliente?.telefono && (
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="call-outline" size={14} color="#8B5A3C" />
                      <Text className="text-sm font-poppins-medium text-[#8B5A3C] ml-1">
                        {cobro.cliente.telefono}
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: estadoConfig.bgColor }}
                >
                  <Text
                    className="text-xs font-poppins-bold"
                    style={{ color: estadoConfig.color }}
                  >
                    {estadoConfig.text}
                  </Text>
                </View>
              </View>

              <View className="flex-row">
                <View className="flex-1 mr-4">
                  <Text className="text-xs font-poppins-medium text-[#8B5A3C] mb-1">
                    Origen
                  </Text>
                  <Text className="text-base font-poppins-semibold text-[#402612]">
                    {cobro.origen === 'venta' ? 'Venta a crédito' : 'Cobro manual'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-poppins-medium text-[#8B5A3C] mb-1">
                    Fecha
                  </Text>
                  <Text className="text-base font-poppins-semibold text-[#402612]">
                    {format(new Date(cobro.fecha), 'dd/MM/yyyy')}
                  </Text>
                </View>
              </View>

              {cobro.fecha_vencimiento && (
                <View className="mt-4 pt-4 border-t border-[#E8DFD4]">
                  <Text className="text-xs font-poppins-medium text-[#8B5A3C] mb-1">
                    Fecha de vencimiento
                  </Text>
                  <Text className="text-base font-poppins-semibold text-[#402612]">
                    {format(new Date(cobro.fecha_vencimiento), 'dd/MM/yyyy')}
                  </Text>
                </View>
              )}

              {cobro.estado === 2 && cobro.fechapago && (
                <View className="mt-4 pt-4 border-t border-[#E8DFD4]">
                  <Text className="text-xs font-poppins-medium text-[#5D8A66] mb-1">
                    Fecha de pago
                  </Text>
                  <Text className="text-base font-poppins-semibold text-[#5D8A66]">
                    {format(new Date(cobro.fechapago), 'dd/MM/yyyy')}
                  </Text>
                </View>
              )}

              {cobro.notas && (
                <View className="mt-4 pt-4 border-t border-[#E8DFD4]">
                  <Text className="text-xs font-poppins-medium text-[#8B5A3C] mb-1">
                    Notas
                  </Text>
                  <Text className="text-base font-poppins-regular text-[#402612] italic">
                    "{cobro.notas}"
                  </Text>
                </View>
              )}
            </View>

            {/* Resumen de pagos */}
            <Text className="text-sm font-poppins-bold text-[#402612] mb-3">
              Resumen de Pagos
            </Text>
            <View className="bg-white rounded-2xl border border-[#E8DFD4] overflow-hidden mb-4 p-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm font-poppins-medium text-[#8B5A3C]">
                  Total del cobro
                </Text>
                <Text className="text-base font-poppins-bold text-[#402612]">
                  Bs {cobro.total.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm font-poppins-medium text-[#8B5A3C]">
                  Monto pagado
                </Text>
                <Text className="text-base font-poppins-bold text-[#5D8A66]">
                  Bs {cobro.monto_pagado.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center pt-3 border-t border-[#E8DFD4]">
                <Text className="text-sm font-poppins-bold text-[#402612]">
                  Saldo pendiente
                </Text>
                <Text className="text-lg font-poppins-black" style={{ color: saldo > 0 ? '#C45C5C' : '#5D8A66' }}>
                  Bs {saldo.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Historial de pagos */}
            {cobro.historial_pagos && cobro.historial_pagos.length > 0 && (
              <>
                <Text className="text-sm font-poppins-bold text-[#402612] mb-3">
                  Historial de Pagos
                </Text>
                <View className="bg-white rounded-2xl border border-[#E8DFD4] overflow-hidden mb-4">
                  {cobro.historial_pagos.map((pago, index) => (
                    <View
                      key={pago.idhistorial || index}
                      className={`flex-row items-center justify-between p-4 ${
                        index !== cobro.historial_pagos!.length - 1 ? 'border-b border-[#E8DFD4]' : ''
                      }`}
                    >
                      <View>
                        <Text className="text-sm font-poppins-semibold text-[#402612]">
                          Bs {pago.monto.toFixed(2)}
                        </Text>
                        <Text className="text-xs font-poppins-medium text-[#8B5A3C]">
                          {pago.metodo_pago}
                        </Text>
                      </View>
                      <Text className="text-xs font-poppins-medium text-[#8B5A3C]">
                        {format(new Date(pago.fecha), 'dd/MM/yyyy HH:mm')}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Total */}
            <View
              className="flex-row justify-between items-center p-4 rounded-2xl bg-[#402612]"
            >
              <Text className="text-base font-poppins-bold text-[#F6EBD7]">
                Saldo pendiente
              </Text>
              <Text className="text-xl font-poppins-black text-[#F6EBD7]">
                Bs {saldo.toFixed(2)}
              </Text>
            </View>

            {/* Botones de acción */}
            <View className="mt-4 gap-3">
              {/* Botón Ver Comprobante */}
              {onVerComprobante && cobro.venta && (
                <TouchableOpacity
                  onPress={() => onVerComprobante(cobro)}
                  className="flex-row items-center justify-center bg-white border-2 border-[#402612] rounded-xl py-3.5"
                >
                  <Ionicons name="receipt-outline" size={20} color="#402612" />
                  <Text className="text-base font-poppins-bold text-[#402612] ml-2">
                    Ver Venta Asociada
                  </Text>
                </TouchableOpacity>
              )}

              {/* Botón Marcar como Pagado */}
              {cobro.estado === 1 && onMarcarPagado && (
                <TouchableOpacity
                  onPress={() => onMarcarPagado(cobro.idcobro)}
                  className="flex-row items-center justify-center bg-[#5D8A66] rounded-xl py-3.5"
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  <Text className="text-base font-poppins-bold text-white ml-2">
                    Marcar como Pagado
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
