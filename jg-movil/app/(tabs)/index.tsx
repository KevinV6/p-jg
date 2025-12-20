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
import { usePedidos } from '@/contexts/PedidosContext';
import { useVentas } from '@/contexts/VentasContext';
import { Venta } from '@/types';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { getVentasRecientes, getTotalVentas } = useVentas();
  const { getPedidosPendientes } = usePedidos();
  const { getCobrosPendientes } = useCobros();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  const ventasRecientes = getVentasRecientes(5);
  const pedidosPendientes = getPedidosPendientes();
  const cobrosPendientes = getCobrosPendientes();
  const totalVentas = getTotalVentas();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <ScreenContainer safeTop={false}>
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

        {/* Pedidos Pendientes */}
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
