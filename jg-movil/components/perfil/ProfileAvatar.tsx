import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';

// Types
interface Usuario {
  idusuario?: number;
  nombreusuario?: string;
  primernombre?: string;
  apellidopaterno?: string;
  apellidomaterno?: string;
  email?: string;
  rol?: string;
  photo?: string;
}

// Profile Avatar Component
interface ProfileAvatarProps {
  user: Usuario;
  onPress: () => void;
  uploading: boolean;
}

export function ProfileAvatar({ user, onPress, uploading }: ProfileAvatarProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={uploading}
    >
      <View 
        className="w-28 h-28 rounded-3xl justify-center items-center mb-4 overflow-hidden"
        style={{ 
          shadowColor: '#402612',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {user.photo ? (
          <>
            <Image
              source={{ uri: user.photo }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {uploading && (
              <View className="absolute inset-0 bg-black/50 justify-center items-center">
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
          </>
        ) : (
          <LinearGradient
            colors={['#402612', '#8B5A3C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full h-full justify-center items-center"
          >
            {uploading ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Ionicons name="person" size={50} color="#FFFFFF" />
            )}
          </LinearGradient>
        )}
      </View>
      
      {/* Botón de cámara */}
      <View 
        className="absolute bottom-2 right-0 bg-[#402612] rounded-full p-2"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Ionicons name="camera" size={16} color="#F6EBD7" />
      </View>
    </TouchableOpacity>
  );
}
