import { ComprobanteModal, ConfirmModal } from '@/components/modales';
import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import { 
  ClienteAutocomplete, 
  CiNitInput, 
  TelefonoInput, 
  ClienteDataCard,
  ClienteStatusCobro,
  ClienteAlertBanner,
  CobroInfoSection,
  FormHeader
} from '@/components/forms';
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
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


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

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleFinalizarCobro = () => {
    if (carrito.length === 0) {
      showError('Error', 'Agrega productos al cobro');
      return;
    }
    
    // Los cobros requieren un cliente EXISTENTE seleccionado
    if (!clienteId) {
      showError('Cliente Requerido', 'Para registrar un cobro debes seleccionar un cliente existente. No se puede crear un nuevo cliente directamente desde aquí.');
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
        // Validar CI/NIT si fue proporcionado
        const ciNitTrimmed = clienteCiNit.trim();
        if (ciNitTrimmed && ciNitTrimmed.length < 8) {
          showError('CI/NIT Inválido', 'El CI/NIT debe tener al menos 8 dígitos');
          setProcesando(false);
          return;
        }
        
        console.log('[CobroForm] Creando nuevo cliente:', { nombre: clienteNombre, ci_nit: ciNitTrimmed });
        const nuevoCliente = await clienteService.create({
          nombre: clienteNombre.trim(),
          ci_nit: ciNitTrimmed || '', // Enviar vacío para que el backend genere uno único
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
        
        // Generar folio para cobro en formato C-000001
        const folioCobro = `C-${result.idcobro?.toString().padStart(6, '0')}`;
        
        setCobroRealizado({
          ...result,
          folio: folioCobro,
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
      {/* Header */}
      <SafeHeader>
        <FormHeader title="Nuevo Cobro" onBack={() => router.back()} />
      </SafeHeader>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 180}
        extraHeight={Platform.OS === 'ios' ? 100 : 180}
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
          />

          <TelefonoInput
            value={telefono}
            onChangeText={setTelefono}
          />

          <ClienteStatusCobro
            clienteId={clienteId}
            clienteNombre={clienteNombre}
          />
          
          <ClienteAlertBanner
            type="cobro"
            visible={!clienteId}
          />
        </ClienteDataCard>

        {/* Info adicional del cobro */}
        <CobroInfoSection
          fechaVencimiento={fechaVencimiento}
          onFechaChange={setFechaVencimiento}
          notas={notas}
          onNotasChange={setNotas}
        />

        {/* Componente de Selección de Productos */}
        <ProductSelector
          carrito={carrito}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          showInternalTotal={false}
        />
      </KeyboardAwareScrollView>


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