import { ComprobanteModal, ConfirmModal } from '@/components/modales';
import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import ProductSelector, { ItemCarrito } from '@/components/venta/ProductSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useCobros } from '@/contexts/CobrosContext';
import { mockClientes } from '@/data/mockData';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CobroFormScreen() {
  const router = useRouter();
  const { addCobro } = useCobros();
  const { user } = useAuth();

  // Estados principales
  const [cliente, setCliente] = useState('');
  const [clienteSugerencias, setClienteSugerencias] = useState<string[]>([]);
  const [telefono, setTelefono] = useState('');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  
  // Estados de modales
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [cobroRealizado, setCobroRealizado] = useState<any>(null);

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

  const handleFinalizarCobro = () => {
    if (carrito.length === 0 || !cliente.trim() || !telefono.trim()) {
      Alert.alert('Error', 'Complete todos los campos y agregue al menos un producto');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmarCobro = () => {
    const total = calcularTotal();
    const auxDetalles = carrito.map((item, index) => ({
      idauxventa: index + 1,
      nombreproductoaux: item.producto.nombreproducto,
      cantidadaux: item.cantidad,
      pesoaux: item.cantidad,
      unidadmedida: item.productounidad.unidad?.nombre || 'und',
      precio: item.precio,
      subtotal: item.subtotal,
      estado: 1,
      fechacreacion: new Date(),
      usuarioid: user?.idusuario || 1,
    }));

    const cobroData = {
      nombrecobro: cliente,
      telefono,
      auxventa: 1,
      total,
      estado: 1,
      usuarioid: user?.idusuario || 1,
      imagen: '',
      fechacreacion: new Date(),
      auxDetalles,
    };

    addCobro(cobroData);
    setCobroRealizado({
      ...cobroData,
      cliente, // Para el comprobante
      folio: `C-${Date.now()}`,
      fecha: new Date(),
    });
    
    setShowConfirmModal(false);
    setShowComprobanteModal(true);
  };

  const handleNavigateToCobros = () => {
    setShowComprobanteModal(false);
    router.push('/(tabs)/cobros');
  };

  return (
    <ScreenContainer safeTop={false} statusBarStyle="light" statusBarColor="#402612">
      {/* Header */}
      <SafeHeader>
        <View className="bg-[#402612] px-4 py-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#F6EBD7" />
          </TouchableOpacity>
          <Text className="text-xl font-poppins-semibold text-[#F6EBD7]">
            Nuevo Cobro
          </Text>
        </View>
      </SafeHeader>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Información del Cliente */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-[#E5E5E5]">
          <Text className="text-lg font-poppins-bold text-[#402612] mb-4">
            Información del Cliente
          </Text>

          {/* Campo Cliente */}
          <View className="mb-4">
            <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
              Cliente *
            </Text>
            <TextInput
              className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
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

          {/* Campo Teléfono */}
          <View>
            <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
              Teléfono *
            </Text>
            <TextInput
              className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
              placeholder="987654321"
              placeholderTextColor="#8B5A3C"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Componente de Selección de Productos */}
        <ProductSelector
          carrito={carrito}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          title="Productos del Cobro"
          buttonText="Seleccionar Producto"
        />

        {/* Espacio extra al final para que el contenido no quede tapado */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Footer fijo con Total y Botón Finalizar */}
      <View className="px-4 pb-4 pt-3 bg-white border-t border-[#E5E5E5]">
        {/* Resumen del Total */}
        <View className="flex-row justify-between items-center mb-3 px-2">
          <View className="flex-row items-center">
            <View className="bg-[#402612] rounded-full p-2 mr-2">
              <Ionicons name="receipt-outline" size={18} color="#F6EBD7" />
            </View>
            <Text className="text-base font-poppins-semibold text-[#402612]">
              Total del Cobro:
            </Text>
          </View>
          <Text className="text-2xl font-poppins-black text-[#402612]">
            Bs. {calcularTotal().toFixed(2)}
          </Text>
        </View>

        {/* Botón Finalizar */}
        <TouchableOpacity
          onPress={handleFinalizarCobro}
          disabled={carrito.length === 0 || !cliente.trim() || !telefono.trim()}
          className={`rounded-xl py-4 flex-row items-center justify-center ${
            carrito.length > 0 && cliente.trim() && telefono.trim()
              ? 'bg-[#402612]'
              : 'bg-[#8B5A3C]/50'
          }`}
        >
          <Ionicons name="cash-outline" size={24} color="#F6EBD7" />
          <Text className="text-[#F6EBD7] font-poppins-bold text-lg ml-2">
            Finalizar Cobro
          </Text>
        </TouchableOpacity>
        
        {/* Mensaje de ayuda */}
        {(carrito.length === 0 || !cliente.trim() || !telefono.trim()) && (
          <Text className="text-xs text-[#8B5A3C] text-center mt-2 font-poppins-regular">
            {carrito.length === 0 
              ? 'Agregue al menos un producto' 
              : !cliente.trim() 
                ? 'Ingrese el nombre del cliente'
                : 'Ingrese el teléfono del cliente'}
          </Text>
        )}
      </View>

      {/* Modales de Confirmación y Comprobante */}
      <ConfirmModal 
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmarCobro}
        title="Confirmar Cobro"
        message="¿Estás seguro de registrar este cobro?"
        data={{
          cliente,
          productos: carrito.length,
          total: calcularTotal()
        }}
      />

      <ComprobanteModal
        visible={showComprobanteModal}
        onClose={handleNavigateToCobros}
        title="Comprobante de Cobro"
        subtitle="Cobro registrado exitosamente"
        data={cobroRealizado}
        buttonText="Ir a Cobros"
        onButtonPress={handleNavigateToCobros}
        tipo="cobro"
      />
    </ScreenContainer>
  );
}