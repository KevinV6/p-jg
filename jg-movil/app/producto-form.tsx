import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import { useInventario } from '@/contexts/InventarioContext';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  View,
  ActivityIndicator,
} from 'react-native';
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
  
  // Estados para autocompletado de variantes
  const [varianteSugerencias, setVarianteSugerencias] = useState<Array<{idvariantecatalogo: number, nombrevariante: string}>>([]);
  const [showVarianteSugerencias, setShowVarianteSugerencias] = useState<{[key: number]: boolean}>({});
  const [varianteQuery, setVarianteQuery] = useState<{[key: number]: string}>({});
  
  // Estados para autocompletado de opciones
  const [opcionSugerencias, setOpcionSugerencias] = useState<{[key: string]: Array<{idopcioncatalogo: number, nombreopcion: string}>}>({});
  const [showOpcionSugerencias, setShowOpcionSugerencias] = useState<{[key: string]: boolean}>({});
  const [opcionQuery, setOpcionQuery] = useState<{[key: string]: string}>({});

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

  const pickVarianteImage = async (varianteIndex: number, opcionIndex: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showWarning('Permiso denegado', 'Se necesita permiso para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newVariantes = [...variantes];
      newVariantes[varianteIndex].opciones[opcionIndex].imagen = result.assets[0].uri;
      setVariantes(newVariantes);
    }
  };

  const addUnidad = () => {
    setUnidades([...unidades, { unidadid: 1, precio: '' }]);
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
      newUnidades[index][field] = value as string;
    }
    setUnidades(newUnidades);
  };

  const addVariante = () => {
    setVariantes([...variantes, { nombre: '', opciones: [{ nombre: '', imagen: '' }] }]);
  };

  const removeVariante = (index: number) => {
    setVariantes(variantes.filter((_, i) => i !== index));
  };

  const updateVarianteNombre = (index: number, nombre: string) => {
    const newVariantes = [...variantes];
    newVariantes[index].nombre = nombre;
    setVariantes(newVariantes);
  };

  const addOpcionVariante = (varianteIndex: number) => {
    const newVariantes = [...variantes];
    newVariantes[varianteIndex].opciones.push({ nombre: '', imagen: '' });
    setVariantes(newVariantes);
  };

  const removeOpcionVariante = (varianteIndex: number, opcionIndex: number) => {
    const newVariantes = [...variantes];
    if (newVariantes[varianteIndex].opciones.length > 1) {
      newVariantes[varianteIndex].opciones = newVariantes[varianteIndex].opciones.filter((_, i) => i !== opcionIndex);
      setVariantes(newVariantes);
    }
  };

  const updateOpcionVariante = (varianteIndex: number, opcionIndex: number, nombre: string) => {
    const newVariantes = [...variantes];
    newVariantes[varianteIndex].opciones[opcionIndex].nombre = nombre;
    setVariantes(newVariantes);
  };

  const updateOpcionVariantePrecio = (varianteIndex: number, opcionIndex: number, unidadid: number, precio: string) => {
    const newVariantes = [...variantes];
    const opcion = newVariantes[varianteIndex].opciones[opcionIndex];
    
    if (!opcion.precios) {
      opcion.precios = [];
    }
    
    const precioIndex = opcion.precios.findIndex(p => p.unidadid === unidadid);
    if (precioIndex >= 0) {
      opcion.precios[precioIndex].precio = precio;
    } else {
      opcion.precios.push({ unidadid, precio });
    }
    
    setVariantes(newVariantes);
  };

  const getOpcionVariantePrecio = (varianteIndex: number, opcionIndex: number, unidadid: number): string => {
    const opcion = variantes[varianteIndex]?.opciones[opcionIndex];
    if (opcion?.precios) {
      const precio = opcion.precios.find(p => p.unidadid === unidadid);
      if (precio) return precio.precio;
    }
    // Si no hay precio de opción, usar el precio del producto principal
    const unidadPrincipal = unidades.find(u => u.unidadid === unidadid);
    return unidadPrincipal?.precio || '';
  };

  // Verificar si la imagen es local (necesita subirse)
  const isLocalImage = (uri: string) => {
    return uri.startsWith('file://') || uri.startsWith('content://') || uri.includes('ImagePicker');
  };

  // Búsqueda de variantes con debounce
  const buscarVariantes = async (vIndex: number, query: string) => {
    setVarianteQuery({...varianteQuery, [vIndex]: query});
    
    if (query.length < 2) {
      setShowVarianteSugerencias({...showVarianteSugerencias, [vIndex]: false});
      return;
    }

    try {
      const result = await productoService.searchVariantesCatalogo(query);
      if (result.success && result.data) {
        // Filtrar variantes que ya están en uso (excepto la actual)
        const nombresUsados = variantes
          .map((v, idx) => idx !== vIndex ? v.nombre.trim().toLowerCase() : null)
          .filter(n => n !== null);
        
        const sugerenciasFiltradas = result.data.filter(
          sug => !nombresUsados.includes(sug.nombrevariante.toLowerCase())
        );
        
        setVarianteSugerencias(sugerenciasFiltradas);
        setShowVarianteSugerencias({...showVarianteSugerencias, [vIndex]: sugerenciasFiltradas.length > 0});
      }
    } catch (error) {
      console.error('Error buscando variantes:', error);
    }
  };

  // Seleccionar variante de sugerencias
  const seleccionarVariante = (vIndex: number, nombre: string) => {
    const newVariantes = [...variantes];
    newVariantes[vIndex].nombre = nombre;
    setVariantes(newVariantes);
    setVarianteQuery({...varianteQuery, [vIndex]: nombre});
    setShowVarianteSugerencias({...showVarianteSugerencias, [vIndex]: false});
  };

  // Búsqueda de opciones con debounce
  const buscarOpciones = async (vIndex: number, oIndex: number, query: string, varianteCatalogoId?: number) => {
    const key = `${vIndex}-${oIndex}`;
    setOpcionQuery({...opcionQuery, [key]: query});
    
    if (query.length < 2) {
      setShowOpcionSugerencias({...showOpcionSugerencias, [key]: false});
      return;
    }

    try {
      const result = await productoService.searchOpcionesCatalogo(varianteCatalogoId || 1, query);
      if (result.success && result.data) {
        // Filtrar opciones que ya están en uso en esta variante (excepto la actual)
        const nombresUsados = variantes[vIndex].opciones
          .map((o, idx) => idx !== oIndex ? o.nombre.trim().toLowerCase() : null)
          .filter(n => n !== null);
        
        const sugerenciasFiltradas = result.data.filter(
          sug => !nombresUsados.includes(sug.nombreopcion.toLowerCase())
        );
        
        setOpcionSugerencias({...opcionSugerencias, [key]: sugerenciasFiltradas});
        setShowOpcionSugerencias({...showOpcionSugerencias, [key]: sugerenciasFiltradas.length > 0});
      }
    } catch (error) {
      console.error('Error buscando opciones:', error);
    }
  };

  // Seleccionar opción de sugerencias
  const seleccionarOpcion = (vIndex: number, oIndex: number, nombre: string) => {
    const newVariantes = [...variantes];
    newVariantes[vIndex].opciones[oIndex].nombre = nombre;
    setVariantes(newVariantes);
    const key = `${vIndex}-${oIndex}`;
    setOpcionQuery({...opcionQuery, [key]: nombre});
    setShowOpcionSugerencias({...showOpcionSugerencias, [key]: false});
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
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

      <ScrollView 
        className="flex-1 p-4" 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            <>
              <TouchableOpacity 
                onPress={addVariante} 
                className="flex-row items-center justify-center p-4 rounded-xl border-2 border-dashed mb-4 bg-white" 
                style={{ borderColor: '#402612' }}
              >
                <Ionicons name="add-circle-outline" size={20} color="#402612" />
                <Text className="text-base text-[#402612] font-poppins-semibold ml-1">Agregar Variante</Text>
              </TouchableOpacity>

              {variantes.map((variante, vIndex) => (
                <View key={vIndex} className="rounded-xl p-4 mb-4 border border-gray-200 bg-white shadow-md">
                  <View className="flex-row items-center gap-2 mb-4">
                    <View className="flex-1">
                      <TextInput
                        className="border border-gray-200 rounded-xl px-4 py-3 text-base font-poppins bg-white text-[#3d2b1f]"
                        value={variante.nombre}
                        onChangeText={(value) => {
                          updateVarianteNombre(vIndex, value);
                          buscarVariantes(vIndex, value);
                        }}
                        placeholder="Nombre de la variante (Ej: Color, Tamaño)"
                        placeholderTextColor="#9ca3af"
                      />
                      
                      {/* Sugerencias de variantes */}
                      {showVarianteSugerencias[vIndex] && varianteSugerencias.length > 0 && (
                        <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-50 shadow-lg max-h-40">
                          <ScrollView>
                            {varianteSugerencias.map((sug, idx) => (
                              <TouchableOpacity
                                key={idx}
                                onPress={() => seleccionarVariante(vIndex, sug.nombrevariante)}
                                className="px-4 py-3 border-b border-gray-100"
                              >
                                <Text className="text-[#402612] font-poppins">{sug.nombrevariante}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => removeVariante(vIndex)}>
                      <Ionicons name="close-circle" size={24} color="#DC2626" />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-sm font-poppins-bold mb-2 text-[#8B5A3C]">Opciones:</Text>

                  {variante.opciones.map((opcion, oIndex) => (
                    <View key={oIndex} className="mb-4 p-3 rounded-lg bg-[#F6EBD7] border border-gray-200">
                      <View className="flex-row items-center gap-2 mb-3">
                        <TouchableOpacity
                          className="w-[60px] h-[60px] rounded-lg overflow-hidden border border-gray-200 bg-white"
                          onPress={() => pickVarianteImage(vIndex, oIndex)}
                        >
                          {opcion.imagen ? (
                            <Image source={{ uri: opcion.imagen }} className="w-full h-full" />
                          ) : (
                            <View className="flex-1 justify-center items-center">
                              <Ionicons name="image" size={24} color="#9ca3af" />
                            </View>
                          )}
                        </TouchableOpacity>

                        <View className="flex-1">
                          <TextInput
                            className="border border-gray-200 rounded-xl px-4 py-3 text-base font-poppins bg-white text-[#3d2b1f]"
                            value={opcion.nombre}
                            onChangeText={(value) => {
                              updateOpcionVariante(vIndex, oIndex, value);
                              buscarOpciones(vIndex, oIndex, value);
                            }}
                            placeholder="Nombre de la opción (Ej: Rojo)"
                            placeholderTextColor="#9ca3af"
                          />
                          
                          {/* Sugerencias de opciones */}
                          {showOpcionSugerencias[`${vIndex}-${oIndex}`] && opcionSugerencias[`${vIndex}-${oIndex}`]?.length > 0 && (
                            <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-50 shadow-lg max-h-40">
                              <ScrollView>
                                {opcionSugerencias[`${vIndex}-${oIndex}`].map((sug, idx) => (
                                  <TouchableOpacity
                                    key={idx}
                                    onPress={() => seleccionarOpcion(vIndex, oIndex, sug.nombreopcion)}
                                    className="px-4 py-3 border-b border-gray-100"
                                  >
                                    <Text className="text-[#402612] font-poppins">{sug.nombreopcion}</Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          )}
                        </View>

                        {variante.opciones.length > 1 && (
                          <TouchableOpacity onPress={() => removeOpcionVariante(vIndex, oIndex)}>
                            <Ionicons name="trash" size={20} color="#DC2626" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Precios por unidad de medida para esta opción */}
                      {unidades.length > 0 && (
                        <View className="mt-2">
                          <Text className="text-xs font-poppins-bold mb-2 text-[#8B5A3C]">
                            Precios por unidad de medida:
                          </Text>
                          <View className="flex-row flex-wrap gap-2">
                            {unidades.map((unidad, uIndex) => {
                              const unidadInfo = unidadesMedida.find(u => u.idunidad === unidad.unidadid);
                              return (
                                <View key={uIndex} className="bg-white rounded-lg p-2 border border-gray-200 min-w-[100px]">
                                  <Text className="text-xs font-poppins-semibold text-gray-600 text-center mb-1">
                                    {unidadInfo?.abreviatura || unidadInfo?.nombre}
                                  </Text>
                                  <TextInput
                                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm font-poppins bg-white text-[#3d2b1f] text-center"
                                    value={getOpcionVariantePrecio(vIndex, oIndex, unidad.unidadid)}
                                    onChangeText={(value) => updateOpcionVariantePrecio(vIndex, oIndex, unidad.unidadid, value)}
                                    placeholder="0.00"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="decimal-pad"
                                  />
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      )}
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={() => addOpcionVariante(vIndex)}
                    className="flex-row items-center justify-center py-2 mt-1"
                  >
                    <Ionicons name="add" size={16} color="#00D98E" />
                    <Text className="text-sm text-[#00D98E] font-poppins-semibold ml-1">Agregar Opción</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

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
              {unidadesMedida.map((unidad) => (
                <TouchableOpacity
                  key={unidad.idunidad}
                  onPress={() => {
                    updateUnidad(unidadModalIndex, 'unidadid', unidad.idunidad);
                    setShowUnidadModal(false);
                  }}
                  className="px-6 py-4 border-b border-[#E8DFD4] active:bg-[#E8DFD4]"
                >
                  <Text className="text-base font-poppins-semibold text-[#402612]">
                    {unidad.nombre}
                  </Text>
                  <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
                    {unidad.abreviatura} • {unidad.es_peso ? 'Peso' : 'Unidad'}
                  </Text>
                </TouchableOpacity>
              ))}
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
    </KeyboardAvoidingView>

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
