import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Types
interface UnidadMedida {
  idunidad: number;
  nombre: string;
  abreviatura?: string;
}

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

interface VarianteSugerencia {
  idvariantecatalogo: number;
  nombrevariante: string;
}

interface OpcionSugerencia {
  idopcioncatalogo: number;
  nombreopcion: string;
}

// Variante Card
interface VarianteCardProps {
  variante: Variante;
  vIndex: number;
  varianteSugerencias: VarianteSugerencia[];
  showVarianteSugerencias: boolean;
  opcionSugerencias: { [key: string]: OpcionSugerencia[] };
  showOpcionSugerencias: { [key: string]: boolean };
  unidades: UnidadPrecio[];
  unidadesMedida: UnidadMedida[];
  onUpdateVarianteNombre: (index: number, nombre: string) => void;
  onBuscarVariantes: (index: number, query: string) => void;
  onSeleccionarVariante: (index: number, nombre: string) => void;
  onRemoveVariante: (index: number) => void;
  onUpdateOpcionVariante: (vIndex: number, oIndex: number, nombre: string) => void;
  onBuscarOpciones: (vIndex: number, oIndex: number, query: string) => void;
  onSeleccionarOpcion: (vIndex: number, oIndex: number, nombre: string) => void;
  onRemoveOpcionVariante: (vIndex: number, oIndex: number) => void;
  onAddOpcionVariante: (vIndex: number) => void;
  onPickVarianteImage: (vIndex: number, oIndex: number) => void;
  onUpdateOpcionPrecio: (vIndex: number, oIndex: number, unidadid: number, precio: string) => void;
  getOpcionPrecio: (vIndex: number, oIndex: number, unidadid: number) => string;
}

