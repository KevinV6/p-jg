import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { productoService } from '@/services/productoService';
import { UnidadMedida } from '@/types/types';
import { useCustomAlert } from '@/components/shared/CustomAlert';

interface UnidadPrecio {
  unidadid: number;
  precio: string;
}

interface PrecioUnidadVariante {
  unidadid: number;
  precio: string;
}

interface OpcionVariante {
  nombre: string;
  imagen: string;
  precios?: PrecioUnidadVariante[];
}

interface Variante {
  nombre: string;
  opciones: OpcionVariante[];
}

interface VariantesSectionProps {
  variantes: Variante[];
  setVariantes: (variantes: Variante[]) => void;
  unidades: UnidadPrecio[];
  unidadesMedida: UnidadMedida[];
}

export default function VariantesSection({
  variantes,
  setVariantes,
  unidades,
  unidadesMedida,
}: VariantesSectionProps) {
  const { showWarning } = useCustomAlert();
  
  // Estados para autocompletado de variantes
  const [varianteSugerencias, setVarianteSugerencias] = useState<Array<{idvariantecatalogo: number, nombrevariante: string}>>([]);
  const [showVarianteSugerencias, setShowVarianteSugerencias] = useState<{[key: number]: boolean}>({});
  const [varianteQuery, setVarianteQuery] = useState<{[key: number]: string}>({});
  
  // Estados para autocompletado de opciones
  const [opcionSugerencias, setOpcionSugerencias] = useState<{[key: string]: Array<{idopcioncatalogo: number, nombreopcion: string}>}>({});
  const [showOpcionSugerencias, setShowOpcionSugerencias] = useState<{[key: string]: boolean}>({});
  const [opcionQuery, setOpcionQuery] = useState<{[key: string]: string}>({});

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

  const addVariante = () => {
    setVariantes([...variantes, { nombre: '', opciones: [{ nombre: '', imagen: '' }] }]);
  };

  const removeVariante = (index: number) => {
    const newVariantes = variantes.filter((_, i) => i !== index);
    setVariantes([...newVariantes]); // Crear nueva referencia para asegurar re-render
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

  return (
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
  );
}
