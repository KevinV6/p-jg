import {
  CobroPreviewCard,
  EmptySection,
  PedidoPreviewCard,
  SectionHeader,
  SummaryCard,
  VentaPreviewCard,
} from '@/components/home';
import { AppHeader } from '@/components/shared/AppHeader';
import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useCobros } from '@/contexts/CobrosContext';
import { useVentas } from '@/contexts/VentasContext';
import { useAppData } from '@/contexts/AppDataContext';
import { Venta, Pedido } from '@/types';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View, Text } from 'react-native';

// Datos mock de pedidos para mostrar en la UI (sin conexión a BD)
const mockPedidosPreview: Pedido[] = [
  {
    idpedido: 1,
    fecha: new Date().toISOString(),
    estado_pedido: 'pendiente',
    estado: 1,
    clienteid: 1,
    usuarioid: 1,
    total: 42.50,
    cliente: { 
      idcliente: 1, 
      nombrecliente: 'Juan Pérez', 
      ci_nit: '12345678', 
      estado: 1 
    },
    notas: 'Entregar antes de las 5pm',
    fechaactualizacion: new Date().toISOString(),
    detalles: [
      { 
        iddetallepedido: 1, 
        pedidoid: 1, 
        productoid: 1, 
        cantidad: 5,
        precio: 8.50,
        subtotal: 42.50,
        producto: { idproducto: 1, nombreproducto: 'Manzana Roja', imagen: '', categoriaid: 1, estado: 1 }
      }
    ],
  },
  {
    idpedido: 2,
    fecha: new Date().toISOString(),
    estado_pedido: 'pendiente',
    estado: 1,
    clienteid: 2,
    usuarioid: 1,
    total: 10.50,
    cliente: { 
      idcliente: 2, 
      nombrecliente: 'María López', 
      ci_nit: '87654321', 
      estado: 1 
    },
    notas: 'Cliente regular',
    fechaactualizacion: new Date().toISOString(),
    detalles: [
      { 
        iddetallepedido: 2, 
        pedidoid: 2, 
        productoid: 2, 
        cantidad: 3,
        precio: 3.50,
        subtotal: 10.50,
        producto: { idproducto: 2, nombreproducto: 'Tomate', imagen: '', categoriaid: 2, estado: 1 }
      }
    ],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { getVentasRecientes, getTotalVentas } = useVentas();
  const { getCobrosPendientes } = useCobros();
  const { isDataLoaded, isLoadingData, refreshAllData } = useAppData();
  const [refreshing, setRefreshing] = useState(false);

  // Usar datos mock para pedidos (solo visual, sin BD)
  const [pedidosPendientes] = useState<Pedido[]>(mockPedidosPreview);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  const ventasRecientes = getVentasRecientes(5);
  const cobrosPendientes = getCobrosPendientes();
  const totalVentas = getTotalVentas();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshAllData();
    setRefreshing(false);
  }, [refreshAllData]);

  // Mostrar indicador de carga inicial
  if (!isDataLoaded && isLoadingData) {
    return (
      <ScreenContainer safeTop={false} hasTabBar={true}>
        <AppHeader title="Inicio" onNotificationPress={() => {}} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#402612" />
          <Text className="mt-4 text-[#8B5A3C] font-poppins-medium">
            Cargando datos...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer safeTop={false} hasTabBar={true}>
      <AppHeader title="Inicio" onNotificationPress={() => {}} />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Resumen General */}
        <View className="px-4 mt-4">
          <SectionHeader title="Resumen General" />

          <View className="flex-row flex-wrap gap-3">
            <SummaryCard
              title="Total Ventas"
              value={`Bs ${totalVentas.toFixed(2)}`}
              icon="trending-up"
              iconColor="#3B82F6"
              iconBgColor="#3B82F620"
              onPress={() => router.push('/(tabs)/ventas')}
            />
            <SummaryCard
              title="Pedidos Pendientes"
              value={pedidosPendientes.length}
              icon="document-text"
              iconColor="#F97316"
              iconBgColor="#F9731620"
              badge={pedidosPendientes.length}
              badgeBgClass="bg-orange-100"
              badgeTextClass="text-orange-600"
              onPress={() => router.push('/(tabs)/pedidos')}
            />
            <SummaryCard
              title="Cobros Pendientes"
              value={cobrosPendientes.length}
              icon="calendar"
              iconColor="#9333EA"
              iconBgColor="#9333EA20"
              badge={cobrosPendientes.length}
              badgeBgClass="bg-purple-100"
              badgeTextClass="text-purple-600"
              onPress={() => router.push('/(tabs)/cobros')}
            />
          </View>
        </View>

        {/* Últimas Ventas */}
        <View className="mt-6 px-4">
          <SectionHeader
            title="Últimas Ventas"
            onActionPress={() => router.push('/historial-ventas')}
          />
          {ventasRecientes.length === 0 ? (
            <EmptySection
              icon="cart-outline"
              iconBgColor="#40261220"
              message="No hay ventas registradas"
            />
          ) : (
            ventasRecientes.map((venta: Venta) => (
              <VentaPreviewCard
                key={venta.idventa}
                venta={venta}
                onPress={() =>
                  router.push(`/comprobante-venta?id=${venta.idventa}`)
                }
              />
            ))
          )}
        </View>

        {/* Pedidos Pendientes (Mock - Solo visual) */}
        <View className="mt-6 px-4">
          <SectionHeader
            title="Pedidos Pendientes"
            actionColor="#F97316"
            onActionPress={() => router.push('/(tabs)/pedidos')}
          />
          {pedidosPendientes.length === 0 ? (
            <EmptySection
              icon="document-text-outline"
              iconBgColor="#F9731620"
              message="No hay pedidos pendientes"
            />
          ) : (
            pedidosPendientes.slice(0, 3).map((pedido) => (
              <PedidoPreviewCard
                key={pedido.idpedido}
                pedido={pedido}
                onPress={() =>
                  router.push(`/pedido-detalle?id=${pedido.idpedido}`)
                }
              />
            ))
          )}
        </View>

        {/* Cobros Pendientes */}
        <View className="mt-6 px-4 pb-8">
          <SectionHeader
            title="Cobros Pendientes"
            actionColor="#9333EA"
            onActionPress={() => router.push('/(tabs)/cobros')}
          />
          {cobrosPendientes.length === 0 ? (
            <EmptySection
              icon="calendar-outline"
              iconBgColor="#9333EA20"
              message="No hay cobros pendientes"
            />
          ) : (
            cobrosPendientes.slice(0, 3).map((cobro) => (
              <CobroPreviewCard key={cobro.idcobro} cobro={cobro} />
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
