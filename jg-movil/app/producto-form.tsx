import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import {
  ProductoFormHeader,
  ProductImagePicker,
  ImageSourceModal,
  CategorySelector,
  CategoryModal,
  ProductTextInput,
  UnitPriceRow,
  UnitModal,
  VariantesToggle,
  SaveButton,
  VariantesSection
} from '@/components/productos';
import { useInventario } from '@/contexts/InventarioContext';
import { validateDecimalInput } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { productoService } from '@/services/productoService';


interface UnidadPrecio {
  unidadid: number;
  precio: string;
}

interface OpcionVariante {
  nombre: string;
  imagen: string;
  precios?: PrecioUnidadVariante[]; // Cada opción tiene sus propios precios
}

interface PrecioUnidadVariante {
  unidadid: number;
  precio: string;
}

interface Variante {
  nombre: string;
  opciones: OpcionVariante[];
}

export default function ProductoFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { productos, categorias, unidades: unidadesMedida, addProducto, updateProducto, getProductoById, isLoading } = useInventario();
  const { showError, showWarning, showSuccess, AlertComponent } = useCustomAlert();
  const isEditing = !!params.id;

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState(1);
  const [imagen, setImagen] = useState('');
  const [imagenOriginal, setImagenOriginal] = useState(''); // Para saber si la imagen cambió
  const [unidades, setUnidades] = useState<UnidadPrecio[]>([{ unidadid: 1, precio: '' }]);
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [showVariantes, setShowVariantes] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showUnidadModal, setShowUnidadModal] = useState(false);
  const [unidadModalIndex, setUnidadModalIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const cargarProducto = async () => {
      if (isEditing) {
        // Siempre recargar el producto desde la API para obtener datos actualizados
        const producto = await getProductoById(Number(params.id));
        
        if (producto) {
          setNombre(producto.nombreproducto);
          setDescripcion(producto.descripcion || '');
          setCategoriaId(producto.categoriaid);
          setImagen(producto.imagen);
          setImagenOriginal(producto.imagen); // Guardar imagen original para comparar
          
          if (producto.unidades && producto.unidades.length > 0) {
            setUnidades(producto.unidades.map(u => ({
              // El backend puede traer unidadid directo o dentro de unidad.idunidad
              unidadid: u.unidadid || u.unidad?.idunidad || 0,
              precio: u.precio.toString(),
            })));
          }

          if (producto.variantes && producto.variantes.length > 0) {
            setShowVariantes(true);
            // Cargar variantes con precios individuales por opción
            const unidadesActuales = producto.unidades?.map(u => ({
              unidadid: u.unidadid || u.unidad?.idunidad || 0,
              precio: u.precio.toString(),
            })) || [];
            
            setVariantes(producto.variantes.map(v => ({
              nombre: v.nombrevariante,
              opciones: v.opciones?.map(o => {
                // Obtener precios de la opción si existen
                const preciosOpcion = o.precios?.map(p => ({
                  unidadid: unidadesActuales.find(u => {
                    // Buscar el unidadid correspondiente al productounidadid
                    const unidadProducto = producto.unidades?.find(pu => pu.idproductounidad === p.productounidadid);
                    return unidadProducto?.unidadid === p.productounidadid || 
                           unidadProducto?.unidad?.idunidad === p.productounidadid;
                  })?.unidadid || p.productounidadid,
                  precio: p.precio.toString(),
                })) || [];

                // Si no hay precios específicos, usar los precios del producto principal
                const preciosFinales = unidadesActuales.map(u => {
                  const precioOpcion = o.precios?.find(p => {
                    const unidadProducto = producto.unidades?.find(pu => pu.idproductounidad === p.productounidadid);
                    return (unidadProducto?.unidadid || unidadProducto?.unidad?.idunidad) === u.unidadid;
                  });
                  return {
                    unidadid: u.unidadid,
                    precio: precioOpcion ? precioOpcion.precio.toString() : u.precio,
                  };
                });

                return {
                  nombre: o.nombreopcionvariante,
                  imagen: o.imagenvariante || '',
                  precios: preciosFinales,
                };
              }) || [],
            })));
          }
        }
      }
    };
    
    cargarProducto();
  }, [params.id, isEditing, getProductoById]);

  const pickImage = async (useCamera: boolean = false) => {
    let result;
    
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showWarning('Permiso denegado', 'Se necesita permiso para acceder a la cámara');
        return;
      }
      
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showWarning('Permiso denegado', 'Se necesita permiso para acceder a la galería');
        return;
      }

      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    }

    if (!result.canceled) {
      setImagen(result.assets[0].uri);
    }
  };

  const addUnidad = () => {
    // Encontrar la primera unidad de medida no utilizada
    const unidadesUsadas = unidades.map(u => u.unidadid);
    const unidadDisponible = unidadesMedida.find(um => !unidadesUsadas.includes(um.idunidad));
    
    if (unidadDisponible) {
      setUnidades([...unidades, { unidadid: unidadDisponible.idunidad, precio: '' }]);
    } else if (unidadesMedida.length > 0) {
      // Si todas están usadas, mostrar advertencia
      showWarning('Aviso', 'Ya has agregado todas las unidades de medida disponibles');
    }
  };

  const removeUnidad = (index: number) => {
    if (unidades.length > 1) {
      const unidadEliminada = unidades[index];
      setUnidades(unidades.filter((_, i) => i !== index));
      
      // También eliminar esta unidad de medida de los precios de todas las opciones de variante
      if (isEditing && variantes.length > 0) {
        setVariantes(variantes.map(v => ({
          ...v,
          opciones: v.opciones.map(o => ({
            ...o,
            precios: o.precios?.filter(p => p.unidadid !== unidadEliminada.unidadid) || [],
          })),
        })));
      }
    }
  };

  const updateUnidad = (index: number, field: 'unidadid' | 'precio', value: number | string) => {
    const newUnidades = [...unidades];
    if (field === 'unidadid') {
      newUnidades[index][field] = value as number;
    } else {
      // Validar precio con la nueva función
      const validated = validateDecimalInput(value as string);
      if (validated !== null) {
        newUnidades[index][field] = validated;
      }
    }
    setUnidades(newUnidades);
  };

  // Verificar si la imagen es local (necesita subirse)
  const isLocalImage = (uri: string) => {
    return uri.startsWith('file://') || uri.startsWith('content://') || uri.includes('ImagePicker');
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      showError('Error', 'El nombre del producto es requerido');
      return;
    }

    if (!imagen) {
      showError('Error', 'La imagen del producto es requerida');
      return;
    }

    if (unidades.some(u => !u.precio || parseFloat(u.precio) <= 0)) {
      showError('Error', 'Todos los precios deben ser mayores a 0');
      return;
    }

    // Validar que no haya unidades de medida duplicadas
    const unidadesIds = unidades.map(u => u.unidadid);
    const unidadesDuplicadas = unidadesIds.filter((id, index) => unidadesIds.indexOf(id) !== index);
    if (unidadesDuplicadas.length > 0) {
      const nombresDuplicados = unidadesDuplicadas.map(id => 
        unidadesMedida.find(um => um.idunidad === id)?.nombre || 'Desconocida'
      );
      showError('Error', `Tienes unidades de medida duplicadas: ${[...new Set(nombresDuplicados)].join(', ')}`);
      return;
    }

    if (showVariantes) {
      if (variantes.some(v => !v.nombre.trim())) {
        showError('Error', 'Todas las variantes deben tener nombre');
        return;
      }
      if (variantes.some(v => v.opciones.some(o => !o.nombre.trim()))) {
        showError('Error', 'Todas las opciones de variantes deben tener nombre');
        return;
      }
      
      // Validar nombres duplicados de variantes
      const nombresVariantes = variantes.map(v => v.nombre.trim().toLowerCase());
      const variantesDuplicadas = nombresVariantes.filter((nombre, index) => 
        nombresVariantes.indexOf(nombre) !== index
      );
      if (variantesDuplicadas.length > 0) {
        showError('Error', `Tienes variantes con nombres duplicados: ${variantesDuplicadas.join(', ')}`);
        return;
      }
      
      // Validar nombres duplicados de opciones dentro de cada variante
      for (let i = 0; i < variantes.length; i++) {
        const nombresOpciones = variantes[i].opciones.map(o => o.nombre.trim().toLowerCase());
        const opcionesDuplicadas = nombresOpciones.filter((nombre, index) => 
          nombresOpciones.indexOf(nombre) !== index
        );
        if (opcionesDuplicadas.length > 0) {
          showError('Error', `La variante "${variantes[i].nombre}" tiene opciones duplicadas: ${opcionesDuplicadas.join(', ')}`);
          return;
        }
      }
    }

    setIsSaving(true);

    try {
      let imagenUrl = imagen;

      // Si la imagen es local, subirla a Supabase
      if (isLocalImage(imagen)) {
        const uploadResult = await productoService.uploadImage({
          uri: imagen,
          mimeType: 'image/jpeg',
          fileName: `producto_${Date.now()}.jpg`,
        });

        if (!uploadResult.success || !uploadResult.data?.url) {
          showError('Error', uploadResult.error || 'No se pudo subir la imagen. Verifica tu conexión e intenta nuevamente.');
          setIsSaving(false);
          return;
        }

        imagenUrl = uploadResult.data.url;
      }

      // Subir imágenes de variantes que sean locales
      let variantesConImagenes = variantes;
      if (showVariantes && variantes.length > 0) {
        variantesConImagenes = await Promise.all(
          variantes.map(async (variante) => {
            const opcionesConImagenes = await Promise.all(
              variante.opciones.map(async (opcion) => {
                if (opcion.imagen && isLocalImage(opcion.imagen)) {
                  try {
                    const uploadResult = await productoService.uploadVarianteImage({
                      uri: opcion.imagen,
                      mimeType: 'image/jpeg',
                      fileName: `variante_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
                    });

                    if (uploadResult.success && uploadResult.data?.url) {
                      return { ...opcion, imagen: uploadResult.data.url };
                    }
                  } catch (error) {
                    console.error('Error subiendo imagen de variante:', error);
                  }
                }
                return opcion;
              })
            );
            return { ...variante, opciones: opcionesConImagenes };
          })
        );
      }

      const productoData = {
        nombreproducto: nombre.trim(),
        descripcion: descripcion.trim(),
        categoriaid: categoriaId,
        imagen: imagenUrl,
        unidades: unidades.map(u => ({
          unidadid: u.unidadid,
          precio: parseFloat(u.precio),
        })) as any,
        variantes: showVariantes ? variantesConImagenes.map(v => ({
          nombre: v.nombre.trim(),
          opciones: v.opciones.map(o => ({
            nombre: o.nombre.trim(),
            imagen: o.imagen || '',
            precios: o.precios?.map(p => ({
              unidadid: p.unidadid,
              precio: parseFloat(p.precio) || 0,
            })).filter(p => p.precio > 0) || [],
          })),
        })) as any : undefined,
      };

      let success = false;
      if (isEditing) {
        success = await updateProducto(Number(params.id), productoData as any);
      } else {
        success = await addProducto(productoData as any);
      }

      if (success) {
        showSuccess('Éxito', `Producto ${isEditing ? 'actualizado' : 'creado'} correctamente`, () => {
          router.back();
        });
      } else {
        showError('Error', 'No se pudo guardar el producto. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error guardando producto:', error);
      showError('Error', 'Ocurrió un error al guardar el producto. Verifica tu conexión e intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const [showImageModal, setShowImageModal] = useState(false);

  const showImageOptions = () => {
    setShowImageModal(true);
  };

  const handleImageOption = (useCamera: boolean) => {
    setShowImageModal(false);
    pickImage(useCamera);
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
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </Text>
        </View>
      </SafeHeader>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 180}
        extraHeight={Platform.OS === 'ios' ? 100 : 180}
        enableResetScrollToCoords={false}
        keyboardOpeningTime={0}
      >
        {/* Imagen */}
        <View className="mb-6">
          <Text className="text-base font-poppins-bold mb-3 text-[#3d2b1f]">Imagen del Producto *</Text>
          <TouchableOpacity 
            className="w-full h-[200px] rounded-2xl overflow-hidden bg-white shadow-md"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
            onPress={showImageOptions}
          >
            {imagen ? (
              <Image source={{ uri: imagen }} className="w-full h-full" />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Ionicons name="camera" size={48} color="#9ca3af" />
                <Text className="mt-2 text-base font-poppins text-gray-500">Tomar foto o seleccionar</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Información básica */}
        <View className="mb-6">
          <Text className="text-base font-poppins-bold mb-3 text-[#3d2b1f]">Nombre del Producto *</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base font-poppins bg-white text-[#3d2b1f]"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Manzana Roja"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View className="mb-6">
          <Text className="text-base font-poppins-bold mb-3 text-[#3d2b1f]">Descripción</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base font-poppins bg-white text-[#3d2b1f]"
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Descripción del producto"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            style={{ height: 100, textAlignVertical: 'top' }}
          />
        </View>

        <View className="mb-6">
          <Text className="text-base font-poppins-bold mb-3 text-[#3d2b1f]">Categoría *</Text>
          <TouchableOpacity
            onPress={() => setShowCategoriaModal(true)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-4 flex-row items-center justify-between"
          >
            <Text className="text-base text-[#3d2b1f] font-poppins">
              {categorias.find(c => c.idcategoria === categoriaId)?.nombrecategoria || 'Seleccionar categoría'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#8B5A3C" />
          </TouchableOpacity>
        </View>

        {/* Unidades de medida */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-poppins-bold text-[#3d2b1f]">Unidades de Medida y Precios *</Text>
            <TouchableOpacity onPress={addUnidad} className="p-1">
              <Ionicons name="add-circle" size={24} color="#402612" />
            </TouchableOpacity>
          </View>

          {unidades.map((unidad, index) => (
            <View key={index} className="rounded-2xl p-4 mb-3 bg-white shadow-md">
              <View className="flex-row items-end gap-2">
                <View className="flex-[2]">
                  <Text className="text-sm font-poppins-semibold mb-2 text-gray-600">Unidad</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setUnidadModalIndex(index);
                      setShowUnidadModal(true);
                    }}
                    className="border-2 border-[#8B5A3C] rounded-xl px-4 py-4 bg-white flex-row justify-between items-center"
                  >
                    <Text className="text-base font-poppins-semibold text-[#3d2b1f]">
                      {unidadesMedida.find(um => um.idunidad === unidad.unidadid)?.nombre || 'Seleccionar'}
                      {unidadesMedida.find(um => um.idunidad === unidad.unidadid)?.abreviatura && 
                        ` (${unidadesMedida.find(um => um.idunidad === unidad.unidadid)?.abreviatura})`
                      }
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#8B5A3C" />
                  </TouchableOpacity>
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-poppins-semibold mb-2 text-gray-600">Precio (Bs)</Text>
                  <TextInput
                    className="border border-gray-200 rounded-xl px-4 py-[1.2rem] text-base font-poppins bg-white text-[#3d2b1f]"
                    value={unidad.precio}
                    onChangeText={(value) => updateUnidad(index, 'precio', value)}
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                  />
                </View>

                {unidades.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeUnidad(index)}
                    className="p-2 justify-center"
                  >
                    <Ionicons name="trash" size={20} color="#DC2626" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Variantes */}
        <View className="mb-6">
          <TouchableOpacity
            className="flex-row justify-between items-center bg-[#40261215] p-4 rounded-xl mb-4"
            onPress={() => setShowVariantes(!showVariantes)}
          >
            <Text className="text-base font-poppins-semibold text-[#402612]">
              {showVariantes ? 'Ocultar Variantes' : 'Agregar Variantes (Opcional)'}
            </Text>
            <Ionicons
              name={showVariantes ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#402612"
            />
          </TouchableOpacity>

          {showVariantes && (
            <VariantesSection
              variantes={variantes}
              setVariantes={setVariantes}
              unidades={unidades}
              unidadesMedida={unidadesMedida}
            />
          )}
        </View>

        <View style={{ height: 100 }} />
      </KeyboardAwareScrollView>

      {/* Modal de Categoría */}
      <Modal
        visible={showCategoriaModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCategoriaModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm max-h-[70%]">
            <View className="bg-[#402612] rounded-t-2xl px-4 py-4 flex-row items-center justify-between">
              <Text className="text-lg font-poppins-bold text-[#F6EBD7]">
                Seleccionar Categoría
              </Text>
              <TouchableOpacity onPress={() => setShowCategoriaModal(false)}>
                <Ionicons name="close" size={24} color="#F6EBD7" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={categorias}
              keyExtractor={(item) => item.idcategoria.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCategoriaId(item.idcategoria);
                    setShowCategoriaModal(false);
                  }}
                  className={`mx-4 my-2 rounded-xl p-4 flex-row items-center justify-between border-2 ${
                    categoriaId === item.idcategoria
                      ? 'border-[#402612] bg-[#402612]/10'
                      : 'border-[#8B5A3C]/30 bg-white'
                  }`}
                >
                  <Text className={`text-base font-poppins-semibold ${
                    categoriaId === item.idcategoria ? 'text-[#402612]' : 'text-[#3d2b1f]'
                  }`}>
                    {item.nombrecategoria}
                  </Text>
                  {categoriaId === item.idcategoria && (
                    <Ionicons name="checkmark-circle" size={24} color="#402612" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingVertical: 10 }}
            />

            <View className="px-4 pb-4">
              <TouchableOpacity
                onPress={() => setShowCategoriaModal(false)}
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

      {/* Modal Selección de Unidad */}
      <Modal
        visible={showUnidadModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnidadModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm" style={{ maxHeight: '70%' }}>
            <View className="bg-[#402612] rounded-t-2xl px-4 py-4">
              <Text className="text-lg font-poppins-bold text-[#F6EBD7]">
                Seleccionar Unidad
              </Text>
            </View>
            
            <ScrollView className="max-h-80">
              {unidadesMedida.map((unidad) => {
                // Verificar si esta unidad ya está seleccionada en otra posición
                const yaSeleccionada = unidades.some(
                  (u, idx) => u.unidadid === unidad.idunidad && idx !== unidadModalIndex
                );
                
                return (
                  <TouchableOpacity
                    key={unidad.idunidad}
                    onPress={() => {
                      if (!yaSeleccionada) {
                        updateUnidad(unidadModalIndex, 'unidadid', unidad.idunidad);
                        setShowUnidadModal(false);
                      }
                    }}
                    disabled={yaSeleccionada}
                    className={`px-6 py-4 border-b border-[#E8DFD4] ${
                      yaSeleccionada ? 'opacity-40 bg-gray-100' : 'active:bg-[#E8DFD4]'
                    }`}
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className={`text-base font-poppins-semibold ${
                          yaSeleccionada ? 'text-gray-400' : 'text-[#402612]'
                        }`}>
                          {unidad.nombre}
                        </Text>
                        <Text className={`text-sm font-poppins-regular ${
                          yaSeleccionada ? 'text-gray-400' : 'text-[#8B5A3C]'
                        }`}>
                          {unidad.abreviatura} • {unidad.es_peso ? 'Peso' : 'Unidad'}
                        </Text>
                      </View>
                      {yaSeleccionada && (
                        <View className="bg-gray-300 rounded-full px-2 py-1">
                          <Text className="text-xs text-gray-600 font-poppins-semibold">Ya usada</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View className="p-4 border-t border-[#E8DFD4]">
              <TouchableOpacity
                onPress={() => setShowUnidadModal(false)}
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

      {/* Botón guardar */}
      <View className="p-4 bg-white" style={{ elevation: 3, borderTopWidth: 1, borderTopColor: '#E5E5E5' }}>
        <TouchableOpacity 
          className={`p-4 rounded-xl items-center flex-row justify-center ${isSaving ? 'bg-[#8B5A3C]' : 'bg-[#402612]'}`}
          onPress={handleSave} 
          activeOpacity={0.85}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <ActivityIndicator color="#F6EBD7" size="small" />
              <Text className="text-base font-poppins-bold text-[#F6EBD7] ml-2">
                Guardando...
              </Text>
            </>
          ) : (
            <Text className="text-base font-poppins-bold text-white">
              {isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal para seleccionar imagen */}
    <Modal visible={showImageModal} transparent animationType="fade">
      <TouchableOpacity 
        className="flex-1 bg-black/50 justify-center items-center"
        activeOpacity={1}
        onPress={() => setShowImageModal(false)}
      >
        <View className="bg-white rounded-2xl mx-8 overflow-hidden" style={{ width: 280 }}>
          <View className="px-6 py-4 border-b border-gray-100">
            <Text className="text-lg font-poppins-semibold text-[#402612]">
              Seleccionar imagen
            </Text>
            <Text className="text-sm font-poppins text-gray-600 mt-1">
              Elige una opción
            </Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center px-6 py-4 active:bg-gray-50"
            onPress={() => handleImageOption(true)}
          >
            <Ionicons name="camera" size={24} color="#402612" />
            <Text className="text-base font-poppins text-[#402612] ml-3">
              Tomar foto
            </Text>
          </TouchableOpacity>

          <View className="h-px bg-gray-100 mx-6" />

          <TouchableOpacity
            className="flex-row items-center px-6 py-4 active:bg-gray-50"
            onPress={() => handleImageOption(false)}
          >
            <Ionicons name="images" size={24} color="#402612" />
            <Text className="text-base font-poppins text-[#402612] ml-3">
              Elegir de galería
            </Text>
          </TouchableOpacity>

          <View className="h-px bg-gray-100" />

          <TouchableOpacity
            className="px-6 py-4 active:bg-gray-50"
            onPress={() => setShowImageModal(false)}
          >
            <Text className="text-base font-poppins text-center text-gray-600">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>

    {/* Custom Alert Component */}
    <AlertComponent />
    </ScreenContainer>
  );
}
