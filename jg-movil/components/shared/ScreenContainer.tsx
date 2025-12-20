import React from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  /** Color de fondo del contenedor */
  backgroundColor?: string;
  /** Si debe aplicar padding en la parte superior (zona segura) */
  safeTop?: boolean;
  /** Si debe aplicar padding en la parte inferior (zona segura) */
  safeBottom?: boolean;
  /** Color de fondo para la zona segura superior (StatusBar) */
  statusBarColor?: string;
  /** Estilo del StatusBar: 'light' | 'dark' */
  statusBarStyle?: 'light' | 'dark';
  /** Clases adicionales de Tailwind */
  className?: string;
  /** Si tiene un header oscuro que necesita padding superior separado */
  hasDarkHeader?: boolean;
}

/**
 * Componente contenedor para pantallas que maneja la zona segura de manera consistente.
 * Usa useSafeAreaInsets para aplicar el padding correcto sin causar "saltos" visuales.
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  backgroundColor = '#F6EBD7',
  safeTop = true,
  safeBottom = true,
  statusBarColor,
  statusBarStyle = 'dark',
  className = '',
  hasDarkHeader = false,
}) => {
  const insets = useSafeAreaInsets();

  // Si tiene header oscuro, aplicamos el padding top al header, no al contenedor
  const paddingTop = safeTop && !hasDarkHeader ? insets.top : 0;

  return (
    <View
      className={`flex-1 ${className}`}
      style={{
        backgroundColor,
        paddingTop,
        paddingBottom: safeBottom ? insets.bottom : 0,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <StatusBar
        barStyle={statusBarStyle === 'light' ? 'light-content' : 'dark-content'}
        backgroundColor={statusBarColor || (hasDarkHeader ? '#402612' : backgroundColor)}
        translucent={Platform.OS === 'android'}
      />
      {hasDarkHeader ? (
        <View style={{ paddingTop: insets.top, backgroundColor: '#402612' }}>
          {/* El primer hijo debería ser el header oscuro */}
        </View>
      ) : null}
      {children}
    </View>
  );
};

/**
 * Header con zona segura para pantallas con header oscuro personalizado
 */
interface SafeHeaderProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

export const SafeHeader: React.FC<SafeHeaderProps> = ({
  children,
  backgroundColor = '#402612',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top, backgroundColor }}>
      {children}
    </View>
  );
};

export default ScreenContainer;
