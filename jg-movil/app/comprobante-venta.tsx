import { ComprobanteModal } from '@/components/modales';
import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { useVentas } from '@/contexts/VentasContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';

export default function ComprobanteVentaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { ventas, getVentaById } = useVentas();
  const [showModal, setShowModal] = useState(true);

  // Si hay ID, buscar esa venta, sino mostrar la última
  const venta = id
    ? getVentaById(Number(id))
    : ventas[ventas.length - 1];

  useEffect(() => {
    if (!venta) {
      router.back();
    }
  }, [venta]);

  if (!venta) {
    return (
      <ScreenContainer>
        <Text className="text-lg text-textSecondary text-center mt-16">Venta no encontrada</Text>
      </ScreenContainer>
    );
  }

  // Preparar los datos para el ComprobanteModal
  const comprobanteData = {
    folio: venta.idventa.toString().padStart(6, '0'),
    fecha: new Date(venta.fecha),
    cliente: venta.cliente?.cliente || 'Cliente General',
    tipoventa: venta.tipoventa,
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
      />
    </ScreenContainer>
  );
}
