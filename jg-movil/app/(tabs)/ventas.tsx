import { AppHeader } from '@/components/shared/AppHeader';
import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { VentasHero } from '@/components/ventas';
import { useRouter } from 'expo-router';
import React from 'react';

export default function VentasScreen() {
  const router = useRouter();

  return (
    <ScreenContainer safeTop={false}>
      <AppHeader title="Ventas" onNotificationPress={() => {}} />
      <VentasHero
        onNuevaVenta={() => router.push('/nueva-venta')}
        onHistorial={() => router.push('/historial-ventas')}
      />
    </ScreenContainer>
  );
}
