import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

// Payment Section (for Contado sales)
interface PagoSectionProps {
  total: number;
  montoPago: string;
  onMontoPagoChange: (text: string) => void;
  cambio: number;
  visible: boolean;
}

export function PagoSection({ total, montoPago, onMontoPagoChange, cambio, visible }: PagoSectionProps) {
  if (!visible) return null;
  
  return (
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
              onChangeText={onMontoPagoChange}
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
  );
}

// Additional Info Section for Cobros
interface CobroInfoSectionProps {
  fechaVencimiento: string;
  onFechaChange: (text: string) => void;
  notas: string;
  onNotasChange: (text: string) => void;
}

export function CobroInfoSection({ fechaVencimiento, onFechaChange, notas, onNotasChange }: CobroInfoSectionProps) {
  return (
    <View className="mb-4 bg-white rounded-xl p-4 border border-[#E5E5E5]">
      <Text className="text-base font-poppins-bold text-[#402612] mb-3">
        Información Adicional
      </Text>

      {/* Fecha de Vencimiento */}
      <View className="mb-3">
        <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-1">
          Fecha de Vencimiento <Text className="text-xs font-poppins-regular">(opcional)</Text>
        </Text>
        <TextInput
          className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#8B5A3C80"
          value={fechaVencimiento}
          onChangeText={onFechaChange}
        />
      </View>

      {/* Notas */}
      <View>
        <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-1">
          Notas <Text className="text-xs font-poppins-regular">(opcional)</Text>
        </Text>
        <TextInput
          className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
          placeholder="Notas adicionales..."
          placeholderTextColor="#8B5A3C80"
          value={notas}
          onChangeText={onNotasChange}
          multiline
          numberOfLines={2}
          style={{ height: 60, textAlignVertical: 'top' }}
        />
      </View>
    </View>
  );
}

// Form Header
interface FormHeaderProps {
  title: string;
  onBack: () => void;
}

export function FormHeader({ title, onBack }: FormHeaderProps) {
  return (
    <View className="bg-[#402612] px-4 py-4 flex-row items-center">
      <TouchableOpacity onPress={onBack} className="mr-3">
        <Ionicons name="arrow-back" size={24} color="#F6EBD7" />
      </TouchableOpacity>
      <Text className="text-xl font-poppins-semibold text-[#F6EBD7]">
        {title}
      </Text>
    </View>
  );
}
