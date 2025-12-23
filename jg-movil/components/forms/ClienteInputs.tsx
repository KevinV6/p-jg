import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Cliente } from '@/types/types';

// Client Autocomplete Input with Suggestions
interface ClienteAutocompleteProps {
  clienteId: number | null;
  clienteNombre: string;
  clienteSugerencias: Cliente[];
  showSugerencias: boolean;
  onChangeText: (text: string) => void;
  onSelectCliente: (cliente: Cliente) => void;
  onFocus: () => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
}

export function ClienteAutocomplete({
  clienteId,
  clienteNombre,
  clienteSugerencias,
  showSugerencias,
  onChangeText,
  onSelectCliente,
  onFocus,
  label = 'Nombre',
  placeholder = 'Buscar o escribir nombre...',
  helperText,
}: ClienteAutocompleteProps) {
  return (
    <View className="mb-3">
      <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-1">
        {label} {helperText && <Text className="text-xs font-poppins-regular">{helperText}</Text>}
      </Text>
      <View className="relative">
        <TextInput
          className={`bg-[#F6EBD7] border rounded-xl px-4 py-3 text-[#402612] font-poppins-regular ${
            clienteId ? 'border-green-500' : 'border-[#8B5A3C]'
          }`}
          placeholder={placeholder}
          placeholderTextColor="#8B5A3C80"
          value={clienteNombre}
          onChangeText={onChangeText}
          onFocus={onFocus}
        />
        {clienteId && (
          <View className="absolute right-3 top-3">
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
          </View>
        )}
      </View>
      
      {/* Sugerencias */}
      {showSugerencias && clienteSugerencias.length > 0 && (
        <View 
          className="bg-white border border-[#8B5A3C] rounded-xl mt-1 max-h-40 absolute top-full left-0 right-0 shadow-lg"
          style={{ zIndex: 9999, elevation: 10 }}
        >
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="always">
            {clienteSugerencias.map((sug) => (
              <TouchableOpacity
                key={sug.idcliente}
                onPress={() => onSelectCliente(sug)}
                className="px-4 py-3 border-b border-[#E5E5E5] active:bg-[#F6EBD7]"
                activeOpacity={0.7}
              >
                <Text className="text-[#402612] font-poppins-semibold">{sug.nombrecliente}</Text>
                {sug.ci_nit && (
                  <Text className="text-[#8B5A3C] font-poppins-regular text-sm">CI/NIT: {sug.ci_nit}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// CI/NIT Input
interface CiNitInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
}

export function CiNitInput({
  value,
  onChangeText,
  label = 'CI/NIT',
  placeholder = 'Ej: 12345678 (mínimo 8)',
  helperText = '(opcional, mín. 8 dígitos)',
}: CiNitInputProps) {
  return (
    <View className="mb-3">
      <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-1">
        {label} <Text className="text-xs font-poppins-regular">{helperText}</Text>
      </Text>
      <TextInput
        className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
        placeholder={placeholder}
        placeholderTextColor="#8B5A3C80"
        value={value}
        onChangeText={onChangeText}
        keyboardType="default"
        maxLength={20}
      />
    </View>
  );
}

// Teléfono Input
interface TelefonoInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
}

export function TelefonoInput({
  value,
  onChangeText,
  label = 'Teléfono',
  placeholder = '987654321',
}: TelefonoInputProps) {
  return (
    <View>
      <Text className="text-sm font-poppins-semibold text-[#8B5A3C] mb-1">
        {label} <Text className="text-xs font-poppins-regular">(opcional)</Text>
      </Text>
      <TextInput
        className="bg-[#F6EBD7] border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
        placeholder={placeholder}
        placeholderTextColor="#8B5A3C80"
        value={value}
        onChangeText={onChangeText}
        keyboardType="phone-pad"
      />
    </View>
  );
}
