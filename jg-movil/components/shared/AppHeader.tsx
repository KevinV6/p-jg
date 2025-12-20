import React from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  title: string;
  onNotificationPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, onNotificationPress }) => {
  const { user } = useAuth();

  return (
    <SafeAreaView edges={['top']} className="bg-[#51453C]">
      <StatusBar 
        barStyle="light-content"
        backgroundColor="#51453C"
      />
      <View 
        className="bg-[#51453C]"
        style={{ 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <View className="flex-row items-center justify-between px-5 py-4">
          {/* Usuario Info */}
          <View className="flex-row items-center flex-1">
            <View 
              className="w-11 h-11 rounded-full justify-center items-center mr-3 overflow-hidden bg-[#402612]"
              style={{ 
                shadowColor: '#402612',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              {user?.photo ? (
                <Image source={{ uri: user.photo }} className="w-full h-full" />
              ) : (
                <Text className="text-white text-base font-poppins-bold">
                  {user?.primernombre?.[0]}{user?.apellidopaterno?.[0]}
                </Text>
              )}
            </View>
            <View>
              <Text className="text-base font-poppins-bold text-white">
                {user?.primernombre} {user?.apellidopaterno}
              </Text>
              <Text className="text-xs font-poppins text-[#F6EBD7] uppercase tracking-wider">
                {user?.rol}
              </Text>
            </View>
          </View>

          {/* Título */}
          <View className="flex-1 items-center">
            <Text 
              className="text-xl font-poppins-bold text-white tracking-tight"
              style={{ letterSpacing: -0.5 }}
            >
              {title}
            </Text>
          </View>

          {/* Notificaciones */}
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-[#402612] justify-center items-center relative"
            style={{
              shadowColor: '#402612',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 3,
            }}
            onPress={onNotificationPress}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color="#F6EBD7" />
            <View 
              className="absolute -top-1 -right-1 bg-orange-500 rounded-full min-w-[20px] h-[20px] justify-center items-center px-1.5"
              style={{ 
                shadowColor: '#F97316',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text className="text-white text-[10px] font-poppins-bold">3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
