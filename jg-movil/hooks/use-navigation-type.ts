import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

/**
 * Hook personalizado para detectar el tipo de navegación del dispositivo
 * Diferencia entre dispositivos que usan botones virtuales vs navegación gestual
 */
export function useNavigationType() {
  const insets = useSafeAreaInsets();

  // Solo aplica para Android, iOS siempre usa gestos
  if (Platform.OS === 'ios') {
    return {
      isGestural: true,
      hasVirtualButtons: false,
      tabBarElevation: 12, // Elevación menor para iOS
      tabBarPaddingBottom: Math.max(insets.bottom - 8, 4), // Usar zona segura pero con ajuste
    };
  }

  // En Android, si el inset bottom es muy bajo (< 20), probablemente usa botones virtuales
  // Si es alto (>= 20), probablemente usa navegación gestual
  const hasVirtualButtons = insets.bottom < 20;
  const isGestural = !hasVirtualButtons;

  return {
    isGestural,
    hasVirtualButtons,
    // Mayor elevación para dispositivos con botones virtuales
    tabBarElevation: hasVirtualButtons ? 16 : 12,
    // Padding diferenciado según el tipo de navegación
    tabBarPaddingBottom: hasVirtualButtons 
      ? 12  // Más padding para botones virtuales
      : Math.max(insets.bottom - 4, 8), // Menos padding para gestos, respetando zona segura
  };
}