import { ComprobanteModal, ConfirmModal } from '@/components/modales';
import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import ProductSelector, { ItemCarrito } from '@/components/venta/ProductSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useCobros } from '@/contexts/CobrosContext';
import { useVentas } from '@/contexts/VentasContext';
import { clienteService } from '@/services/clienteService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
  const { showError, showSuccess, AlertComponent } = useCustomAlert();

  // Estados principales - igual que nueva-venta
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteCiNit, setClienteCiNit] = useState('');
  const [clienteSugerencias, setClienteSugerencias] = useState<typeof clientes>([]);
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [telefono, setTelefono] = useState('');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [notas, setNotas] = useState('');
  const [procesando, setProcesando] = useState(false);
  
  // Estados de modales
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [cobroRealizado, setCobroRealizado] = useState<any>(null);

  useEffect(() => {
    loadClientes();
  }, []);

  // Funciones para cliente - igual que nueva-venta
  const handleClienteChange = (text: string) => {
    setClienteNombre(text);
    setClienteId(null);
    if (text.length > 1) {
      const filtered = clientes.filter((c) => 
        c.nombrecliente.toLowerCase().includes(text.toLowerCase()) ||
        c.ci_nit?.toLowerCase().includes(text.toLowerCase())
      );
      setClienteSugerencias(filtered.slice(0, 5));
      setShowSugerencias(true);
    } else {
      setClienteSugerencias([]);
      setShowSugerencias(false);
    }
  };

  const handleCiNitChange = (text: string) => {
    setClienteCiNit(text);
    if (text.length > 3 && !clienteId) {
      const clienteEncontrado = clientes.find(c => 
        c.ci_nit?.toLowerCase() === text.toLowerCase()
      );
      if (clienteEncontrado) {
        setClienteId(clienteEncontrado.idcliente);
        setClienteNombre(clienteEncontrado.nombrecliente);
        setTelefono(clienteEncontrado.telefono || '');
      }
    }
  };

  const selectCliente = (cliente: typeof clientes[0]) => {
    setClienteId(cliente.idcliente);
    setClienteNombre(cliente.nombrecliente);
    setClienteCiNit(cliente.ci_nit || '');
    setTelefono(cliente.telefono || '');
    setClienteSugerencias([]);
    setShowSugerencias(false);
  };

  // Funciones del carrito
  const handleAddToCart = (item: ItemCarrito) => {
    const existingIndex = carrito.findIndex(
      cartItem => cartItem.idproducto === item.idproducto && 
                  cartItem.idproductounidad === item.idproductounidad
    );

    if (existingIndex >= 0) {
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
    if (carrito.length === 0) {
      showError('Error', 'Agrega productos al cobro');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmarCobro = async () => {
    setProcesando(true);
    console.log('[CobroForm] === INICIANDO CONFIRMAR COBRO ===');
    
    try {
      let idClienteFinal = clienteId;

      // Si no hay cliente seleccionado pero hay nombre, crear nuevo cliente
      if (!idClienteFinal && clienteNombre.trim()) {
        console.log('[CobroForm] Creando nuevo cliente:', { nombre: clienteNombre, ci_nit: clienteCiNit });
        const nuevoCliente = await clienteService.create({
          nombre: clienteNombre.trim(),
          ci_nit: clienteCiNit.trim() || 'S/N',
          telefono: telefono.trim() || undefined,
        });

        if (nuevoCliente.success && nuevoCliente.data) {
          idClienteFinal = nuevoCliente.data.idcliente;
          console.log('[CobroForm] Cliente creado con ID:', idClienteFinal);
          loadClientes(); // Recargar lista de clientes
        } else {
          console.error('[CobroForm] Error creando cliente:', nuevoCliente.error);
          showError('Error', 'No se pudo crear el cliente');
          setProcesando(false);
          return;
        }
      }

      // Si aún no hay cliente, mostrar error (cobros requieren cliente)
      if (!idClienteFinal) {
        showError('Error', 'Debe seleccionar o crear un cliente para el cobro');
        setProcesando(false);
        return;
      }

      const total = calcularTotal();

      const cobroData = {
        clienteid: idClienteFinal,
        total,
        fecha_vencimiento: fechaVencimiento || undefined,
        notas: notas || undefined,
      };

      console.log('[CobroForm] Datos de cobro a enviar:', JSON.stringify(cobroData, null, 2));
      const result = await addCobro(cobroData);
      console.log('[CobroForm] Resultado de addCobro:', result);
      
      if (result) {
        console.log('[CobroForm] === COBRO EXITOSO ===');
        
        setCobroRealizado({
          ...result,
          cliente: clienteNombre,
          telefono: telefono,
          detalle: carrito.map((item) => ({
            nombreProducto: item.producto?.nombreproducto || 'Producto',
            nombreVariante: item.opcionvariante?.nombreopcionvariante,
            cantidad: item.cantidad,
            unidad: item.productounidad?.unidad?.abreviatura || 'und',
            precio_aplicado: item.precio,
            subtotal: item.subtotal,
          })),
        });
        
        setShowConfirmModal(false);
        setShowComprobanteModal(true);
      } else {
        console.error('[CobroForm] === COBRO FALLIDO ===');
        showError('Error', 'No se pudo registrar el cobro. Verifica tu conexión e intenta nuevamente.');
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error('Error en cobro:', error);
      showError('Error', 'Ocurrió un error al procesar el cobro. Verifica tu conexión e intenta nuevamente.');
      setShowConfirmModal(false);
    } finally {
      setProcesando(false);
    }
  };

  const handleNavigateToCobros = () => {
    setShowComprobanteModal(false);
    router.push('/(tabs)/cobros');
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
              Nuevo Cobro
            </Text>
          </View>
        </SafeHeader>

        <ScrollView className="flex-1 px-4 py-4" keyboardShouldPersistTaps="handled">
          {/* Datos del Cliente - igual que nueva-venta */}
          <View className="mb-4 bg-white rounded-xl p-4 border border-[#E5E5E5]">
            <Text className="text-base font-poppins-bold text-[#402612] mb-3">
              Datos del Cliente
            </Text>
            
            {/* Nombre del Cliente */}
            <View className="mb-3">
              <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-1">
                Nombre {!clienteId && <Text className="text-xs font-poppins-regular">(nuevo cliente si no existe)</Text>}
              </Text>
              <View className="relative">
                <TextInput
                  className={`bg-[#F6EBD7] border rounded-xl px-4 py-3 text-[#402612] font-poppins-regular ${
                    clienteId ? 'border-green-500' : 'border-[#8B5A3C]'
                  }`}
                  placeholder="Buscar o escribir nombre..."
                  placeholderTextColor="#8B5A3C80"
                  value={clienteNombre}
                  onChangeText={handleClienteChange}
                  onFocus={() => clienteNombre.length > 1 && setShowSugerencias(true)}
                />
                {clienteId && (
                  <View className="absolute right-3 top-3">
                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  </View>
                )}
              </View>
              
              {/* Sugerencias */}
              {showSugerencias && clienteSugerencias.length > 0 && (
                <View 
                  className="bg-white border border-[#8B5A3C] rounded-xl mt-1 max-h-40 absolute top-full left-0 right-0 shadow-lg"
                  style={{ zIndex: 9999, elevation: 10 }}
                >
                  <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="always">
                    {clienteSugerencias.map((sug) => (
                      <TouchableOpacity
                        key={sug.idcliente}
                        onPress={() => selectCliente(sug)}
                        className="px-4 py-3 border-b border-[#E5E5E5] active:bg-[#F6EBD7]"
                        activeOpacity={0.7}
                      >
                        <Text className="text-[#402612] font-poppins-semibold">{sug.nombrecliente}</Text>
                        {sug.ci_nit && (
                          <Text className="text-[#8B5A3C] font-poppins-regular text-sm">CI/NIT: {sug.ci_nit}</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* CI/NIT */}
            <View className="mb-3">
              <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-1">
                CI/NIT <Text className="text-xs font-poppins-regular">(opcional)</Text>
              </Text>
              <TextInput
                className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                placeholder="Ej: 12345678"
                placeholderTextColor="#8B5A3C80"
                value={clienteCiNit}
                onChangeText={handleCiNitChange}
                keyboardType="default"
              />
            </View>

            {/* Teléfono */}
            <View>
              <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-1">
                Teléfono <Text className="text-xs font-poppins-regular">(opcional)</Text>
              </Text>
              <TextInput
                className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                placeholder="987654321"
                placeholderTextColor="#8B5A3C80"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
              />
            </View>

            {/* Indicador de cliente */}
            {clienteId ? (
              <View className="mt-3 flex-row items-center">
                <Ionicons name="person-circle" size={16} color="#22c55e" />
                <Text className="text-green-600 font-poppins-regular text-sm ml-1">
                  Cliente existente seleccionado
                </Text>
              </View>
            ) : clienteNombre.trim() ? (
              <View className="mt-3 flex-row items-center">
                <Ionicons name="person-add" size={16} color="#8B5A3C" />
                <Text className="text-[#8B5A3C] font-poppins-regular text-sm ml-1">
                  Se creará nuevo cliente al finalizar
                </Text>
              </View>
            ) : null}
          </View>

          {/* Info adicional del cobro */}
          <View className="mb-4 bg-white rounded-xl p-4 border border-[#E5E5E5]">
            <Text className="text-base font-poppins-bold text-[#402612] mb-3">
              Información Adicional
            </Text>

            {/* Fecha de Vencimiento */}
            <View className="mb-3">
              <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-1">
                Fecha de Vencimiento <Text className="text-xs font-poppins-regular">(opcional)</Text>
              </Text>
              <TextInput
                className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#8B5A3C80"
                value={fechaVencimiento}
                onChangeText={setFechaVencimiento}
              />
            </View>

            {/* Notas */}
            <View>
              <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-1">
                Notas <Text className="text-xs font-poppins-regular">(opcional)</Text>
              </Text>
              <TextInput
                className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                placeholder="Notas adicionales..."
                placeholderTextColor="#8B5A3C80"
                value={notas}
                onChangeText={setNotas}
                multiline
                numberOfLines={2}
                style={{ height: 60, textAlignVertical: 'top' }}
              />
            </View>
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
            {/* Total */}
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

            <TouchableOpacity
              onPress={handleFinalizarCobro}
              disabled={procesando || isLoading}
              className={`rounded-xl py-4 flex-row items-center justify-center ${
                procesando || isLoading ? 'bg-[#8B5A3C]/50' : 'bg-[#402612]'
              }`}
            >
              {procesando ? (
                <ActivityIndicator color="#F6EBD7" />
              ) : (
                <>
                  <Ionicons name="cash-outline" size={24} color="#F6EBD7" />
                  <Text className="text-[#F6EBD7] font-poppins-bold text-lg ml-2">
                    Finalizar Cobro
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Modales */}
      <ConfirmModal 
        visible={showConfirmModal}
        onClose={() => !procesando && setShowConfirmModal(false)}
        onConfirm={confirmarCobro}
        title="Confirmar Cobro"
        message={procesando ? "Procesando cobro..." : "¿Estás seguro de registrar este cobro?"}
        data={{
          cliente: clienteNombre || 'Nuevo Cliente',
          productos: carrito.length,
          total: calcularTotal()
        }}
        loading={procesando}
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

      {/* Custom Alert Component */}
      <AlertComponent />
    </ScreenContainer>
  );
}