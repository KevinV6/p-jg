import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

// Unit Price Row
interface UnitPriceRowProps {
  unidad: UnidadPrecio;
  index: number;
  unidadesMedida: UnidadMedida[];
  canRemove: boolean;
  onSelectUnit: () => void;
  onChangePrice: (price: string) => void;
  onRemove: () => void;
}

export function UnitPriceRow({ 
  unidad, 
  index, 
  unidadesMedida, 
  canRemove,
  onSelectUnit, 
  onChangePrice, 
  onRemove 
}: UnitPriceRowProps) {
  const selectedUnidad = unidadesMedida.find(um => um.idunidad === unidad.unidadid);
  
  return (
    <View className="flex-row items-center gap-3 mb-3">
      <TouchableOpacity
        onPress={onSelectUnit}
        className="flex-1 bg-white border border-[#8B5A3C] rounded-xl px-4 py-4 flex-row items-center justify-between"
      >
        <Text className="font-poppins-regular text-[#402612]">
          {selectedUnidad?.nombre || 'Unidad'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#8B5A3C" />
      </TouchableOpacity>
      
      <TextInput
        className="flex-1 bg-white border border-[#8B5A3C] rounded-xl px-4 py-4 font-poppins-regular text-[#402612]"
        placeholder="Precio (Bs.)"
        placeholderTextColor="#8B5A3C80"
        keyboardType="decimal-pad"
        value={unidad.precio}
        onChangeText={onChangePrice}
      />
      
      {canRemove && (
        <TouchableOpacity
          onPress={onRemove}
          className="bg-red-500/20 rounded-xl p-3"
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// Unit Modal
interface UnitModalProps {
  visible: boolean;
  onClose: () => void;
  unidadesMedida: UnidadMedida[];
  selectedId: number;
  usedUnidadIds: number[];
  onSelect: (id: number) => void;
}

export function UnitModal({ visible, onClose, unidadesMedida, selectedId, usedUnidadIds, onSelect }: UnitModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-[#F6EBD7] rounded-t-3xl max-h-[70%]">
          <View className="bg-[#402612] rounded-t-3xl px-4 py-4 flex-row items-center justify-between">
            <Text className="text-lg font-poppins-bold text-[#F6EBD7]">Seleccionar Unidad</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#F6EBD7" />
            </TouchableOpacity>
          </View>
          <View className="p-4">
            {unidadesMedida.map(um => {
              const isUsed = usedUnidadIds.includes(um.idunidad) && um.idunidad !== selectedId;
              return (
                <TouchableOpacity
                  key={um.idunidad}
                  onPress={() => {
                    if (!isUsed) {
                      onSelect(um.idunidad);
                      onClose();
                    }
                  }}
                  disabled={isUsed}
                  className={`py-4 px-4 rounded-xl mb-2 ${
                    isUsed 
                      ? 'bg-gray-200 opacity-50' 
                      : selectedId === um.idunidad 
                        ? 'bg-[#402612]' 
                        : 'bg-white border border-[#E5E5E5]'
                  }`}
                >
                  <Text className={`font-poppins-semibold ${
                    isUsed 
                      ? 'text-gray-400' 
                      : selectedId === um.idunidad 
                        ? 'text-[#F6EBD7]' 
                        : 'text-[#402612]'
                  }`}>
                    {um.nombre} {isUsed && '(Ya seleccionada)'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
