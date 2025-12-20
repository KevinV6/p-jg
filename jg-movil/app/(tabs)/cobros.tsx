import { CobroCard, CobroDetalleModal, CobroSummaryCard } from '@/components/cobros';
import { ComprobanteModal } from '@/components/modales';
import { AppHeader } from '@/components/shared/AppHeader';
import { EmptyState, FloatingActionButton } from '@/components/shared/CommonComponents';
import { FilterTabs } from '@/components/shared/FilterTabs';
import { ConfirmModal } from '@/components/shared/Modals';
import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCobros } from '@/contexts/CobrosContext';
import { Cobro } from '@/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList } from 'react-native';

const FILTER_OPTIONS = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendientes', label: 'Pendientes' },
  { key: 'pagados', label: 'Pagados' },
];

export default function CobrosScreen() {
  const router = useRouter();
  const { cobros, marcarComoPagado } = useCobros();
  const [filter, setFilter] = useState<string>('todos');
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCobroId, setSelectedCobroId] = useState<number | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [selectedCobro, setSelectedCobro] = useState<Cobro | null>(null);
  const [showComprobante, setShowComprobante] = useState(false);
  const [cobroComprobante, setCobroComprobante] = useState<any>(null);

  const filteredCobros = cobros.filter((cobro) => {
    if (filter === 'pendientes') return cobro.estado === 1;
    if (filter === 'pagados') return cobro.estado === 2;
    return true;
  });

  const cobrosPendientes = cobros.filter((c) => c.estado === 1);
  const totalPendiente = cobrosPendientes.reduce((sum, c) => sum + c.total, 0);

  const handleMarcarPagado = (id: number) => {
    setSelectedCobroId(id);
    setShowConfirm(true);
  };

  const confirmPago = () => {
    if (selectedCobroId) {
      marcarComoPagado(selectedCobroId);
    }
    setShowConfirm(false);
    setSelectedCobroId(null);
  };

  const handleVerDetalle = (cobro: Cobro) => {
    setSelectedCobro(cobro);
    setShowDetalle(true);
  };

  const handleVerComprobante = (cobro: Cobro) => {
    setShowDetalle(false);
    setCobroComprobante({
      cliente: cobro.nombrecobro,
      telefono: cobro.telefono,
      total: cobro.total,
      folio: `C-${cobro.idcobro}`,
      fecha: cobro.fechacreacion,
      auxDetalles: cobro.auxDetalles?.map(d => ({
        nombreproductoaux: d.nombreproductoaux,
        cantidadaux: d.cantidadaux,
        unidadmedida: d.unidadmedida,
        precio: d.precio,
        subtotal: d.cantidadaux * d.precio,
      })) || [],
    });
    setShowComprobante(true);
  };

  const handleMarcarPagadoDesdeModal = (id: number) => {
    setShowDetalle(false);
    handleMarcarPagado(id);
  };

  const renderCobro = ({ item }: { item: Cobro }) => (
    <CobroCard
      cobro={item}
      onPress={() => handleVerDetalle(item)}
      onMarcarPagado={() => handleMarcarPagado(item.idcobro)}
    />
  );

  return (
    <ScreenContainer safeTop={false}>
      <AppHeader title="Cobros" onNotificationPress={() => {}} />

      <CobroSummaryCard
        totalPendiente={totalPendiente}
        cantidadPendientes={cobrosPendientes.length}
      />

      <FilterTabs
        options={FILTER_OPTIONS}
        selectedKey={filter}
        onSelect={setFilter}
      />

      <FlatList
        data={filteredCobros}
        renderItem={renderCobro}
        keyExtractor={(item) => item.idcobro.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title={`No hay cobros ${filter !== 'todos' ? filter : ''}`}
            subtitle="Los cobros que registres aparecerán aquí"
          />
        }
      />

      <FloatingActionButton onPress={() => router.push('/cobro-form')} />

      <ConfirmModal
        visible={showConfirm}
        title="Confirmar Pago"
        message="¿Deseas marcar este cobro como pagado? Esta acción no se puede deshacer."
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={confirmPago}
        onCancel={() => {
          setShowConfirm(false);
          setSelectedCobroId(null);
        }}
        type="success"
      />

      <CobroDetalleModal
        visible={showDetalle}
        cobro={selectedCobro}
        onClose={() => setShowDetalle(false)}
        onMarcarPagado={handleMarcarPagadoDesdeModal}
        onVerComprobante={handleVerComprobante}
      />

      <ComprobanteModal
        visible={showComprobante}
        onClose={() => setShowComprobante(false)}
        title="Comprobante de Cobro"
        subtitle="Detalle del cobro registrado"
        data={cobroComprobante}
        buttonText="Cerrar"
        onButtonPress={() => setShowComprobante(false)}
        tipo="cobro"
        showSuccessHeader={false}
      />
    </ScreenContainer>
  );
}