export function VarianteCard({
  variante,
  vIndex,
  varianteSugerencias,
  showVarianteSugerencias,
  opcionSugerencias,
  showOpcionSugerencias,
  unidades,
  unidadesMedida,
  onUpdateVarianteNombre,
  onBuscarVariantes,
  onSeleccionarVariante,
  onRemoveVariante,
  onUpdateOpcionVariante,
  onBuscarOpciones,
  onSeleccionarOpcion,
  onRemoveOpcionVariante,
  onAddOpcionVariante,
  onPickVarianteImage,
  onUpdateOpcionPrecio,
  getOpcionPrecio,
}: VarianteCardProps) {
  return (
    <View className="rounded-xl p-4 mb-4 border border-gray-200 bg-white shadow-md">
      {/* Header de variante */}
      <View className="flex-row items-center gap-2 mb-4">
        <View className="flex-1">
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base font-poppins bg-white text-[#3d2b1f]"
            value={variante.nombre}
            onChangeText={(value) => {
              onUpdateVarianteNombre(vIndex, value);
              onBuscarVariantes(vIndex, value);
            }}
            placeholder="Nombre de la variante (Ej: Color, Tamaño)"
            placeholderTextColor="#9ca3af"
          />
          
          {/* Sugerencias de variantes */}
          {showVarianteSugerencias && varianteSugerencias.length > 0 && (
            <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-50 shadow-lg max-h-40">
              <ScrollView>
                {varianteSugerencias.map((sug, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => onSeleccionarVariante(vIndex, sug.nombrevariante)}
                    className="px-4 py-3 border-b border-gray-100"
                  >
                    <Text className="text-[#402612] font-poppins">{sug.nombrevariante}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => onRemoveVariante(vIndex)}>
          <Ionicons name="close-circle" size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <Text className="text-sm font-poppins-bold mb-2 text-[#8B5A3C]">Opciones:</Text>

      {/* Lista de opciones */}
      {variante.opciones.map((opcion, oIndex) => (
        <OpcionVarianteItem
          key={oIndex}
          opcion={opcion}
          vIndex={vIndex}
          oIndex={oIndex}
          opcionSugerencias={opcionSugerencias[`${vIndex}-${oIndex}`] || []}
          showSugerencias={showOpcionSugerencias[`${vIndex}-${oIndex}`] || false}
          canRemove={variante.opciones.length > 1}
          unidades={unidades}
          unidadesMedida={unidadesMedida}
          onUpdate={(nombre) => {
            onUpdateOpcionVariante(vIndex, oIndex, nombre);
            onBuscarOpciones(vIndex, oIndex, nombre);
          }}
          onSelectSugerencia={(nombre) => onSeleccionarOpcion(vIndex, oIndex, nombre)}
          onRemove={() => onRemoveOpcionVariante(vIndex, oIndex)}
          onPickImage={() => onPickVarianteImage(vIndex, oIndex)}
          onUpdatePrecio={(unidadid, precio) => onUpdateOpcionPrecio(vIndex, oIndex, unidadid, precio)}
          getPrecio={(unidadid) => getOpcionPrecio(vIndex, oIndex, unidadid)}
        />
      ))}

      {/* Botón agregar opción */}
      <TouchableOpacity
        onPress={() => onAddOpcionVariante(vIndex)}
        className="flex-row items-center justify-center py-2 mt-1"
      >
        <Ionicons name="add" size={16} color="#00D98E" />
        <Text className="text-sm text-[#00D98E] font-poppins-semibold ml-1">Agregar Opción</Text>
      </TouchableOpacity>
    </View>
  );
}

// Opción Variante Item
interface OpcionVarianteItemProps {
  opcion: OpcionVariante;
  vIndex: number;
  oIndex: number;
  opcionSugerencias: OpcionSugerencia[];
  showSugerencias: boolean;
  canRemove: boolean;
  unidades: UnidadPrecio[];
  unidadesMedida: UnidadMedida[];
  onUpdate: (nombre: string) => void;
  onSelectSugerencia: (nombre: string) => void;
  onRemove: () => void;
  onPickImage: () => void;
  onUpdatePrecio: (unidadid: number, precio: string) => void;
  getPrecio: (unidadid: number) => string;
}

function OpcionVarianteItem({
  opcion,
  vIndex,
  oIndex,
  opcionSugerencias,
  showSugerencias,
  canRemove,
  unidades,
  unidadesMedida,
  onUpdate,
  onSelectSugerencia,
  onRemove,
  onPickImage,
  onUpdatePrecio,
  getPrecio,
}: OpcionVarianteItemProps) {
  return (
    <View className="mb-4 p-3 rounded-lg bg-[#F6EBD7] border border-gray-200">
      <View className="flex-row items-center gap-2 mb-3">
        {/* Imagen de la opción */}
        <TouchableOpacity
          className="w-[60px] h-[60px] rounded-lg overflow-hidden border border-gray-200 bg-white"
          onPress={onPickImage}
        >
          {opcion.imagen ? (
            <Image source={{ uri: opcion.imagen }} className="w-full h-full" />
          ) : (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="image" size={24} color="#9ca3af" />
            </View>
          )}
        </TouchableOpacity>

        {/* Input nombre */}
        <View className="flex-1">
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base font-poppins bg-white text-[#3d2b1f]"
            value={opcion.nombre}
            onChangeText={onUpdate}
            placeholder="Nombre de la opción (Ej: Rojo)"
            placeholderTextColor="#9ca3af"
          />
          
          {/* Sugerencias de opciones */}
          {showSugerencias && opcionSugerencias.length > 0 && (
            <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-50 shadow-lg max-h-40">
              <ScrollView>
                {opcionSugerencias.map((sug, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => onSelectSugerencia(sug.nombreopcion)}
                    className="px-4 py-3 border-b border-gray-100"
                  >
                    <Text className="text-[#402612] font-poppins">{sug.nombreopcion}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Botón eliminar */}
        {canRemove && (
          <TouchableOpacity onPress={onRemove}>
            <Ionicons name="trash" size={20} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>

      {/* Precios por unidad de medida */}
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
                    value={getPrecio(unidad.unidadid)}
                    onChangeText={(value) => onUpdatePrecio(unidad.unidadid, value)}
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
  );
}

// Add Variante Button
interface AddVarianteButtonProps {
  onPress: () => void;
}

export function AddVarianteButton({ onPress }: AddVarianteButtonProps) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      className="flex-row items-center justify-center p-4 rounded-xl border-2 border-dashed mb-4 bg-white" 
      style={{ borderColor: '#402612' }}
    >
      <Ionicons name="add-circle-outline" size={20} color="#402612" />
      <Text className="text-base text-[#402612] font-poppins-semibold ml-1">Agregar Variante</Text>
    </TouchableOpacity>
  );
}

// Variantes Section Toggle
interface VariantesSectionToggleProps {
  showVariantes: boolean;
  onToggle: () => void;
}

export function VariantesSectionToggle({ showVariantes, onToggle }: VariantesSectionToggleProps) {
  return (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-[#40261215] p-4 rounded-xl mb-4"
      onPress={onToggle}
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
  );
}
