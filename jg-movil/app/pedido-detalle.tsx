import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import { usePedidos } from '@/contexts/PedidosContext';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import type { Pedido } from '@/types';

export default function PedidoDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getPedidoById, confirmarPedido, cancelarPedido, convertirAVenta, isLoading } = usePedidos();
  const { showError, showSuccess, AlertComponent } = useCustomAlert();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPedido = async () => {
      setLoading(true);
      const data = await getPedidoById(Number(id));
      setPedido(data);
      setLoading(false);
    };
    if (id) {
      loadPedido();
    }
  }, [id]);

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#402612" />
        </View>
      </ScreenContainer>
    );
  }

  if (!pedido) {
    return (
      <ScreenContainer>
        <Text className="text-lg text-center mt-16 text-[#8B5A3C]">Pedido no encontrado</Text>
      </ScreenContainer>
    );
  }

  const handleConfirmar = () => {
    setShowConfirmModal(true);
  };

  const confirmarAccion = async () => {
    // Convertir pedido a venta usando el nuevo servicio
    const result = await convertirAVenta(pedido.idpedido, 'contado', pedido.clienteid);
    
    if (result) {
      setShowConfirmModal(false);
      showSuccess('Éxito', 'Pedido convertido a venta', () => router.back());
    } else {
      showError('Error', 'No se pudo convertir el pedido a venta');
      setShowConfirmModal(false);
    }
  };

  const handleCancelar = () => {
    setShowCancelModal(true);
  };

  const cancelarAccion = async () => {
    const result = await cancelarPedido(pedido.idpedido);
    setShowCancelModal(false);
    if (result) {
      router.back();
    } else {
      showError('Error', 'No se pudo cancelar el pedido');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return '#FFC107';
      case 'confirmado':
      case 'preparando':
      case 'listo':
        return '#28A745';
      case 'entregado':
        return '#17A2B8';
      case 'cancelado':
        return '#DC3545';
      default:
        return '#6B7280';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmado':
        return 'Confirmado';
      case 'preparando':
        return 'Preparando';
      case 'listo':
        return 'Listo';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const total = pedido.total || 0;

  return (
    <ScreenContainer safeTop={false} statusBarStyle="light" statusBarColor="#402612">
      {/* Header */}
      <SafeHeader>
        <View className="bg-[#402612] px-4 py-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#F6EBD7" />
          </TouchableOpacity>
          <Text className="text-xl font-poppins-semibold text-[#F6EBD7]">
            Detalle del Pedido
          </Text>
        </View>
      </SafeHeader>

      <ScrollView className="flex-1">
        <View className="p-6 mb-4 bg-white mx-4 mt-4 rounded-xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-poppins-black text-[#402612]">Pedido #{pedido.idpedido}</Text>
            <View className="px-4 py-1 rounded-full" style={{ backgroundColor: getEstadoColor(pedido.estado_pedido) + '20' }}>
              <Text className="text-sm font-poppins-semibold" style={{ color: getEstadoColor(pedido.estado_pedido) }}>
                {getEstadoTexto(pedido.estado_pedido)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2 mt-2">
            <Ionicons name="person" size={20} color="#8B5A3C" />
            <Text className="text-base font-poppins-regular text-[#8B5A3C]">{pedido.cliente?.nombrecliente || 'Cliente'}</Text>
          </View>

          <View className="flex-row items-center gap-2 mt-2">
            <Ionicons name="calendar" size={20} color="#8B5A3C" />
            <Text className="text-base font-poppins-regular text-[#8B5A3C]">
              {format(new Date(pedido.fecha), "dd/MM/yyyy 'a las' HH:mm")}
            </Text>
          </View>

          {pedido.notas && (
            <View className="flex-row gap-2 mt-4 p-4 rounded-xl border border-[#8B5A3C] bg-[#F6EBD7]">
              <Ionicons name="information-circle" size={20} color="#402612" />
              <Text className="flex-1 text-base italic font-poppins-regular text-[#402612]">{pedido.notas}</Text>
            </View>
          )}
        </View>

        <View className="p-6 mb-4 bg-white mx-4 rounded-xl">
          <Text className="text-lg font-poppins-black mb-4 text-[#402612]">Productos</Text>

          {/* Header de tabla */}
          <View className="flex-row py-2 bg-[#F6EBD7] rounded-lg px-2 mb-2">
            <Text className="flex-[2] text-xs font-poppins-semibold text-[#8B5A3C]">Producto</Text>
            <Text className="flex-1 text-xs font-poppins-semibold text-[#8B5A3C] text-center">Und.</Text>
            <Text className="flex-1 text-xs font-poppins-semibold text-[#8B5A3C] text-center">Cant.</Text>
            <Text className="flex-1 text-xs font-poppins-semibold text-[#8B5A3C] text-right">Precio</Text>
            <Text className="flex-1 text-xs font-poppins-semibold text-[#8B5A3C] text-right">Total</Text>
          </View>

          {pedido.detalles && pedido.detalles.length > 0 ? (
            pedido.detalles.map((detalle, index) => {
              const nombreProducto = detalle.producto?.nombreproducto || 'Producto';
              const nombreVariante = detalle.opcionvariante?.nombreopcionvariante;
              const nombreCompleto = nombreVariante 
                ? `${nombreProducto} - ${nombreVariante}` 
                : nombreProducto;
              const unidad = detalle.productounidad?.unidad?.abreviatura || detalle.unidadmedida || 'und';
              const precio = detalle.precio || 0;
              const subtotal = detalle.cantidad * precio;

              return (
                <View key={index} className="flex-row py-3 px-2 border-b border-gray-100 items-center">
                  <View className="flex-[2]">
                    <Text className="text-xs font-poppins-regular text-[#402612]" numberOfLines={2}>
                      {nombreCompleto}
                    </Text>
                  </View>
                  <Text className="flex-1 text-xs font-poppins-regular text-[#402612] text-center">
                    {unidad}
                  </Text>
                  <Text className="flex-1 text-xs font-poppins-regular text-[#402612] text-center">
                    {detalle.cantidad}
                  </Text>
                  <Text className="flex-1 text-xs font-poppins-regular text-[#402612] text-right">
                    {precio.toFixed(2)}
                  </Text>
                  <Text className="flex-1 text-xs font-poppins-semibold text-[#402612] text-right">
                    {subtotal.toFixed(2)}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text className="text-base text-center p-6 font-poppins-regular text-[#8B5A3C]">No hay productos en este pedido</Text>
          )}
        </View>

        <View className="rounded-xl p-6 m-4 items-center border-2 bg-white border-[#402612]">
          <Text className="text-base font-poppins-black mb-1 text-[#402612]">TOTAL ESTIMADO</Text>
          <Text className="text-4xl font-poppins-black text-[#402612]">Bs. {total.toFixed(2)}</Text>
        </View>

        {pedido.estado_pedido === 'pendiente' && (
          <View className="p-4 gap-4">
            <TouchableOpacity 
              className="flex-row items-center justify-center gap-2 bg-[#402612] p-4 rounded-xl" 
              onPress={handleConfirmar} 
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={24} color="#F6EBD7" />
              <Text className="text-lg font-poppins-black text-[#F6EBD7]">Confirmar Pedido</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center justify-center gap-2 p-4 rounded-xl border-2 bg-white border-[#D32F2F]" 
              onPress={handleCancelar} 
              activeOpacity={0.85}
            >
              <Ionicons name="close-circle" size={24} color="#D32F2F" />
              <Text className="text-lg font-poppins-black text-[#D32F2F]">Cancelar Pedido</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal Confirmar */}
      <Modal
        visible={showConfirmModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm">
            <View className="bg-[#402612] rounded-t-2xl px-4 py-4">
              <Text className="text-lg font-poppins-bold text-[#F6EBD7]">
                Confirmar Pedido
              </Text>
            </View>

            <View className="p-6">
              <Text className="text-base font-poppins-regular text-[#402612] mb-6 text-center">
                ¿Desea confirmar este pedido y convertirlo en venta?
              </Text>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowConfirmModal(false)}
                  className="flex-1 bg-[#8B5A3C] rounded-xl py-3"
                >
                  <Text className="text-center text-white font-poppins-semibold">
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmarAccion}
                  className="flex-1 bg-[#402612] rounded-xl py-3"
                >
                  <Text className="text-center text-[#F6EBD7] font-poppins-semibold">
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Cancelar */}
      <Modal
        visible={showCancelModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm">
            <View className="bg-[#D32F2F] rounded-t-2xl px-4 py-4">
              <Text className="text-lg font-poppins-bold text-white">
                Cancelar Pedido
              </Text>
            </View>

            <View className="p-6">
              <Text className="text-base font-poppins-regular text-[#402612] mb-6 text-center">
                ¿Estás seguro que deseas cancelar este pedido?
              </Text>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowCancelModal(false)}
                  className="flex-1 bg-[#8B5A3C] rounded-xl py-3"
                >
                  <Text className="text-center text-white font-poppins-semibold">
                    No
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={cancelarAccion}
                  className="flex-1 bg-[#D32F2F] rounded-xl py-3"
                >
                  <Text className="text-center text-white font-poppins-semibold">
                    Sí, cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Component */}
      <AlertComponent />
    </ScreenContainer>
  );
}
