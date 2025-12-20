import { Producto } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface ProductoCardProps {
  producto: Producto;
  onPress: () => void;
}

export const ProductoCard: React.FC<ProductoCardProps> = ({
  producto,
  onPress,
}) => {
  const hasStock =
    producto.unidades &&
    producto.unidades.length > 0 &&
    typeof producto.unidades[0].stock === 'number';
  const isLowStock = hasStock && producto.unidades![0].stock! <= 10;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-3 flex-row"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Contenedor de Imagen con padding */}
      <View className="p-2 justify-center">
        <View className="relative rounded-xl overflow-hidden">
          <Image
            source={{ uri: producto.imagen }}
            style={{ width: 70, height: 70 }}
            resizeMode="cover"
          />
          {/* Badge de stock bajo */}
          {isLowStock && (
            <View className="absolute top-1 left-1 bg-orange-500 rounded-full w-2 h-2" />
          )}
        </View>
      </View>

      {/* Información */}
      <View className="flex-1 p-3">
        {/* Nombre */}
        <Text
          className="text-base font-poppins-bold text-[#3d2b1f] mb-1"
          numberOfLines={2}
        >
          {producto.nombreproducto}
        </Text>

        {/* Categoría */}
        <Text className="text-xs text-[#8B5A3C] font-poppins-medium mb-1.5">
          {producto.categoria?.nombrecategoria}
        </Text>

        {/* Descripción */}
        {producto.descripcion && (
          <Text
            className="text-xs text-gray-500 font-poppins mb-2"
            numberOfLines={2}
          >
            {producto.descripcion}
          </Text>
        )}

        {/* Unidades/Precios */}
        {producto.unidades && producto.unidades.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5">
            {producto.unidades.map((unidad, index) => (
              <View
                key={index}
                className="bg-[#F6EBD7] px-2 py-1 rounded-lg flex-row items-center"
              >
                <Text className="text-sm font-poppins-bold text-[#402612]">
                  Bs {unidad.precio.toFixed(2)}
                </Text>
                <Text className="text-xs font-poppins-medium text-[#8B5A3C] ml-1">
                  / {unidad.unidad?.abreviatura}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Icono de flecha */}
      <View className="justify-center pr-3">
        <Ionicons name="chevron-forward" size={20} color="#E8DFD4" />
      </View>
    </TouchableOpacity>
  );
};
