import { ComprobanteModal, ConfirmModal } from '@/components/modales';
import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import ProductSelector, { ItemCarrito } from '@/components/venta/ProductSelector';
import { useCobros } from '@/contexts/CobrosContext';
import { useVentas } from '@/contexts/VentasContext';
import { clienteService } from '@/services/clienteService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
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
  const { clientes, loadClientes, crearVenta, isLoading } = useVentas();
  const { cobros } = useCobros();
  const { showError, showSuccess, AlertComponent } = useCustomAlert();

  const [clienteId, setClienteId] = useState<number | null>(null);
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteCiNit, setClienteCiNit] = useState('');
  const [clienteSugerencias, setClienteSugerencias] = useState<typeof clientes>([]);
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [tipoVenta, setTipoVenta] = useState<'contado' | 'credito'>('contado');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [showTipoVentaModal, setShowTipoVentaModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [ventaRealizada, setVentaRealizada] = useState<any>(null);
  const [procesando, setProcesando] = useState(false);
  const [showCreditoBlockedModal, setShowCreditoBlockedModal] = useState(false);
  const [deudaInfo, setDeudaInfo] = useState<{ total: number; cantidad: number } | null>(null);

  useEffect(() => {
    loadClientes();
  }, []);

  const handleClienteChange = (text: string) => {
    setClienteNombre(text);
    setClienteId(null); // Reset cliente seleccionado
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
    // Si cambió el CI/NIT, buscar si coincide con algún cliente
    if (text.length > 3 && !clienteId) {
      const clienteEncontrado = clientes.find(c => 
        c.ci_nit?.toLowerCase() === text.toLowerCase()
      );
      if (clienteEncontrado) {
        setClienteId(clienteEncontrado.idcliente);
        setClienteNombre(clienteEncontrado.nombrecliente);
      }
    }
  };

  const selectCliente = (cliente: typeof clientes[0]) => {
    setClienteId(cliente.idcliente);
    setClienteNombre(cliente.nombrecliente);
    setClienteCiNit(cliente.ci_nit || '');
    setClienteSugerencias([]);
    setShowSugerencias(false);
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

  // Función para verificar si el cliente tiene cobros pendientes
  const verificarCobrosPendientes = (idCliente: number): { tiene: boolean; total: number; cantidad: number } => {
    const cobrosPendientesCliente = cobros.filter(
      c => c.clienteid === idCliente && c.estado === 1
    );
    const totalDeuda = cobrosPendientesCliente.reduce((sum, c) => sum + c.total, 0);
    return {
      tiene: cobrosPendientesCliente.length > 0,
      total: totalDeuda,
      cantidad: cobrosPendientesCliente.length
    };
  };

  const handleFinalizarVenta = async () => {
    if (carrito.length === 0) {
      showError('Error', 'Agrega productos al carrito');
      return;
    }

    // Si es venta a crédito y hay un cliente seleccionado, verificar si tiene cobros pendientes
    if (tipoVenta === 'credito' && clienteId) {
      const { tiene, total, cantidad } = verificarCobrosPendientes(clienteId);
      if (tiene) {
        setDeudaInfo({ total, cantidad });
        setShowCreditoBlockedModal(true);
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const confirmarVenta = async () => {
    setProcesando(true);
    console.log('[NuevaVenta] === INICIANDO CONFIRMAR VENTA ===');
    console.log('[NuevaVenta] Estado inicial:', { clienteId, clienteNombre, clienteCiNit, tipoVenta, carritoItems: carrito.length });
    
    try {
      let idClienteFinal = clienteId;

      // Si no hay cliente seleccionado pero hay nombre, crear nuevo cliente
      if (!idClienteFinal && clienteNombre.trim()) {
        console.log('[NuevaVenta] Creando nuevo cliente:', { nombre: clienteNombre, ci_nit: clienteCiNit });
        const nuevoCliente = await clienteService.create({
          nombre: clienteNombre.trim(),
          ci_nit: clienteCiNit.trim() || 'S/N',
        });

        console.log('[NuevaVenta] Respuesta crear cliente:', nuevoCliente);
        if (nuevoCliente.success && nuevoCliente.data) {
          idClienteFinal = nuevoCliente.data.idcliente;
          console.log('[NuevaVenta] Cliente creado con ID:', idClienteFinal);
        } else {
          console.error('[NuevaVenta] Error creando cliente:', nuevoCliente.error);
          showError('Error', 'No se pudo crear el cliente');
          setProcesando(false);
          return;
        }
      }

      // Si aún no hay cliente, usar el genérico
      if (!idClienteFinal) {
        console.log('[NuevaVenta] Buscando cliente genérico...');
        const genericoRes = await clienteService.getGenerico();
        console.log('[NuevaVenta] Respuesta cliente genérico:', genericoRes);
        if (genericoRes.success && genericoRes.data) {
          idClienteFinal = genericoRes.data.idcliente;
          setClienteNombre(genericoRes.data.nombrecliente);
          console.log('[NuevaVenta] Usando cliente genérico ID:', idClienteFinal);
        } else {
          showError('Error', 'No se encontró cliente genérico');
          setProcesando(false);
          return;
        }
      }

      const total = calcularTotal();
      const detalle = carrito.map((item) => ({
        productoid: item.idproducto,
        productounidadid: item.idproductounidad,
        opcionvarianteid: item.idopcionvariante || null,
        cantidad: item.cantidad,
        precio: item.precio,
        subtotal: item.subtotal,
      }));

      const ventaData = {
        clienteid: idClienteFinal,
        total,
        tipo_pago: tipoVenta,
        fecha: new Date().toISOString(), // Fecha local del móvil
        detalle,
      };

      console.log('[NuevaVenta] Datos de venta a enviar:', JSON.stringify(ventaData, null, 2));
      const result = await crearVenta(ventaData);
      console.log('[NuevaVenta] Resultado de crearVenta:', result);
      
      if (result) {
        console.log('[NuevaVenta] === VENTA EXITOSA ===');
        
        // Preparar datos para el comprobante
        setVentaRealizada({
          folio: result.folio || result.idventa?.toString().padStart(6, '0'),
          fecha: new Date(), // Usar fecha actual del móvil
          cliente: clienteNombre || result.cliente?.nombrecliente || 'Cliente General',
          telefono: result.cliente?.telefono,
          tipo_pago: result.tipo_pago,
          vendedor: result.usuario ? `${result.usuario.primernombre || ''} ${result.usuario.apellidopaterno || ''}`.trim() : undefined,
          total: result.total,
          detalle: result.detalles?.map((d: any) => ({
            nombreProducto: d.producto?.nombreproducto || 'Producto',
            nombreVariante: d.opcionvariante?.nombreopcionvariante,
            cantidad: d.cantidad,
            unidad: d.productounidad?.unidad?.abreviatura || d.unidadmedida || 'und',
            precio_aplicado: d.precio_aplicado || d.precio_lista || 0,
            subtotal: d.subtotal || 0,
          })) || [],
        });
        
        setShowConfirmModal(false);
        setShowComprobanteModal(true);
      } else {
        console.error('[NuevaVenta] === VENTA FALLIDA ===');
        showError('Error', 'No se pudo crear la venta. Verifica tu conexión e intenta nuevamente.');
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error('Error en venta:', error);
      showError('Error', 'Ocurrió un error al procesar la venta. Verifica tu conexión e intenta nuevamente.');
      setShowConfirmModal(false);
    } finally {
      setProcesando(false);
    }
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

        <ScrollView className="flex-1 px-4 py-4" keyboardShouldPersistTaps="handled">
          {/* Datos del Cliente */}
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
                        onPress={() => {
                          console.log('[NuevaVenta] Cliente seleccionado:', sug);
                          selectCliente(sug);
                        }}
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
            <View>
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
            ) : (
              <View className="mt-3 flex-row items-center">
                <Ionicons name="information-circle" size={16} color="#8B5A3C" />
                <Text className="text-[#8B5A3C] font-poppins-regular text-sm ml-1">
                  Sin cliente = "Cliente General"
                </Text>
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
                {tipoVenta === 'contado' ? 'Contado' : 'Crédito'}
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
        onClose={() => !procesando && setShowConfirmModal(false)}
        onConfirm={confirmarVenta}
        title="Confirmar Venta"
        message={procesando ? "Procesando venta..." : "¿Estás seguro de finalizar esta venta?"}
        data={{
          cliente: clienteNombre || 'Cliente General',
          productos: carrito.length,
          total: calcularTotal()
        }}
        loading={procesando}
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
                  setTipoVenta('contado');
                  setShowTipoVentaModal(false);
                }}
                className={`border-2 rounded-xl p-4 mb-3 ${
                  tipoVenta === 'contado' ? 'border-[#402612] bg-[#402612]/10' : 'border-[#8B5A3C]'
                }`}
              >
                <Text className="text-base font-poppins-semibold text-[#402612]">
                  Contado
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setTipoVenta('credito');
                  setShowTipoVentaModal(false);
                }}
                className={`border-2 rounded-xl p-4 ${
                  tipoVenta === 'credito' ? 'border-[#402612] bg-[#402612]/10' : 'border-[#8B5A3C]'
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

      {/* Modal de Crédito Bloqueado */}
      <Modal
        visible={showCreditoBlockedModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCreditoBlockedModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm">
            {/* Header con icono de alerta */}
            <View className="bg-[#FF5555] rounded-t-2xl px-4 py-5 items-center">
              <View className="bg-white/20 rounded-full p-3 mb-2">
                <Ionicons name="warning" size={36} color="#FFFFFF" />
              </View>
              <Text className="text-lg font-poppins-bold text-white text-center">
                Crédito No Disponible
              </Text>
            </View>

            <View className="p-5">
              <Text className="text-base font-poppins-regular text-[#402612] text-center mb-4">
                Este cliente tiene{' '}
                <Text className="font-poppins-bold">{deudaInfo?.cantidad} cobro(s) pendiente(s)</Text>{' '}
                por un total de:
              </Text>
              
              <View className="bg-[#FF5555]/10 rounded-xl p-4 mb-4 items-center">
                <Text className="text-3xl font-poppins-black text-[#FF5555]">
                  Bs. {deudaInfo?.total.toFixed(2)}
                </Text>
              </View>

              <Text className="text-sm font-poppins-regular text-[#8B5A3C] text-center mb-4">
                No puede realizar ventas a crédito hasta que pague su deuda pendiente.
              </Text>

              <View className="bg-[#3B82F6]/10 rounded-xl p-3 flex-row items-center">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="text-sm font-poppins-regular text-[#3B82F6] ml-2 flex-1">
                  Puede realizar la venta al contado.
                </Text>
              </View>
            </View>

            <View className="px-4 pb-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowCreditoBlockedModal(false);
                  setTipoVenta('contado');
                }}
                className="flex-1 bg-[#402612] rounded-xl py-3"
              >
                <Text className="text-center text-white font-poppins-bold">
                  Cambiar a Contado
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowCreditoBlockedModal(false)}
                className="flex-1 bg-[#8B5A3C] rounded-xl py-3"
              >
                <Text className="text-center text-white font-poppins-semibold">
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Component */}
      <AlertComponent />
    </ScreenContainer>
  );
}
