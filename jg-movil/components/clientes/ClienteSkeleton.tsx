import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

// Componente base para el efecto de shimmer
const SkeletonPulse = ({ style }: { style?: any }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: '#8B5A3C40',
          borderRadius: 8,
        },
        style,
        { opacity },
      ]}
    />
  );
};

// Skeleton para una tarjeta de cliente individual
export function ClienteCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 mx-4 border border-[#E8DFD4]">
      <View className="flex-row items-center">
        {/* Avatar skeleton */}
        <SkeletonPulse style={{ width: 50, height: 50, borderRadius: 25 }} />
        
        {/* Info skeleton */}
        <View className="flex-1 ml-3">
          <SkeletonPulse style={{ width: '70%', height: 18, marginBottom: 8 }} />
          <SkeletonPulse style={{ width: '50%', height: 14, marginBottom: 4 }} />
          <SkeletonPulse style={{ width: '40%', height: 14 }} />
        </View>

        {/* Actions skeleton */}
        <View className="flex-row gap-2">
          <SkeletonPulse style={{ width: 36, height: 36, borderRadius: 18 }} />
          <SkeletonPulse style={{ width: 36, height: 36, borderRadius: 18 }} />
          <SkeletonPulse style={{ width: 36, height: 36, borderRadius: 18 }} />
        </View>
      </View>
    </View>
  );
}

// Lista de skeletons para la pantalla de clientes
export function ClienteListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View className="pt-4">
      {/* Search bar skeleton */}
      <View className="mx-4 mb-4">
        <SkeletonPulse style={{ width: '100%', height: 48, borderRadius: 12 }} />
      </View>
      
      {/* Cards skeleton */}
      {Array.from({ length: count }).map((_, index) => (
        <ClienteCardSkeleton key={index} />
      ))}
    </View>
  );
}

export default ClienteListSkeleton;
