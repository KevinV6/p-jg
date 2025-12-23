import { ComprobanteModal, ConfirmModal } from '@/components/modales';
import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import { useVentas } from '@/contexts/VentasContext';
import { ventaService } from '@/services/ventaService';
import { Venta } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function ComprobanteVentaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { ventas, getVentaById, loadVentas } = useVentas();
  const { showError, showSuccess, AlertComponent } = useCustomAlert();
  
  const [showModal, setShowModal] = useState(true);
  const [venta, setVenta] = useState<Venta | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para anulación
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [anulando, setAnulando] = useState(false);

  useEffect(() => {
    const loadVenta = async () => {
      setLoading(true);
      try {
        if (id) {
          const result = await getVentaById(Number(id));
          setVenta(result);
        } else if (ventas.length > 0) {
          setVenta(ventas[ventas.length - 1]);
        }
      } catch (error) {
        console.error('Error loading venta:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVenta();
  }, [id]);

  useEffect(() => {
    if (!loading && !venta) {
      router.back();
    }
  }, [loading, venta]);

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#402612" />
        </View>
      </ScreenContainer>
    );
  }

  if (!venta) {
    return (
      <ScreenContainer>
        <Text className="text-lg text-textSecondary text-center mt-16">Venta no encontrada</Text>
      </ScreenContainer>
    );
  }

  // Preparar los datos para el ComprobanteModal
  // Generar folio para venta en formato V-000001 si no viene de la BD
  const folioVenta = venta.folio || `V-${venta.idventa.toString().padStart(6, '0')}`;
  
  const comprobanteData = {
    folio: folioVenta,
    fecha: new Date(), // Usar fecha actual del móvil
    cliente: venta.cliente?.nombrecliente || 'Sin Nombre',
    tipo_pago: venta.tipo_pago,
    vendedor: venta.usuario ? `${venta.usuario.primernombre || ''} ${venta.usuario.apellidopaterno || ''}`.trim() : undefined,
    total: venta.total,
    detalle: venta.detalles?.map((detalle: any) => {
      const nombreProducto = detalle.producto?.nombreproducto || detalle.nombreProducto || 'Producto';
      const nombreVariante = detalle.opcionvariante?.nombreopcionvariante || detalle.nombreVariante;
      
      return {
        nombreProducto: nombreProducto,
        nombreVariante: nombreVariante,
        unidad: detalle.productounidad?.unidad?.abreviatura || detalle.unidadmedida || detalle.unidad || 'und',
        cantidad: detalle.cantidad,
        precio_aplicado: detalle.precio_aplicado || detalle.precio || 0,
        subtotal: detalle.subtotal || 0,
      };
    }) || [],
  };

  const handleClose = () => {
    setShowModal(false);
    router.back();
  };

  const handleGoHome = () => {
    setShowModal(false);
    router.replace('/(tabs)');
  };

  const handleAnularRequest = () => {
    setShowAnularModal(true);
  };

  const handleAnularVenta = async () => {
    if (!venta) return;

    setAnulando(true);
    try {
      const response = await ventaService.anular(venta.idventa);
      if (response.success) {
        showSuccess('Venta Anulada', 'La venta ha sido anulada correctamente', () => {
          setShowAnularModal(false);
          loadVentas();
          router.replace('/(tabs)');
        });
      } else {
        showError('Error', response.error || 'No se pudo anular la venta');
      }
    } catch (error) {
      console.error('Error anulando venta:', error);
      showError('Error', 'Ocurrió un error al anular la venta');
    } finally {
      setAnulando(false);
    }
  };

  return (
    <ScreenContainer>
      <ComprobanteModal
        visible={showModal}
        onClose={handleClose}
        title="Comprobante de Venta"
        subtitle="Detalle de la venta"
        data={comprobanteData}
        buttonText="Ir al Inicio"
        onButtonPress={handleGoHome}
        tipo="venta"
        showSuccessHeader={false}
        onAnular={handleAnularRequest}
      />

      {/* Modal de confirmación anular */}
      <ConfirmModal
        visible={showAnularModal}
        onClose={() => setShowAnularModal(false)}
        onConfirm={handleAnularVenta}
        title="Anular Venta"
        message={`¿Estás seguro de anular la venta ${folioVenta}?${venta?.tipo_pago === 'credito' ? '\n\nNota: También se anulará el cobro asociado.' : ''}`}
        data={{
          cliente: venta?.cliente?.nombrecliente || 'Sin Nombre',
          productos: venta?.detalles?.length || 0,
          total: venta?.total || 0,
        }}
        loading={anulando}
        confirmText="Anular Venta"
        confirmColor="#EF4444"
      />

      {/* Custom Alert Component */}
      <AlertComponent />
    </ScreenContainer>
  );
}
