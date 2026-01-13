import { useInventario } from '@/contexts/InventarioContext';
import { OpcionVariante, Producto, ProductoUnidad } from '@/types';
import { validateDecimalInput, validateQuantityInput } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useMemo } from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ItemCarrito {
  idproducto: number;
  producto: Producto;
  idproductounidad: number;
  productounidad: ProductoUnidad;
  idopcionvariante?: number;
  opcionvariante?: OpcionVariante;
  cantidad: number;
  precio: number;
  precioUnitario: number;
  subtotal: number;
}

interface ProductSelectorProps {
  carrito: ItemCarrito[];
  onAddToCart: (item: ItemCarrito) => void;
  onRemoveFromCart: (index: number) => void;
  title?: string;
  buttonText?: string;
  showInternalTotal?: boolean; // Para controlar si se muestra el total interno
}

export default function ProductSelector({
  carrito,
  onAddToCart,
  onRemoveFromCart,
  title = "Agregar Producto",
  buttonText = "Seleccionar Producto",
  showInternalTotal = true, // Por defecto mostrar el total
}: ProductSelectorProps) {
  const { productos } = useInventario();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);

  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [showUnidadModal, setShowUnidadModal] = useState(false); // Modal para unidades
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [selectedVariante, setSelectedVariante] = useState<OpcionVariante | null>(null);
  const [selectedUnidad, setSelectedUnidad] = useState<ProductoUnidad | null>(null);
  const [cantidad, setCantidad] = useState('1');
  const [precioEditado, setPrecioEditado] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Estado para búsqueda de productos

  // Filtrar productos según búsqueda
  const productosFiltrados = useMemo(() => {
    if (!searchQuery.trim()) return productos;
    const query = searchQuery.toLowerCase().trim();
    return productos.filter(p => 
      p.nombreproducto.toLowerCase().includes(query) ||
      p.categoria?.nombrecategoria?.toLowerCase().includes(query)
    );
  }, [productos, searchQuery]);

  // Actualizar precio cuando cambia la unidad seleccionada
  useEffect(() => {
    if (selectedUnidad) {
      setPrecioEditado(selectedUnidad.precio.toString());
    }
  }, [selectedUnidad]);

  const handleSelectProduct = (producto: Producto) => {
    setSelectedProduct(producto);
    setShowProductSelector(false);
    setSearchQuery(''); // Limpiar búsqueda al seleccionar

    // Verificar si tiene variantes
    const tieneVariantes = producto.variantes && producto.variantes.length > 0 && 
                           producto.variantes.some(v => v.opciones && v.opciones.length > 0);

    if (tieneVariantes) {
      // Si tiene variantes, mostrar selector de variantes
      setShowVariantSelector(true);
    } else {
      // Si no tiene variantes, seleccionar la primera unidad automáticamente
      if (producto.unidades && producto.unidades.length > 0) {
        setSelectedUnidad(producto.unidades[0]);
        setPrecioEditado(producto.unidades[0].precio.toString());
        setCantidad('1');
      }
    }
  };

  // Seleccionar producto sin variante (producto base)
  const handleSelectProductoBase = () => {
    if (!selectedProduct) return;
    
    setSelectedVariante(null); // Sin variante
    setShowVariantSelector(false);
    
    // Seleccionar la primera unidad de medida automáticamente
    if (selectedProduct.unidades && selectedProduct.unidades.length > 0) {
      setSelectedUnidad(selectedProduct.unidades[0]);
      setPrecioEditado(selectedProduct.unidades[0].precio.toString());
      setCantidad('1');
    }
  };

  const handleSelectVariante = async (opcionVariante: OpcionVariante) => {
    console.log('[ProductSelector] Variante seleccionada:', opcionVariante);
    console.log('[ProductSelector] Precios de variante:', opcionVariante.precios);
    
    setSelectedVariante(opcionVariante);
    setShowVariantSelector(false);
    
    // Seleccionar la primera unidad de medida automáticamente
    if (selectedProduct?.unidades && selectedProduct.unidades.length > 0) {
      setSelectedUnidad(selectedProduct.unidades[0]);
      console.log('[ProductSelector] Primera unidad:', selectedProduct.unidades[0]);
      
      // Buscar precio específico de esta variante si existe en los datos del producto
      let precioEncontrado = false;
      
      if (opcionVariante.precios && opcionVariante.precios.length > 0 && selectedProduct.unidades) {
        console.log('[ProductSelector] Buscando precio para productounidadid:', selectedProduct.unidades[0].idproductounidad);
        const precioVariante = opcionVariante.precios.find(
          p => p.productounidadid === selectedProduct.unidades![0].idproductounidad
        );
        
        console.log('[ProductSelector] Precio encontrado:', precioVariante);
        
        if (precioVariante) {
          setPrecioEditado(precioVariante.precio.toString());
          precioEncontrado = true;
        }
      }
      
      // Si no encontró precio de variante, usar precio base
      if (!precioEncontrado) {
        console.log('[ProductSelector] Usando precio base:', selectedProduct.unidades[0].precio);
        setPrecioEditado(selectedProduct.unidades[0].precio.toString());
      }
      
      setCantidad('1');
    }
  };

  const handleChangeUnidad = async (unidadId: number) => {
    if (selectedProduct?.unidades) {
      const unidad = selectedProduct.unidades.find(u => u.idproductounidad === unidadId);
      if (unidad) {
        setSelectedUnidad(unidad);
        
        // Si hay variante seleccionada, buscar su precio específico para esta unidad
        let precioEncontrado = false;
        
        if (selectedVariante?.precios && selectedVariante.precios.length > 0) {
          const precioVariante = selectedVariante.precios.find(
            p => p.productounidadid === unidadId
          );
          
          if (precioVariante) {
            setPrecioEditado(precioVariante.precio.toString());
            precioEncontrado = true;
          }
        }
        
        // Si no encontró precio de variante, usar precio base
        if (!precioEncontrado) {
          setPrecioEditado(unidad.precio.toString());
        }
      }
    }
  };

  const agregarAlCarrito = () => {
    if (!selectedProduct || !selectedUnidad) return;

    const cantidadNum = parseFloat(cantidad);
    const precioNum = parseFloat(precioEditado);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      return;
    }
    if (isNaN(precioNum) || precioNum <= 0) {
      return;
    }

    const nuevoItem: ItemCarrito = {
      idproducto: selectedProduct.idproducto,
      producto: selectedProduct,
      idproductounidad: selectedUnidad.idproductounidad,
      productounidad: selectedUnidad,
      idopcionvariante: selectedVariante?.idopcionvariante,
      opcionvariante: selectedVariante || undefined,
      cantidad: cantidadNum,
      precio: precioNum,
      precioUnitario: precioNum,
      subtotal: cantidadNum * precioNum,
    };

    onAddToCart(nuevoItem);
    setSelectedProduct(null);
    setSelectedVariante(null);
    setSelectedUnidad(null);
    setCantidad('1');
    setPrecioEditado('');
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + item.subtotal, 0);
  };

  // Obtener el precio correcto para una unidad (considerando la variante seleccionada)
  const getPrecioParaUnidad = (unidad: ProductoUnidad): number => {
    if (selectedVariante?.precios && selectedVariante.precios.length > 0) {
      const precioVariante = selectedVariante.precios.find(
        p => p.productounidadid === unidad.idproductounidad
      );
      if (precioVariante) {
        return precioVariante.precio;
      }
    }
    return unidad.precio;
  };

  return (
    <>
      {/* Selector de Producto */}
      <View className="mb-4">
        <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
          {title}
        </Text>
        <TouchableOpacity
          onPress={() => setShowProductSelector(true)}
          className="bg-[#402612] rounded-xl px-4 py-3 flex-row items-center justify-center"
        >
          <Ionicons name="add-circle-outline" size={20} color="#F6EBD7" />
          <Text className="text-[#F6EBD7] font-poppins-semibold ml-2">
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Producto Seleccionado */}
      {selectedProduct && selectedUnidad && (
        <View className="bg-white rounded-xl p-4 mb-4 border border-[#8B5A3C]">
          <View className="flex-row items-center mb-3">
            {(selectedVariante?.imagenvariante || selectedProduct.imagen) && (
              <Image
                source={{ uri: selectedVariante?.imagenvariante || selectedProduct.imagen }}
                className="w-16 h-16 rounded-lg mr-3"
              />
            )}
            <View className="flex-1">
              <Text className="text-base font-poppins-semibold text-[#402612]">
                {selectedProduct.nombreproducto}
              </Text>
              {selectedVariante && (
                <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
                  {selectedVariante.nombreopcionvariante}
                </Text>
              )}
              <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
                {selectedUnidad.unidad?.nombre}
              </Text>
            </View>
          </View>

          {/* Selector de Unidad de Medida - Modal estilizado */}
          {selectedProduct.unidades && selectedProduct.unidades.length > 0 && (
            <View className="mb-3">
              <Text className="text-sm font-poppins-semibold text-[#402612] mb-1">
                Unidad de Medida
              </Text>
              <TouchableOpacity
                onPress={() => setShowUnidadModal(true)}
                className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 flex-row justify-between items-center"
              >
                <Text className="text-base font-poppins-semibold text-[#402612]">
                  {selectedUnidad.unidad?.nombre} ({selectedUnidad.unidad?.abreviatura}) - Bs. {getPrecioParaUnidad(selectedUnidad).toFixed(2)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#8B5A3C" />
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-1">
              <Text className="text-sm font-poppins-semibold text-[#402612] mb-1">
                Precio (Bs)
              </Text>
              <TextInput
                className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-lg px-3 py-2 text-[#402612] font-poppins-regular"
                keyboardType="decimal-pad"
                value={precioEditado}
                onChangeText={(text) => {
                  const validated = validateDecimalInput(text);
                  if (validated !== null) {
                    setPrecioEditado(validated);
                  }
                }}
                placeholder="0.00"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-poppins-semibold text-[#402612] mb-1">
                Cantidad
              </Text>
              <TextInput
                className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-lg px-3 py-2 text-[#402612] font-poppins-regular"
                keyboardType="decimal-pad"
                value={cantidad}
                onChangeText={(text) => {
                  const validated = validateQuantityInput(text);
                  if (validated !== null) {
                    setCantidad(validated);
                  }
                }}
              />
            </View>
            <TouchableOpacity
              onPress={agregarAlCarrito}
              className="bg-[#402612] rounded-lg px-6 py-3 mt-5"
            >
              <Text className="text-[#F6EBD7] font-poppins-semibold">Agregar</Text>
            </TouchableOpacity>
          </View>

          {/* Subtotal Preview */}
          {precioEditado && cantidad && (
            <View className="mt-3 pt-3 border-t border-[#E5E5E5]">
              <Text className="text-sm font-poppins-regular text-[#8B5A3C] text-right">
                Subtotal: <Text className="font-poppins-bold text-[#402612]">
                  Bs. {(parseFloat(precioEditado || '0') * parseFloat(cantidad || '0')).toFixed(2)}
                </Text>
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Carrito */}
      {carrito.length > 0 && (
        <View className="mb-4">
          <Text className="text-lg font-poppins-bold text-[#402612] mb-3">
            Productos Seleccionados
          </Text>
          {carrito.map((item, index) => (
            <View
              key={index}
              className="bg-white rounded-xl p-3 mb-2 flex-row items-center border border-[#E5E5E5]"
            >
              {(item.opcionvariante?.imagenvariante || item.producto.imagen) && (
                <Image
                  source={{ uri: item.opcionvariante?.imagenvariante || item.producto.imagen }}
                  className="w-14 h-14 rounded-lg mr-3"
                />
              )}
              <View className="flex-1">
                <Text className="text-sm font-poppins-semibold text-[#402612]">
                  {item.producto.nombreproducto}
                </Text>
                {item.opcionvariante && (
                  <Text className="text-xs font-poppins-regular text-[#8B5A3C]">
                    {item.opcionvariante.nombreopcionvariante}
                  </Text>
                )}
                <Text className="text-xs font-poppins-regular text-[#8B5A3C]">
                  {item.productounidad.unidad?.nombre} x {item.cantidad}
                </Text>
                <View className="flex-row items-center justify-between mt-1">
                  <Text className="text-xs font-poppins-regular text-[#8B5A3C]">
                    P.U: Bs. {item.precioUnitario.toFixed(2)}
                  </Text>
                  <Text className="text-sm font-poppins-bold text-[#402612]">
                    Total: Bs. {item.subtotal.toFixed(2)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => onRemoveFromCart(index)}
                className="ml-2"
              >
                <Ionicons name="trash-outline" size={20} color="#D32F2F" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Total - Solo se muestra si showInternalTotal es true */}
          {showInternalTotal && (
            <View className="bg-[#402612] rounded-xl p-4 mt-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-poppins-bold text-[#F6EBD7]">Total:</Text>
                <Text className="text-2xl font-poppins-black text-[#F6EBD7]">
                  Bs. {calcularTotal().toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Modal Selector de Unidad de Medida */}
      <Modal
        visible={showUnidadModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowUnidadModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm max-h-[60%]">
            <View className="bg-[#402612] rounded-t-2xl px-4 py-4 flex-row items-center justify-between">
              <Text className="text-lg font-poppins-bold text-[#F6EBD7]">
                Seleccionar Unidad
              </Text>
              <TouchableOpacity onPress={() => setShowUnidadModal(false)}>
                <Ionicons name="close" size={24} color="#F6EBD7" />
              </TouchableOpacity>
            </View>
            <ScrollView className="max-h-80">
              {selectedProduct?.unidades?.map((unidad) => {
                const precioMostrar = getPrecioParaUnidad(unidad);
                const isSelected = selectedUnidad?.idproductounidad === unidad.idproductounidad;
                
                return (
                  <TouchableOpacity
                    key={unidad.idproductounidad}
                    onPress={() => {
                      handleChangeUnidad(unidad.idproductounidad);
                      setShowUnidadModal(false);
                    }}
                    className={`px-4 py-4 border-b border-gray-200 flex-row justify-between items-center ${
                      isSelected ? 'bg-[#402612]/10' : ''
                    }`}
                  >
                    <View className="flex-1">
                      <Text className={`text-base font-poppins-semibold ${
                        isSelected ? 'text-[#402612]' : 'text-[#3d2b1f]'
                      }`}>
                        {unidad.unidad?.nombre} ({unidad.unidad?.abreviatura})
                      </Text>
                      <Text className="text-lg font-poppins-bold text-[#8B5A3C]">
                        Bs. {precioMostrar.toFixed(2)}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color="#402612" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Selector de Productos */}
      <Modal
        visible={showProductSelector}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowProductSelector(false);
          setSearchQuery('');
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={0}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View 
              className="bg-[#F6EBD7] rounded-t-3xl"
              style={{ 
                paddingBottom: bottomPadding,
                maxHeight: '85%',
                minHeight: '50%'
              }}
            >
              <View className="bg-[#402612] rounded-t-3xl px-4 py-4 flex-row items-center justify-between">
                <Text className="text-xl font-poppins-bold text-[#F6EBD7]">
                  Seleccionar Producto
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowProductSelector(false);
                  setSearchQuery('');
                }}>
                  <Ionicons name="close" size={28} color="#F6EBD7" />
                </TouchableOpacity>
              </View>

              {/* Buscador de productos */}
              <View className="px-4 py-3 bg-white border-b border-gray-200">
                <View className="flex-row items-center bg-[#F6EBD7] rounded-xl px-4 py-2">
                  <Ionicons name="search" size={20} color="#8B5A3C" />
                  <TextInput
                    className="flex-1 ml-2 text-base font-poppins-regular text-[#402612]"
                    placeholder="Buscar producto..."
                    placeholderTextColor="#8B5A3C"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={20} color="#8B5A3C" />
                    </TouchableOpacity>
                  )}
                </View>
                {searchQuery.length > 0 && (
                  <Text className="text-xs font-poppins-regular text-[#8B5A3C] mt-2">
                    {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
                  </Text>
                )}
              </View>

              <FlatList
                data={productosFiltrados}
                keyExtractor={(item) => item.idproducto.toString()}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectProduct(item)}
                    className="bg-white mx-4 my-2 rounded-xl p-3 flex-row items-center border border-[#E5E5E5]"
                  >
                    {item.imagen && (
                      <Image
                        source={{ uri: item.imagen }}
                        className="w-16 h-16 rounded-lg mr-3"
                      />
                    )}
                    <View className="flex-1">
                      <Text className="text-base font-poppins-semibold text-[#402612]">
                        {item.nombreproducto}
                      </Text>
                      <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
                        {item.categoria?.nombrecategoria}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#8B5A3C" />
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Selector de Variantes */}
      <Modal
        visible={showVariantSelector}
        animationType="slide"
        transparent
        onRequestClose={() => setShowVariantSelector(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View 
            className="bg-[#F6EBD7] rounded-t-3xl max-h-[60%]"
            style={{ paddingBottom: bottomPadding }}
          >
            <View className="bg-[#402612] rounded-t-3xl px-4 py-4 flex-row items-center justify-between">
              <Text className="text-xl font-poppins-bold text-[#F6EBD7]">
                Seleccionar Variante
              </Text>
              <TouchableOpacity onPress={() => setShowVariantSelector(false)}>
                <Ionicons name="close" size={28} color="#F6EBD7" />
              </TouchableOpacity>
            </View>

            {selectedProduct?.variantes && selectedProduct.variantes.length > 0 && (
              <FlatList
                ListHeaderComponent={() => (
                  /* Opción para seleccionar producto sin variante */
                  <TouchableOpacity
                    onPress={handleSelectProductoBase}
                    className="bg-[#402612]/10 mx-4 my-2 rounded-xl p-4 flex-row items-center justify-between border-2 border-dashed border-[#402612]"
                  >
                    {selectedProduct.imagen && (
                      <Image
                        source={{ uri: selectedProduct.imagen }}
                        className="w-12 h-12 rounded-lg mr-3"
                      />
                    )}
                    <View className="flex-1">
                      <Text className="text-base font-poppins-bold text-[#402612]">
                        Producto Base
                      </Text>
                      <Text className="text-xs font-poppins-regular text-[#8B5A3C]">
                        {selectedProduct.nombreproducto} - Sin variante
                      </Text>
                      {selectedProduct.unidades && selectedProduct.unidades[0] && (
                        <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mt-1">
                          Bs. {selectedProduct.unidades[0].precio.toFixed(2)}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#402612" />
                  </TouchableOpacity>
                )}
                data={selectedProduct.variantes.flatMap(v => v.opciones || [])}
                keyExtractor={(item) => item.idopcionvariante.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectVariante(item)}
                    className="bg-white mx-4 my-2 rounded-xl p-4 flex-row items-center justify-between border border-[#E5E5E5]"
                  >
                    {item.imagenvariante ? (
                      <Image
                        source={{ uri: item.imagenvariante }}
                        className="w-12 h-12 rounded-lg mr-3"
                      />
                    ) : selectedProduct.imagen && (
                      <Image
                        source={{ uri: selectedProduct.imagen }}
                        className="w-12 h-12 rounded-lg mr-3"
                      />
                    )}
                    <View className="flex-1">
                      <Text className="text-base font-poppins-semibold text-[#402612]">
                        {item.nombreopcionvariante}
                      </Text>
                      <Text className="text-xs font-poppins-regular text-[#8B5A3C]">
                        {selectedProduct.nombreproducto}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#8B5A3C" />
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}