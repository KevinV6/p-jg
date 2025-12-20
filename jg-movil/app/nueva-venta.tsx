import { ComprobanteModal, ConfirmModal } from '@/components/modales';
import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import ProductSelector, { ItemCarrito } from '@/components/venta/ProductSelector';
import { useVentas } from '@/contexts/VentasContext';
import { mockClientes } from '@/data/mockData';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function NuevaVentaScreen() {
  const router = useRouter();
  const { addVenta } = useVentas();

  const [cliente, setCliente] = useState('');
  const [clienteSugerencias, setClienteSugerencias] = useState<string[]>([]);
  const [tipoVenta, setTipoVenta] = useState(1);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [showTipoVentaModal, setShowTipoVentaModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [ventaRealizada, setVentaRealizada] = useState<any>(null);

  const handleClienteChange = (text: string) => {
    setCliente(text);
    if (text.length > 0) {
      const filtered = mockClientes
        .map(c => c.cliente)
        .filter((c) => c.toLowerCase().includes(text.toLowerCase()));
      setClienteSugerencias(filtered.slice(0, 5));
    } else {
      setClienteSugerencias([]);
    }
  };

  const selectCliente = (nombreCliente: string) => {
    setCliente(nombreCliente);
    setClienteSugerencias([]);
  };

  const handleAddToCart = (item: ItemCarrito) => {
    // Buscar si ya existe el mismo producto con la misma unidad
    const existingIndex = carrito.findIndex(
      cartItem => cartItem.idproducto === item.idproducto && 
                  cartItem.idproductounidad === item.idproductounidad
    );

    if (existingIndex >= 0) {
      // Si ya existe, sumar la cantidad y recalcular subtotal
      const nuevoCarrito = [...carrito];
      nuevoCarrito[existingIndex] = {
        ...nuevoCarrito[existingIndex],
        cantidad: nuevoCarrito[existingIndex].cantidad + item.cantidad,
        precio: item.precio,
        precioUnitario: item.precio,
        subtotal: (nuevoCarrito[existingIndex].cantidad + item.cantidad) * item.precio,
      };
      setCarrito(nuevoCarrito);
    } else {
      setCarrito([...carrito, item]);
    }
  };

  const handleRemoveFromCart = (index: number) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleFinalizarVenta = () => {
    if (carrito.length === 0 || !cliente.trim()) {
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmarVenta = () => {
    const total = calcularTotal();
    const detalle = carrito.map((item) => ({
      productoid: item.idproducto,
      productounidadid: item.idproductounidad,
      opcionvarianteid: item.idopcionvariante || null,
      cantidad: item.cantidad,
      precio: item.precio,
      subtotal: item.subtotal,
      // Campos adicionales para el comprobante
      nombreProducto: item.producto.nombreproducto,
      nombreVariante: item.opcionvariante?.nombreopcionvariante,
      unidad: item.productounidad.unidad?.abreviatura || 'und',
      precio_aplicado: item.precio,
    }));

    const ventaData = {
      cliente,
      total,
      tipoventa: tipoVenta,
      detalle,
    };

    addVenta(ventaData);
    setVentaRealizada({
      ...ventaData,
      folio: `V-${Date.now()}`,
      fecha: new Date(),
    });
    
    setShowConfirmModal(false);
    setShowComprobanteModal(true);
  };

  const handleNavigateToVentas = () => {
    setShowComprobanteModal(false);
    router.push('/(tabs)/ventas');
  };

  return (
    <ScreenContainer safeTop={false} statusBarStyle="light" statusBarColor="#402612">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Header */}
        <SafeHeader>
          <View className="bg-[#402612] px-4 py-4 flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#F6EBD7" />
            </TouchableOpacity>
            <Text className="text-xl font-poppins-semibold text-[#F6EBD7]">
              Nueva Venta
            </Text>
          </View>
        </SafeHeader>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Cliente */}
          <View className="mb-4">
            <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
              Cliente *
            </Text>
            <TextInput
              className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
              placeholder="Nombre del cliente"
              placeholderTextColor="#8B5A3C"
              value={cliente}
              onChangeText={handleClienteChange}
            />
            {clienteSugerencias.length > 0 && (
              <View className="bg-white border border-[#8B5A3C] rounded-xl mt-1 max-h-40">
                <ScrollView>
                  {clienteSugerencias.map((sug, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => selectCliente(sug)}
                      className="px-4 py-2 border-b border-[#E5E5E5]"
                    >
                      <Text className="text-[#402612] font-poppins-regular">{sug}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Tipo de Venta */}
          <View className="mb-4">
            <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
              Tipo de Venta
            </Text>
            <TouchableOpacity
              onPress={() => setShowTipoVentaModal(true)}
              className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <Text className="text-[#402612] font-poppins-regular">
                {tipoVenta === 1 ? 'Contado' : 'Crédito'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#8B5A3C" />
            </TouchableOpacity>
          </View>

          {/* Componente de Selección de Productos */}
          <ProductSelector
            carrito={carrito}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
          />
        </ScrollView>

        {/* Botón Finalizar */}
        {carrito.length > 0 && (
          <View className="px-4 pb-4 pt-2 bg-[#F6EBD7] border-t border-[#E5E5E5]">
            <TouchableOpacity
              onPress={handleFinalizarVenta}
              className="bg-[#402612] rounded-xl py-4 flex-row items-center justify-center"
            >
              <Ionicons name="checkmark-circle-outline" size={24} color="#F6EBD7" />
              <Text className="text-[#F6EBD7] font-poppins-bold text-lg ml-2">
                Finalizar Venta
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Modales de Confirmación y Comprobante */}
      <ConfirmModal 
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmarVenta}
        title="Confirmar Venta"
        message="¿Estás seguro de finalizar esta venta?"
        data={{
          cliente,
          productos: carrito.length,
          total: calcularTotal()
        }}
      />

      <ComprobanteModal
        visible={showComprobanteModal}
        onClose={handleNavigateToVentas}
        title="Comprobante de Venta"
        subtitle="Venta realizada exitosamente"
        data={ventaRealizada}
        buttonText="Ir a Ventas"
        onButtonPress={handleNavigateToVentas}
        tipo="venta"
      />

      {/* Modal Tipo de Venta */}
      <Modal
        visible={showTipoVentaModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowTipoVentaModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm">
            <View className="bg-[#402612] rounded-t-2xl px-4 py-4">
              <Text className="text-lg font-poppins-bold text-[#F6EBD7]">
                Tipo de Venta
              </Text>
            </View>

            <View className="p-4">
              <TouchableOpacity
                onPress={() => {
                  setTipoVenta(1);
                  setShowTipoVentaModal(false);
                }}
                className={`border-2 rounded-xl p-4 mb-3 ${
                  tipoVenta === 1 ? 'border-[#402612] bg-[#402612]/10' : 'border-[#8B5A3C]'
                }`}
              >
                <Text className="text-base font-poppins-semibold text-[#402612]">
                  Contado
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setTipoVenta(2);
                  setShowTipoVentaModal(false);
                }}
                className={`border-2 rounded-xl p-4 ${
                  tipoVenta === 2 ? 'border-[#402612] bg-[#402612]/10' : 'border-[#8B5A3C]'
                }`}
              >
                <Text className="text-base font-poppins-semibold text-[#402612]">
                  Crédito
                </Text>
              </TouchableOpacity>
            </View>

            <View className="px-4 pb-4">
              <TouchableOpacity
                onPress={() => setShowTipoVentaModal(false)}
                className="bg-[#8B5A3C] rounded-xl py-3"
              >
                <Text className="text-center text-white font-poppins-semibold">
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
