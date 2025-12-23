import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import {
  PedidoHeaderInfo,
  PedidoProductosTable,
  PedidoTotalCard,
  PedidoActionButtons,
  ConfirmPedidoModal,
  CancelPedidoModal,
} from '@/components/pedidos';
import { usePedidos } from '@/contexts/PedidosContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
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
        <PedidoHeaderInfo pedido={pedido} />
        <PedidoProductosTable detalles={pedido.detalles} />
        <PedidoTotalCard total={total} />
        
        {pedido.estado_pedido === 'pendiente' && (
          <PedidoActionButtons 
            onConfirmar={handleConfirmar} 
            onCancelar={handleCancelar} 
          />
        )}
      </ScrollView>

      {/* Modals */}
      <ConfirmPedidoModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmarAccion}
      />

      <CancelPedidoModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={cancelarAccion}
      />

      <AlertComponent />
    </ScreenContainer>
  );
}
