import {
  InventarioHeader,
  ProductoCard,
  ProductoGridCard,
  SearchBar,
} from '@/components/inventario';
import { AppHeader } from '@/components/shared/AppHeader';
import { EmptyState, FloatingActionButton } from '@/components/shared/CommonComponents';
import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { useInventario } from '@/contexts/InventarioContext';
import { Producto } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';

type ViewMode = 'list' | 'grid';

export default function InventarioScreen() {
  const router = useRouter();
  const { productos, categorias, unidades, searchProductos, isLoading, refresh } = useInventario();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Debug: Log para verificar estructura de datos cuando cambia el filtro de unidad
  useEffect(() => {
    if (selectedUnit && productos.length > 0) {
      console.log('=== DEBUG FILTRO DE UNIDAD ===');
      console.log('Unidad seleccionada:', selectedUnit);
      console.log('Tipo de selectedUnit:', typeof selectedUnit);
      
      // Verificar primer producto con unidades
      const productoConUnidades = productos.find(p => p.unidades && p.unidades.length > 0);
      if (productoConUnidades) {
        console.log('Ejemplo de producto con unidades:', productoConUnidades.nombreproducto);
        console.log('Unidades del producto:', JSON.stringify(productoConUnidades.unidades, null, 2));
        
        if (productoConUnidades.unidades && productoConUnidades.unidades.length > 0) {
          const primeraUnidad = productoConUnidades.unidades[0];
          console.log('Primera unidad - unidadid:', primeraUnidad.unidadid, 'tipo:', typeof primeraUnidad.unidadid);
          console.log('Primera unidad - unidad?.idunidad:', primeraUnidad.unidad?.idunidad, 'tipo:', typeof primeraUnidad.unidad?.idunidad);
        }
      }
      console.log('==============================');
    }
  }, [selectedUnit, productos]);

  const getFilteredProductos = () => {
    let result = searchQuery ? searchProductos(searchQuery) : productos;
    
    if (selectedCategory) {
      result = result.filter(p => p.categoriaid === selectedCategory);
    }
    
    if (selectedUnit) {
      result = result.filter(p => {
        // Verificar si el producto tiene unidades asignadas
        if (!p.unidades || p.unidades.length === 0) {
          return false;
        }
        // ProductoUnidad tiene una propiedad 'unidad' anidada con el idunidad
        // También tiene una propiedad directa 'unidadid'
        return p.unidades.some(productounidad => {
          // Verificar tanto unidadid directo como unidad.idunidad anidado
          return productounidad.unidadid === selectedUnit || 
                 productounidad.unidad?.idunidad === selectedUnit;
        });
      });
    }
    
    return result;
  };

  const filteredProductos = getFilteredProductos();

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedUnit(null);
    setSearchQuery('');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderProductoList = ({ item }: { item: Producto }) => (
    <ProductoCard
      producto={item}
      onPress={() => router.push(`/producto-form?id=${item.idproducto}`)}
    />
  );

  const renderProductoGrid = ({ item }: { item: Producto }) => (
    <ProductoGridCard
      producto={item}
      onPress={() => router.push(`/producto-form?id=${item.idproducto}`)}
    />
  );

  return (
    <ScreenContainer safeTop={false} hasTabBar={true}>
      <AppHeader title="Inventario" onNotificationPress={() => {}} />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar productos..."
      />

      {/* Filtros */}
      <View className="flex-row gap-2 px-4 mb-4">
        <TouchableOpacity
          onPress={() => setShowCategoryModal(true)}
          className={`flex-1 px-3 py-2 rounded-xl border flex-row items-center justify-between ${
            selectedCategory 
              ? 'bg-[#402612] border-[#402612]' 
              : 'bg-white border-[#8B5A3C]'
          }`}
        >
          <Text className={`text-sm font-poppins-regular ${
            selectedCategory ? 'text-white' : 'text-[#402612]'
          }`}>
            {selectedCategory 
              ? categorias.find(c => c.idcategoria === selectedCategory)?.nombrecategoria
              : 'Categoría'
            }
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={selectedCategory ? '#F6EBD7' : '#8B5A3C'} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowUnitModal(true)}
          className={`flex-1 px-3 py-2 rounded-xl border flex-row items-center justify-between ${
            selectedUnit 
              ? 'bg-[#402612] border-[#402612]' 
              : 'bg-white border-[#8B5A3C]'
          }`}
        >
          <Text className={`text-sm font-poppins-regular ${
            selectedUnit ? 'text-white' : 'text-[#402612]'
          }`}>
            {selectedUnit 
              ? unidades.find(u => u.idunidad === selectedUnit)?.abreviatura
              : 'Unidad'
            }
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={selectedUnit ? '#F6EBD7' : '#8B5A3C'} 
          />
        </TouchableOpacity>

        {(selectedCategory || selectedUnit || searchQuery) && (
          <TouchableOpacity
            onPress={clearFilters}
            className="px-3 py-2 bg-[#D32F2F] rounded-xl justify-center"
          >
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <InventarioHeader
        totalProductos={filteredProductos.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <FlatList
        key={viewMode}
        data={filteredProductos}
        keyExtractor={(item) => item.idproducto.toString()}
        renderItem={viewMode === 'list' ? renderProductoList : renderProductoGrid}
        numColumns={viewMode === 'grid' ? 2 : 1}
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingBottom: 100,
          flexGrow: 1 
        }}
        columnWrapperStyle={viewMode === 'grid' ? { gap: 12 } : undefined}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          isLoading ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#402612" />
            </View>
          ) : (
            <EmptyState
              icon="cube-outline"
              title="No hay productos"
              subtitle="Agrega tu primer producto al inventario"
            />
          )
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <FloatingActionButton
        onPress={() => router.push('/producto-form')}
        icon="add"
      />

      {/* Modal Filtro Categorías */}
      <Modal
        visible={showCategoryModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm max-h-[70%]">
            <View className="bg-[#402612] rounded-t-2xl px-4 py-4 flex-row items-center justify-between">
              <Text className="text-lg font-poppins-bold text-[#F6EBD7]">
                Filtrar por Categoría
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#F6EBD7" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[{ idcategoria: 0, nombrecategoria: 'Todas las categorías' }, ...categorias]}
              keyExtractor={(item) => item.idcategoria.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(item.idcategoria === 0 ? null : item.idcategoria);
                    setShowCategoryModal(false);
                  }}
                  className={`mx-4 my-2 rounded-xl p-4 flex-row items-center justify-between border-2 ${
                    (selectedCategory === item.idcategoria) || (item.idcategoria === 0 && !selectedCategory)
                      ? 'border-[#402612] bg-[#402612]/10'
                      : 'border-[#8B5A3C]/30 bg-white'
                  }`}
                >
                  <Text className={`text-base font-poppins-semibold ${
                    (selectedCategory === item.idcategoria) || (item.idcategoria === 0 && !selectedCategory)
                      ? 'text-[#402612]' 
                      : 'text-[#3d2b1f]'
                  }`}>
                    {item.nombrecategoria}
                  </Text>
                  {((selectedCategory === item.idcategoria) || (item.idcategoria === 0 && !selectedCategory)) && (
                    <Ionicons name="checkmark-circle" size={24} color="#402612" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal Filtro Unidades */}
      <Modal
        visible={showUnitModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowUnitModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-[#F6EBD7] rounded-2xl w-full max-w-sm max-h-[70%]">
            <View className="bg-[#402612] rounded-t-2xl px-4 py-4 flex-row items-center justify-between">
              <Text className="text-lg font-poppins-bold text-[#F6EBD7]">
                Filtrar por Unidad
              </Text>
              <TouchableOpacity onPress={() => setShowUnitModal(false)}>
                <Ionicons name="close" size={24} color="#F6EBD7" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[{ idunidad: 0, nombre: 'Todas las unidades', abreviatura: 'Todas' }, ...unidades]}
              keyExtractor={(item) => item.idunidad.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedUnit(item.idunidad === 0 ? null : item.idunidad);
                    setShowUnitModal(false);
                  }}
                  className={`mx-4 my-2 rounded-xl p-4 flex-row items-center justify-between border-2 ${
                    (selectedUnit === item.idunidad) || (item.idunidad === 0 && !selectedUnit)
                      ? 'border-[#402612] bg-[#402612]/10'
                      : 'border-[#8B5A3C]/30 bg-white'
                  }`}
                >
                  <Text className={`text-base font-poppins-semibold ${
                    (selectedUnit === item.idunidad) || (item.idunidad === 0 && !selectedUnit)
                      ? 'text-[#402612]' 
                      : 'text-[#3d2b1f]'
                  }`}>
                    {item.nombre} ({item.abreviatura})
                  </Text>
                  {((selectedUnit === item.idunidad) || (item.idunidad === 0 && !selectedUnit)) && (
                    <Ionicons name="checkmark-circle" size={24} color="#402612" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
