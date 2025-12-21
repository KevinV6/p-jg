import { ComprobanteModal, ConfirmModal } from '@/components/modales';
import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import ProductSelector, { ItemCarrito } from '@/components/venta/ProductSelector';
import { useCobros } from '@/contexts/CobrosContext';
import { useVentas } from '@/contexts/VentasContext';
import { clienteService } from '@/services/clienteService';
import { validateDecimalInput } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const [montoPago, setMontoPago] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

  // Detectar teclado visible
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Calcular total y cambio usando useMemo
  const total = useMemo(() => {
    return carrito.reduce((sum, item) => sum + item.subtotal, 0);
  }, [carrito]);

  const cambio = useMemo(() => {
    const pago = parseFloat(montoPago) || 0;
    return pago - total;
  }, [montoPago, total]);

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
    // Buscar si ya existe el mismo producto con la misma unidad Y la misma variante
    // Si las variantes son diferentes (o una tiene variante y otra no), son items distintos
    const existingIndex = carrito.findIndex(
      cartItem => 
        cartItem.idproducto === item.idproducto && 
        cartItem.idproductounidad === item.idproductounidad &&
        cartItem.idopcionvariante === item.idopcionvariante // Verificar también la variante
    );

    if (existingIndex >= 0) {
      // Si ya existe el mismo producto, misma unidad Y misma variante, sumar la cantidad
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
      // Si es una variante diferente o no existe, agregar como nuevo item
      setCarrito([...carrito, item]);
    }
  };

  const handleRemoveFromCart = (index: number) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };

  // Mantener compatibilidad con código existente
  const calcularTotal = () => total;

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

    // Si es venta a crédito, validar que haya un cliente EXISTENTE seleccionado
    if (tipoVenta === 'credito' && !clienteId) {
      showError('Venta a Crédito', 'Para ventas a crédito debes seleccionar un cliente existente. No se puede crear un nuevo cliente para crédito.');
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
        // Validar CI/NIT si fue proporcionado
        const ciNitTrimmed = clienteCiNit.trim();
        if (ciNitTrimmed && ciNitTrimmed.length < 8) {
          showError('CI/NIT Inválido', 'El CI/NIT debe tener al menos 8 dígitos');
          setProcesando(false);
          return;
        }
        
        console.log('[NuevaVenta] Creando nuevo cliente:', { nombre: clienteNombre, ci_nit: ciNitTrimmed });
        const nuevoCliente = await clienteService.create({
          nombre: clienteNombre.trim(),
          ci_nit: ciNitTrimmed || '', // Enviar vacío para que el backend genere uno único
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

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 200}
        extraHeight={Platform.OS === 'ios' ? 100 : 200}
        enableResetScrollToCoords={false}
        keyboardOpeningTime={0}
      >
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
                CI/NIT <Text className="text-xs font-poppins-regular">(opcional, mín. 8 dígitos)</Text>
              </Text>
              <TextInput
                className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                placeholder="Ej: 12345678 (mínimo 8)"
                placeholderTextColor="#8B5A3C80"
                value={clienteCiNit}
                onChangeText={handleCiNitChange}
                keyboardType="default"
                maxLength={20}
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
                  {tipoVenta === 'credito' && (
                    <Text className="text-red-600 font-poppins-semibold"> (NO válido para crédito)</Text>
                  )}
                </Text>
              </View>
            ) : (
              <View className="mt-3 flex-row items-center">
                <Ionicons name="information-circle" size={16} color="#8B5A3C" />
                <Text className="text-[#8B5A3C] font-poppins-regular text-sm ml-1">
                  Sin cliente = "Cliente General"
                  {tipoVenta === 'credito' && (
                    <Text className="text-red-600 font-poppins-semibold"> (NO válido para crédito)</Text>
                  )}
                </Text>
              </View>
            )}
            
            {/* Aviso para crédito */}
            {tipoVenta === 'credito' && !clienteId && (
              <View className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3 flex-row items-start">
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text className="flex-1 text-red-600 font-poppins-regular text-xs ml-2">
                  <Text className="font-poppins-semibold">Atención:</Text> Las ventas a crédito requieren seleccionar un cliente existente de la lista.
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

          {/* Sección de Pago y Cambio - Ahora DENTRO del scroll */}
          {carrito.length > 0 && tipoVenta === 'contado' && (
            <View className="mt-4 bg-white rounded-xl p-4 border border-[#E5E5E5]">
              {/* Total a pagar */}
              <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-[#E5E5E5]">
                <Text className="text-base font-poppins-bold text-[#402612]">Total a pagar:</Text>
                <Text className="text-xl font-poppins-black text-[#402612]">Bs. {total.toFixed(2)}</Text>
              </View>
              
              {/* Input de pago */}
              <View className="flex-row items-center gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-poppins-semibold text-[#8B5A3C] mb-1">¿Con cuánto paga?</Text>
                  <View className="flex-row items-center bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-3">
                    <Text className="text-[#8B5A3C] font-poppins-semibold mr-1">Bs.</Text>
                    <TextInput
                      value={montoPago}
                      onChangeText={(text) => {
                        const validated = validateDecimalInput(text, montoPago);
                        if (validated !== null) setMontoPago(validated);
                      }}
                      placeholder="0.00"
                      placeholderTextColor="#8B5A3C80"
                      keyboardType="decimal-pad"
                      className="flex-1 py-3 font-poppins-regular text-[#402612]"
                    />
                  </View>
                </View>
                
                <View className="flex-1">
                  <Text className="text-xs font-poppins-semibold text-[#8B5A3C] mb-1">Cambio</Text>
                  <View className={`bg-[#F6EBD7] border rounded-xl px-3 py-3 ${cambio >= 0 ? 'border-[#00D98E]' : 'border-red-400'}`}>
                    <Text className={`font-poppins-bold text-center ${cambio >= 0 ? 'text-[#00D98E]' : 'text-red-500'}`}>
                      Bs. {cambio >= 0 ? cambio.toFixed(2) : '0.00'}
                    </Text>
                    {cambio < 0 && parseFloat(montoPago) > 0 && (
                      <Text className="text-xs text-red-400 text-center font-poppins-regular">
                        Falta Bs. {Math.abs(cambio).toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Espaciado adicional para el botón fijo */}
          {carrito.length > 0 && (
            <View style={{ height: 80 + insets.bottom }} />
          )}
      </KeyboardAwareScrollView>

      {/* Botón Finalizar - Fijo abajo */}
      {carrito.length > 0 && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View 
            className="absolute bottom-0 left-0 right-0 px-4 pt-2 bg-[#F6EBD7] border-t border-[#E5E5E5]"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
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
        </KeyboardAvoidingView>
      )}

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
