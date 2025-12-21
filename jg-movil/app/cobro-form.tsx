import { ComprobanteModal, ConfirmModal } from '@/components/modales';
import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import ProductSelector, { ItemCarrito } from '@/components/venta/ProductSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useCobros } from '@/contexts/CobrosContext';
import { useVentas } from '@/contexts/VentasContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
  const { addCobro, isLoading } = useCobros();
  const { clientes, loadClientes } = useVentas();
  const { user } = useAuth();

  // Estados principales
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteSugerencias, setClienteSugerencias] = useState<typeof clientes>([]);
  const [telefono, setTelefono] = useState('');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [notas, setNotas] = useState('');
  
  // Estados de modales
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [cobroRealizado, setCobroRealizado] = useState<any>(null);

  useEffect(() => {
    loadClientes();
  }, []);

  const handleClienteChange = (text: string) => {
    setClienteNombre(text);
    setClienteId(null);
    if (text.length > 0) {
      const filtered = clientes.filter((c) => 
        c.nombrecliente.toLowerCase().includes(text.toLowerCase()) ||
        c.ci_nit?.toLowerCase().includes(text.toLowerCase())
      );
      setClienteSugerencias(filtered.slice(0, 5));
    } else {
      setClienteSugerencias([]);
    }
  };

  const selectCliente = (cliente: typeof clientes[0]) => {
    setClienteId(cliente.idcliente);
    setClienteNombre(cliente.nombrecliente);
    setTelefono(cliente.telefono || '');
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
    if (!clienteId) {
      Alert.alert('Error', 'Seleccione un cliente');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmarCobro = async () => {
    const total = calcularTotal();

    const cobroData = {
      clienteid: clienteId!,
      total,
      fecha_vencimiento: fechaVencimiento || undefined,
      notas: notas || undefined,
    };

    const result = await addCobro(cobroData);
    
    if (result) {
      setCobroRealizado({
        ...result,
        cliente: clienteNombre,
      });
      setShowConfirmModal(false);
      setShowComprobanteModal(true);
    } else {
      Alert.alert('Error', 'No se pudo registrar el cobro');
      setShowConfirmModal(false);
    }
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
              value={clienteNombre}
              onChangeText={handleClienteChange}
            />
            {clienteSugerencias.length > 0 && (
              <View className="bg-white border border-[#8B5A3C] rounded-xl mt-1 max-h-40">
                <ScrollView>
                  {clienteSugerencias.map((sug) => (
                    <TouchableOpacity
                      key={sug.idcliente}
                      onPress={() => selectCliente(sug)}
                      className="px-4 py-2 border-b border-[#E5E5E5]"
                    >
                      <Text className="text-[#402612] font-poppins-regular">{sug.nombrecliente}</Text>
                      {sug.ci_nit && (
                        <Text className="text-[#8B5A3C] font-poppins-regular text-sm">CI/NIT: {sug.ci_nit}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Campo Teléfono */}
          <View>
            <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
              Teléfono
            </Text>
            <TextInput
              className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
              placeholder="987654321"
              placeholderTextColor="#8B5A3C"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              editable={false}
            />
          </View>
        </View>

        {/* Información del Cobro */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-[#E5E5E5]">
          <Text className="text-lg font-poppins-bold text-[#402612] mb-4">
            Información del Cobro
          </Text>

          {/* Campo Total */}
          <View className="mb-4">
            <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
              Total a Cobrar (Bs) *
            </Text>
            <TextInput
              className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
              placeholder="0.00"
              placeholderTextColor="#8B5A3C"
              value={carrito.length > 0 ? calcularTotal().toFixed(2) : ''}
              onChangeText={(text) => {
                // Si hay carrito, el total se calcula automáticamente
                // Si no, se puede ingresar manualmente
                if (carrito.length === 0) {
                  const newItem: ItemCarrito = {
                    idproducto: 0,
                    idproductounidad: 0,
                    cantidad: 1,
                    precio: parseFloat(text) || 0,
                    precioUnitario: parseFloat(text) || 0,
                    subtotal: parseFloat(text) || 0,
                    producto: { idproducto: 0, nombreproducto: 'Cobro Manual', imagen: '', categoriaid: 0, estado: 1 } as any,
                    productounidad: { idproductounidad: 0, unidadid: 0, precio: parseFloat(text) || 0 } as any,
                  };
                  setCarrito([newItem]);
                }
              }}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Campo Fecha de Vencimiento */}
          <View className="mb-4">
            <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
              Fecha de Vencimiento
            </Text>
            <TextInput
              className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
              placeholder="YYYY-MM-DD (opcional)"
              placeholderTextColor="#8B5A3C"
              value={fechaVencimiento}
              onChangeText={setFechaVencimiento}
            />
          </View>

          {/* Campo Notas */}
          <View>
            <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
              Notas
            </Text>
            <TextInput
              className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
              placeholder="Notas adicionales (opcional)"
              placeholderTextColor="#8B5A3C"
              value={notas}
              onChangeText={setNotas}
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
            />
          </View>
        </View>

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
          disabled={!clienteId || calcularTotal() <= 0 || isLoading}
          className={`rounded-xl py-4 flex-row items-center justify-center ${
            clienteId && calcularTotal() > 0 && !isLoading
              ? 'bg-[#402612]'
              : 'bg-[#8B5A3C]/50'
          }`}
        >
          <Ionicons name="cash-outline" size={24} color="#F6EBD7" />
          <Text className="text-[#F6EBD7] font-poppins-bold text-lg ml-2">
            {isLoading ? 'Procesando...' : 'Finalizar Cobro'}
          </Text>
        </TouchableOpacity>
        
        {/* Mensaje de ayuda */}
        {(!clienteId || calcularTotal() <= 0) && (
          <Text className="text-xs text-[#8B5A3C] text-center mt-2 font-poppins-regular">
            {!clienteId 
              ? 'Seleccione un cliente' 
              : 'Ingrese el monto a cobrar'}
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
          cliente: clienteNombre,
          productos: 1,
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