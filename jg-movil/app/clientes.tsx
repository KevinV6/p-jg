import { ConfirmModal } from '@/components/modales';
import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import { useVentas } from '@/contexts/VentasContext';
import { clienteService } from '@/services/clienteService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Cliente {
  idcliente: number;
  nombrecliente: string;
  ci_nit?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  estado: number;
}

export default function ClientesScreen() {
  const router = useRouter();
  const { loadClientes } = useVentas();
  const { showError, showSuccess, AlertComponent } = useCustomAlert();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal de formulario
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nombrecliente: '',
    ci_nit: '',
    telefono: '',
    direccion: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);

  // Modal de confirmación eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setIsLoading(true);
      const response = await clienteService.getAll();
      if (response.success && response.data) {
        setClientes(response.data);
      }
    } catch (error) {
      console.error('Error fetching clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClientes();
    setRefreshing(false);
  };

  const filteredClientes = clientes.filter(c => 
    c.nombrecliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ci_nit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.telefono?.includes(searchQuery)
  );

  const openFormModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombrecliente: cliente.nombrecliente,
        ci_nit: cliente.ci_nit || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        email: cliente.email || '',
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nombrecliente: '',
        ci_nit: '',
        telefono: '',
        direccion: '',
        email: '',
      });
    }
    setShowFormModal(true);
  };

  const handleSaveCliente = async () => {
    if (!formData.nombrecliente.trim()) {
      showError('Error', 'El nombre del cliente es requerido');
      return;
    }

    setSaving(true);
    try {
      if (editingCliente) {
        // Actualizar cliente existente
        const response = await clienteService.update(editingCliente.idcliente, {
          nombre: formData.nombrecliente,
          ci_nit: formData.ci_nit || undefined,
          telefono: formData.telefono || undefined,
          direccion: formData.direccion || undefined,
          email: formData.email || undefined,
        });
        
        if (response.success) {
          showSuccess('Éxito', 'Cliente actualizado correctamente', () => {
            setShowFormModal(false);
            fetchClientes();
            loadClientes();
          });
        } else {
          showError('Error', response.error || 'No se pudo actualizar el cliente');
        }
      } else {
        // Crear nuevo cliente
        const response = await clienteService.create({
          nombre: formData.nombrecliente,
          ci_nit: formData.ci_nit || 'S/N',
          telefono: formData.telefono || undefined,
          direccion: formData.direccion || undefined,
          email: formData.email || undefined,
        });
        
        if (response.success) {
          showSuccess('Éxito', 'Cliente creado correctamente', () => {
            setShowFormModal(false);
            fetchClientes();
            loadClientes();
          });
        } else {
          showError('Error', response.error || 'No se pudo crear el cliente');
        }
      }
    } catch (error) {
      showError('Error', 'Ocurrió un error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCliente = async () => {
    if (!clienteToDelete) return;

    try {
      const response = await clienteService.delete(clienteToDelete.idcliente);
      if (response.success) {
        showSuccess('Éxito', 'Cliente eliminado correctamente', () => {
          setShowDeleteModal(false);
          setClienteToDelete(null);
          fetchClientes();
          loadClientes();
        });
      } else {
        showError('Error', response.error || 'No se pudo eliminar el cliente');
      }
    } catch (error) {
      showError('Error', 'Ocurrió un error al eliminar');
    }
  };

  const renderCliente = ({ item }: { item: Cliente }) => (
    <TouchableOpacity
      onPress={() => openFormModal(item)}
      className="bg-white rounded-xl p-4 mb-3 border border-[#E5E5E5]"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-[#402612]/10 items-center justify-center mr-3">
          <Ionicons name="person" size={24} color="#402612" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-poppins-bold text-[#402612]">
            {item.nombrecliente}
          </Text>
          {item.ci_nit && item.ci_nit !== 'S/N' && (
            <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
              CI/NIT: {item.ci_nit}
            </Text>
          )}
          {item.telefono && (
            <Text className="text-sm font-poppins-regular text-[#8B5A3C]">
              Tel: {item.telefono}
            </Text>
          )}
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => openFormModal(item)}
            className="p-2 mr-2"
          >
            <Ionicons name="create-outline" size={20} color="#8B5A3C" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setClienteToDelete(item);
              setShowDeleteModal(true);
            }}
            className="p-2"
          >
            <Ionicons name="trash-outline" size={20} color="#FF5555" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer safeTop={false} statusBarStyle="light" statusBarColor="#402612">
      {/* Header */}
      <SafeHeader>
        <View className="bg-[#402612] px-4 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#F6EBD7" />
            </TouchableOpacity>
            <Text className="text-xl font-poppins-semibold text-[#F6EBD7]">
              Gestión de Clientes
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => openFormModal()}
            className="bg-[#F6EBD7] rounded-full p-2"
          >
            <Ionicons name="add" size={24} color="#402612" />
          </TouchableOpacity>
        </View>
      </SafeHeader>

      {/* Barra de búsqueda */}
      <View className="px-4 py-3">
        <View className="bg-white rounded-xl border border-[#E5E5E5] flex-row items-center px-4">
          <Ionicons name="search" size={20} color="#8B5A3C" />
          <TextInput
            className="flex-1 py-3 px-3 text-[#402612] font-poppins-regular"
            placeholder="Buscar cliente..."
            placeholderTextColor="#8B5A3C80"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#8B5A3C" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de clientes */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#402612" />
        </View>
      ) : (
        <FlatList
          data={filteredClientes}
          renderItem={renderCliente}
          keyExtractor={(item) => item.idcliente.toString()}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
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
          }
        />
      )}

      {/* Modal de Formulario */}
      <Modal
        visible={showFormModal}
        animationType="slide"
        transparent
        onRequestClose={() => !saving && setShowFormModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-[#F6EBD7] rounded-t-3xl max-h-[90%]">
              {/* Header del modal */}
              <View className="bg-[#402612] rounded-t-3xl px-4 py-4 flex-row items-center justify-between">
                <Text className="text-lg font-poppins-bold text-[#F6EBD7]">
                  {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                </Text>
                <TouchableOpacity onPress={() => !saving && setShowFormModal(false)}>
                  <Ionicons name="close" size={24} color="#F6EBD7" />
                </TouchableOpacity>
              </View>

              <ScrollView className="p-4" keyboardShouldPersistTaps="handled">
                {/* Nombre */}
                <View className="mb-4">
                  <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
                    Nombre *
                  </Text>
                  <TextInput
                    className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                    placeholder="Nombre del cliente"
                    placeholderTextColor="#8B5A3C80"
                    value={formData.nombrecliente}
                    onChangeText={(text) => setFormData({ ...formData, nombrecliente: text })}
                  />
                </View>

                {/* CI/NIT */}
                <View className="mb-4">
                  <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
                    CI/NIT
                  </Text>
                  <TextInput
                    className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                    placeholder="Número de CI o NIT"
                    placeholderTextColor="#8B5A3C80"
                    value={formData.ci_nit}
                    onChangeText={(text) => setFormData({ ...formData, ci_nit: text })}
                  />
                </View>

                {/* Teléfono */}
                <View className="mb-4">
                  <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
                    Teléfono
                  </Text>
                  <TextInput
                    className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                    placeholder="Número de teléfono"
                    placeholderTextColor="#8B5A3C80"
                    value={formData.telefono}
                    onChangeText={(text) => setFormData({ ...formData, telefono: text })}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Dirección */}
                <View className="mb-4">
                  <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
                    Dirección
                  </Text>
                  <TextInput
                    className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                    placeholder="Dirección del cliente"
                    placeholderTextColor="#8B5A3C80"
                    value={formData.direccion}
                    onChangeText={(text) => setFormData({ ...formData, direccion: text })}
                  />
                </View>

                {/* Email */}
                <View className="mb-4">
                  <Text className="text-sm font-poppins-semibold text-[#402612] mb-2">
                    Email
                  </Text>
                  <TextInput
                    className="bg-white border border-[#8B5A3C] rounded-xl px-4 py-3 text-[#402612] font-poppins-regular"
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor="#8B5A3C80"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Botón guardar */}
                <TouchableOpacity
                  onPress={handleSaveCliente}
                  disabled={saving}
                  className={`rounded-xl py-4 flex-row items-center justify-center mb-6 ${
                    saving ? 'bg-[#8B5A3C]/50' : 'bg-[#402612]'
                  }`}
                >
                  {saving ? (
                    <ActivityIndicator color="#F6EBD7" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={22} color="#F6EBD7" />
                      <Text className="text-[#F6EBD7] font-poppins-bold text-lg ml-2">
                        {editingCliente ? 'Actualizar' : 'Guardar'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de confirmación eliminar */}
      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setClienteToDelete(null);
        }}
        onConfirm={handleDeleteCliente}
        title="Eliminar Cliente"
        message={`¿Estás seguro de eliminar a "${clienteToDelete?.nombrecliente}"?`}
        data={{
          cliente: clienteToDelete?.nombrecliente || '',
          productos: 0,
          total: 0,
        }}
      />

      {/* Custom Alert Component */}
      <AlertComponent />
    </ScreenContainer>
  );
}
