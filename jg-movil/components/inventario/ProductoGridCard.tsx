import { Producto } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface ProductoGridCardProps {
  producto: Producto;
  onPress: () => void;
}

export const ProductoGridCard: React.FC<ProductoGridCardProps> = ({
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
      className="bg-white rounded-2xl overflow-hidden m-1.5"
      style={{
        flex: 1,
        maxWidth: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Imagen */}
      <View className="relative">
        <Image
          source={{ uri: producto.imagen }}
          style={{ width: '100%', height: 140 }}
          resizeMode="cover"
        />
        {/* Badge de stock */}
        {hasStock && (
          <View
            className={`absolute top-2 right-2 px-2 py-1 rounded-full ${
              isLowStock ? 'bg-orange-500' : 'bg-green-500'
            }`}
          >
            <Text className="text-xs font-poppins-bold text-white">
              {producto.unidades![0].stock}
            </Text>
          </View>
        )}
        {/* Indicador de stock bajo */}
        {isLowStock && (
          <View className="absolute top-2 left-2 bg-orange-500/90 px-2 py-1 rounded-full flex-row items-center">
            <Ionicons name="warning" size={10} color="white" />
            <Text className="text-[10px] font-poppins-bold text-white ml-1">
              Bajo
            </Text>
          </View>
        )}
      </View>

      {/* Información */}
      <View className="p-3">
        <Text
          className="text-sm font-poppins-bold text-[#3d2b1f] mb-1"
          numberOfLines={2}
        >
          {producto.nombreproducto}
        </Text>

        <Text className="text-xs text-[#8B5A3C] font-poppins-medium mb-1.5" numberOfLines={1}>
          {producto.categoria?.nombrecategoria}
        </Text>

        {/* Descripción */}
        {producto.descripcion && (
          <Text
            className="text-[10px] text-gray-500 font-poppins mb-2"
            numberOfLines={2}
          >
            {producto.descripcion}
          </Text>
        )}

        {/* Unidades/Precios */}
        {producto.unidades && producto.unidades.length > 0 && (
          <View className="flex-col gap-1.5">
            {producto.unidades.slice(0, 2).map((unidad, index) => (
              <View
                key={index}
                className="bg-[#F6EBD7] px-2 py-1 rounded-lg flex-row items-center justify-between"
              >
                <Text className="text-xs font-poppins-bold text-[#402612]">
                  Bs {unidad.precio.toFixed(2)}
                </Text>
                <Text className="text-[10px] font-poppins-medium text-[#8B5A3C]">
                  / {unidad.unidad?.abreviatura}
                </Text>
              </View>
            ))}
            {producto.unidades.length > 2 && (
              <Text className="text-[9px] text-gray-400 font-poppins-medium text-center">
                +{producto.unidades.length - 2} más
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
