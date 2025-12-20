import { PedidoCard } from '@/components/pedidos';
import { AppHeader } from '@/components/shared/AppHeader';
import { EmptyState } from '@/components/shared/CommonComponents';
import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { usePedidos } from '@/contexts/PedidosContext';
import { Pedido } from '@/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList } from 'react-native';

export default function PedidosScreen() {
  const router = useRouter();
  const { pedidos } = usePedidos();

  const renderPedido = ({ item }: { item: Pedido }) => (
    <PedidoCard
      pedido={item}
      onPress={() => router.push(`/pedido-detalle?id=${item.idpedido}`)}
    />
  );

  return (
    <ScreenContainer safeTop={false}>
      <AppHeader title="Pedidos" onNotificationPress={() => {}} />
      <FlatList
        data={pedidos}
        renderItem={renderPedido}
        keyExtractor={(item) => item.idpedido.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="No hay pedidos"
            subtitle="Los pedidos aparecerán aquí"
          />
        }
      />
    </ScreenContainer>
  );
}
