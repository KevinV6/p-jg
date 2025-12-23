import { ConfirmModal } from '@/components/modales';
import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { useCustomAlert } from '@/components/shared/CustomAlert';
import { 
  Cliente,
  ClienteCard, 
  ClienteEmptyState, 
  ClienteFormData,
  ClienteFormModal, 
  ClienteHeader, 
  ClienteSearchBar,
  ClienteListSkeleton,
  filterClientes 
} from '@/components/clientes';
import { useVentas } from '@/contexts/VentasContext';
import { clienteService } from '@/services/clienteService';
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

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
  const [formData, setFormData] = useState<ClienteFormData>({
    nombrecliente: '',
    ci_nit: '',
    telefono: '',
    direccion: '',
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

  const filteredClientes = filterClientes(clientes, searchQuery);

  const openFormModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombrecliente: cliente.nombrecliente,
        ci_nit: cliente.ci_nit || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nombrecliente: '',
        ci_nit: '',
        telefono: '',
        direccion: '',
      });
    }
    setShowFormModal(true);
  };

  const handleSaveCliente = async () => {
    if (!formData.nombrecliente.trim()) {
      showError('Error', 'El nombre del cliente es requerido');
      return;
    }

    // Validar CI/NIT si se proporciona
    const ciNitTrimmed = formData.ci_nit.trim();
    if (ciNitTrimmed && ciNitTrimmed.length < 8) {
      showError('CI/NIT Inválido', 'El CI/NIT debe tener al menos 8 dígitos');
      return;
    }

    // Validar teléfono si se proporciona (mínimo 8 dígitos)
    const telefonoTrimmed = formData.telefono.trim().replace(/\D/g, '');
    if (formData.telefono.trim() && telefonoTrimmed.length < 8) {
      showError('Teléfono Inválido', 'El teléfono debe tener al menos 8 dígitos');
      return;
    }

    setSaving(true);
    try {
      if (editingCliente) {
        const response = await clienteService.update(editingCliente.idcliente, {
          nombre: formData.nombrecliente,
          ci_nit: ciNitTrimmed || undefined,
          telefono: formData.telefono || undefined,
          direccion: formData.direccion || undefined,
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
        const response = await clienteService.create({
          nombre: formData.nombrecliente,
          ci_nit: ciNitTrimmed || '',
          telefono: formData.telefono || undefined,
          direccion: formData.direccion || undefined,
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

  const handleEditCliente = (cliente: Cliente) => {
    openFormModal(cliente);
  };

  const handleDeleteRequest = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setShowDeleteModal(true);
  };

  const handleViewHistory = (cliente: Cliente) => {
    router.push(`/cliente-historial?id=${cliente.idcliente}&nombre=${encodeURIComponent(cliente.nombrecliente)}`);
  };

  return (
    <ScreenContainer safeTop={false} statusBarStyle="light" statusBarColor="#402612">
      {/* Header */}
      <SafeHeader>
        <ClienteHeader 
          onBack={() => router.back()} 
          onAdd={() => openFormModal()} 
        />
      </SafeHeader>

      {/* Barra de búsqueda */}
      <ClienteSearchBar 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />

      {/* Lista de clientes */}
      {isLoading ? (
        <ClienteListSkeleton count={6} />
      ) : (
        <FlatList
          data={filteredClientes}
          renderItem={({ item }) => (
            <ClienteCard 
              cliente={item} 
              onEdit={handleEditCliente}
              onDelete={handleDeleteRequest}
              onViewHistory={handleViewHistory}
            />
          )}
          keyExtractor={(item) => item.idcliente.toString()}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={<ClienteEmptyState searchQuery={searchQuery} />}
        />
      )}

      {/* Modal de Formulario */}
      <ClienteFormModal
        visible={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveCliente}
        editingCliente={editingCliente}
        formData={formData}
        setFormData={setFormData}
        saving={saving}
      />

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
