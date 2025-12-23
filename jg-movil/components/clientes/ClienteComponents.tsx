import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Cliente } from './ClienteCard';

interface ClienteEmptyStateProps {
  searchQuery: string;
}

export function ClienteEmptyState({ searchQuery }: ClienteEmptyStateProps) {
  return (
    <View className="items-center justify-center py-12">
      <View className="bg-[#402612]/10 rounded-full p-4 mb-4">
        <Ionicons name="people-outline" size={48} color="#402612" />
      </View>
      <Text className="text-[#402612] font-poppins-semibold text-lg">
        No hay clientes
      </Text>
      <Text className="text-[#8B5A3C] font-poppins-regular text-center mt-2 px-8">
        {searchQuery ? 'No se encontraron resultados' : 'Agrega tu primer cliente'}
      </Text>
    </View>
  );
}

interface ClienteSearchBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
}

export function ClienteSearchBar({ searchQuery, onSearchChange }: ClienteSearchBarProps) {
  return (
    <View className="px-4 py-3">
      <View className="bg-white rounded-xl border border-[#E5E5E5] flex-row items-center px-4">
        <Ionicons name="search" size={20} color="#8B5A3C" />
        <TextInput
          className="flex-1 py-3 px-3 text-[#402612] font-poppins-regular"
          placeholder="Buscar cliente..."
          placeholderTextColor="#8B5A3C80"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={20} color="#8B5A3C" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

interface ClienteHeaderProps {
  onBack: () => void;
  onAdd: () => void;
}

export function ClienteHeader({ onBack, onAdd }: ClienteHeaderProps) {
  return (
    <View className="bg-[#402612] px-4 py-4 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <TouchableOpacity onPress={onBack} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#F6EBD7" />
        </TouchableOpacity>
        <Text className="text-xl font-poppins-semibold text-[#F6EBD7]">
          Gestión de Clientes
        </Text>
      </View>
      <TouchableOpacity
        onPress={onAdd}
        className="bg-[#F6EBD7] rounded-full p-2"
      >
        <Ionicons name="add" size={24} color="#402612" />
      </TouchableOpacity>
    </View>
  );
}

// Utility function to filter clients
export function filterClientes(clientes: Cliente[], searchQuery: string): Cliente[] {
  if (!searchQuery) return clientes;
  
  const query = searchQuery.toLowerCase();
  return clientes.filter(c => 
    c.nombrecliente.toLowerCase().includes(query) ||
    c.ci_nit?.toLowerCase().includes(query) ||
    c.telefono?.includes(searchQuery)
  );
}
