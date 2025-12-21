import { useInventario } from '@/contexts/InventarioContext';
import { OpcionVariante, Producto, ProductoUnidad } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

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
}

export default function ProductSelector({
  carrito,
  onAddToCart,
  onRemoveFromCart,
  title = "Agregar Producto",
  buttonText = "Seleccionar Producto",
}: ProductSelectorProps) {
  const { productos } = useInventario();

  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [selectedVariante, setSelectedVariante] = useState<OpcionVariante | null>(null);
  const [selectedUnidad, setSelectedUnidad] = useState<ProductoUnidad | null>(null);
  const [cantidad, setCantidad] = useState('1');
  const [precioEditado, setPrecioEditado] = useState('');

  // Actualizar precio cuando cambia la unidad seleccionada
  useEffect(() => {
    if (selectedUnidad) {
      setPrecioEditado(selectedUnidad.precio.toString());
    }
  }, [selectedUnidad]);

  const handleSelectProduct = (producto: Producto) => {
    setSelectedProduct(producto);
    setShowProductSelector(false);

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

  const handleSelectVariante = (opcionVariante: OpcionVariante) => {
    setSelectedVariante(opcionVariante);
    setShowVariantSelector(false);
    
    // Seleccionar la primera unidad de medida automáticamente
    if (selectedProduct?.unidades && selectedProduct.unidades.length > 0) {
      setSelectedUnidad(selectedProduct.unidades[0]);
      setPrecioEditado(selectedProduct.unidades[0].precio.toString());
      setCantidad('1');
    }
  };

  const handleChangeUnidad = (unidadId: number) => {
    if (selectedProduct?.unidades) {
      const unidad = selectedProduct.unidades.find(u => u.idproductounidad === unidadId);
      if (unidad) {
        setSelectedUnidad(unidad);
        setPrecioEditado(unidad.precio.toString());
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
            {(selectedVariante?.imagenvariante || selectedProduct.imagen || selectedProduct.imagenproducto) && (
              <Image
                source={{ uri: selectedVariante?.imagenvariante || selectedProduct.imagen || selectedProduct.imagenproducto }}
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

          {/* Selector de Unidad de Medida */}
          {selectedProduct.unidades && selectedProduct.unidades.length > 1 && (
            <View className="mb-3">
              <Text className="text-sm font-poppins-semibold text-[#402612] mb-1">
                Unidad de Medida
              </Text>
              <View className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-lg overflow-hidden">
                <Picker
                  selectedValue={selectedUnidad.idproductounidad}
                  onValueChange={(value) => handleChangeUnidad(value)}
                  style={{ height: 50, color: '#402612' }}
                >
                  {selectedProduct.unidades.map((u) => (
                    <Picker.Item
                      key={u.idproductounidad}
                      label={`${u.unidad?.nombre} (${u.unidad?.abreviatura}) - Bs. ${u.precio.toFixed(2)}`}
                      value={u.idproductounidad}
                    />
                  ))}
                </Picker>
              </View>
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
                  // Solo permitir números positivos y decimales
                  if (text === '' || (/^\d*\.?\d*$/.test(text) && parseFloat(text || '0') >= 0)) {
                    setPrecioEditado(text);
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
                keyboardType="numeric"
                value={cantidad}
                onChangeText={(text) => {
                  // Solo permitir números positivos
                  if (text === '' || (/^\d*\.?\d*$/.test(text) && parseFloat(text || '0') >= 0)) {
                    setCantidad(text);
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
              {(item.producto.imagen || item.producto.imagenproducto) && (
                <Image
                  source={{ uri: item.producto.imagen || item.producto.imagenproducto }}
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

          {/* Total */}
          <View className="bg-[#402612] rounded-xl p-4 mt-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-poppins-bold text-[#F6EBD7]">Total:</Text>
              <Text className="text-2xl font-poppins-black text-[#F6EBD7]">
                Bs. {calcularTotal().toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Modal Selector de Productos */}
      <Modal
        visible={showProductSelector}
        animationType="slide"
        transparent
        onRequestClose={() => setShowProductSelector(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-[#F6EBD7] rounded-t-3xl max-h-[80%]">
            <View className="bg-[#402612] rounded-t-3xl px-4 py-4 flex-row items-center justify-between">
              <Text className="text-xl font-poppins-bold text-[#F6EBD7]">
                Seleccionar Producto
              </Text>
              <TouchableOpacity onPress={() => setShowProductSelector(false)}>
                <Ionicons name="close" size={28} color="#F6EBD7" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={productos}
              keyExtractor={(item) => item.idproducto.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectProduct(item)}
                  className="bg-white mx-4 my-2 rounded-xl p-3 flex-row items-center border border-[#E5E5E5]"
                >
                  {(item.imagen || item.imagenproducto) && (
                    <Image
                      source={{ uri: item.imagen || item.imagenproducto }}
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
      </Modal>

      {/* Modal Selector de Variantes */}
      <Modal
        visible={showVariantSelector}
        animationType="slide"
        transparent
        onRequestClose={() => setShowVariantSelector(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-[#F6EBD7] rounded-t-3xl max-h-[60%]">
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
                    ) : (selectedProduct.imagen || selectedProduct.imagenproducto) && (
                      <Image
                        source={{ uri: selectedProduct.imagen || selectedProduct.imagenproducto }}
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