import { ComprobanteModal, ConfirmModal } from '@/components/modales';
import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import {
  ClienteAutocomplete,
  CiNitInput,
  ClienteDataCard,
  ClienteStatusVenta,
  ClienteAlertBanner,
  TipoVentaSelector,
  TipoVentaModal,
  CreditoBlockedModal,
  PagoSection,
  FormHeader
} from '@/components/forms';
import ProductSelector, { ItemCarrito } from '@/components/venta/ProductSelector';
import { useCobros } from '@/contexts/CobrosContext';
import { useVentas } from '@/contexts/VentasContext';
import { clienteService } from '@/services/clienteService';
import { validateDecimalInput } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
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
    setClienteId(null); // Reset cliente seleccionado cuando se modifica el nombre
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
    
    // Si cambia el CI/NIT y había un cliente seleccionado, resetear selección
    // a menos que el nuevo CI/NIT coincida exactamente con el cliente seleccionado
    if (clienteId) {
      const clienteActual = clientes.find(c => c.idcliente === clienteId);
      if (clienteActual && clienteActual.ci_nit !== text) {
        setClienteId(null); // Resetear selección si el CI/NIT no coincide
      }
    }
    
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

    // Validar: Si se llenó CI/NIT pero no hay nombre, no permitir continuar
    if (clienteCiNit.trim() && !clienteNombre.trim()) {
      showError('Datos Incompletos', 'Si proporcionas un CI/NIT, también debes ingresar el nombre del cliente.');
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
      let nombreClienteFinal = clienteNombre;
      let clienteNuevoData = null;

      // Caso 1: Cliente ya seleccionado del autocompletado
      if (idClienteFinal) {
        console.log('[NuevaVenta] Usando cliente ya seleccionado ID:', idClienteFinal);
      }
      // Caso 2: Si hay nombre pero no cliente seleccionado, preparar datos para crear nuevo cliente
      else if (clienteNombre.trim()) {
        // Para crear un nuevo cliente, DEBE proporcionar CI/NIT válido
        const ciNitTrimmed = clienteCiNit.trim();
        if (!ciNitTrimmed || ciNitTrimmed.length < 8) {
          showError('CI/NIT Requerido', 'Para crear un nuevo cliente debes proporcionar un CI/NIT válido (mínimo 8 dígitos). Si no conoces los datos del cliente, deja los campos vacíos para usar "Sin Nombre".');
          setProcesando(false);
          return;
        }
        
        console.log('[NuevaVenta] Preparando datos para crear nuevo cliente en backend:', { nombre: clienteNombre, ci_nit: ciNitTrimmed });
        nombreClienteFinal = clienteNombre.trim();
        clienteNuevoData = {
          nombre: clienteNombre.trim(),
          ci_nit: ciNitTrimmed,
        };
      }
      // Caso 3: Sin nombre ni CI/NIT → usar cliente genérico "Sin Nombre"
      else {
        console.log('[NuevaVenta] Campos vacíos, buscando cliente "Sin Nombre"...');
        const genericoRes = await clienteService.getGenerico();
        console.log('[NuevaVenta] Respuesta cliente genérico:', genericoRes);
        if (genericoRes.success && genericoRes.data) {
          idClienteFinal = genericoRes.data.idcliente;
          nombreClienteFinal = genericoRes.data.nombrecliente;
          console.log('[NuevaVenta] Usando cliente genérico ID:', idClienteFinal, 'Nombre:', nombreClienteFinal);
        } else {
          showError('Error', 'No se encontró cliente genérico "Sin Nombre". Contacta al administrador.');
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

      // Construir datos de venta con transacción atómica
      const ventaData: any = {
        total,
        tipo_pago: tipoVenta,
        fecha: new Date().toISOString(), // Fecha local del móvil
        detalle,
      };

      // Si hay cliente existente, usar clienteid
      if (idClienteFinal) {
        ventaData.clienteid = idClienteFinal;
      }
      // Si hay datos de cliente nuevo, enviarlos para crear en backend
      else if (clienteNuevoData) {
        ventaData.cliente_nuevo = clienteNuevoData;
      }

      console.log('[NuevaVenta] Datos de venta a enviar (transacción atómica):', JSON.stringify(ventaData, null, 2));
      const result = await crearVenta(ventaData);
      console.log('[NuevaVenta] Resultado de crearVenta:', result);
      
      if (result) {
        console.log('[NuevaVenta] === VENTA EXITOSA ===');
        
        // Generar folio para venta en formato V-000001 si no viene del backend
        const folioVenta = result.folio || `V-${result.idventa?.toString().padStart(6, '0')}`;
        
        // Preparar datos para el comprobante
        setVentaRealizada({
          folio: folioVenta,
          fecha: new Date(), // Usar fecha actual del móvil
          cliente: nombreClienteFinal || result.cliente?.nombrecliente || 'Sin Nombre',
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
        <FormHeader title="Nueva Venta" onBack={() => router.back()} />
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
        <ClienteDataCard>
          <ClienteAutocomplete
            clienteId={clienteId}
            clienteNombre={clienteNombre}
            clienteSugerencias={clienteSugerencias}
            showSugerencias={showSugerencias}
            onChangeText={handleClienteChange}
            onSelectCliente={selectCliente}
            onFocus={() => clienteNombre.length > 1 && setShowSugerencias(true)}
            helperText={!clienteId ? "(nuevo cliente si no existe)" : undefined}
          />

          <CiNitInput
            value={clienteCiNit}
            onChangeText={handleCiNitChange}
            isValid={clienteId !== null} // Verde si hay cliente seleccionado
          />

          <ClienteStatusVenta
            clienteId={clienteId}
            clienteNombre={clienteNombre}
            tipoVenta={tipoVenta}
          />
          
          <ClienteAlertBanner
            type="credito"
            visible={tipoVenta === 'credito' && !clienteId}
          />
        </ClienteDataCard>

        {/* Tipo de Venta */}
        <TipoVentaSelector
          tipoVenta={tipoVenta}
          onPress={() => setShowTipoVentaModal(true)}
        />

        {/* Componente de Selección de Productos */}
        <ProductSelector
          carrito={carrito}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
        />

        {/* Sección de Pago y Cambio */}
        <PagoSection
          total={total}
          montoPago={montoPago}
          onMontoPagoChange={(text) => {
            const validated = validateDecimalInput(text, montoPago);
            if (validated !== null) setMontoPago(validated);
          }}
          cambio={cambio}
          visible={carrito.length > 0 && tipoVenta === 'contado'}
        />

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
          cliente: clienteNombre || 'Sin Nombre',
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
      <TipoVentaModal
        visible={showTipoVentaModal}
        tipoVenta={tipoVenta}
        onSelect={(tipo) => {
          setTipoVenta(tipo);
          setShowTipoVentaModal(false);
        }}
        onClose={() => setShowTipoVentaModal(false)}
      />

      {/* Modal de Crédito Bloqueado */}
      <CreditoBlockedModal
        visible={showCreditoBlockedModal}
        deudaInfo={deudaInfo}
        onCambiarContado={() => {
          setShowCreditoBlockedModal(false);
          setTipoVenta('contado');
        }}
        onClose={() => setShowCreditoBlockedModal(false)}
      />

      {/* Custom Alert Component */}
      <AlertComponent />
    </ScreenContainer>
  );
}
