import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Dimensions } from 'react-native';

// Constantes para padding mínimo garantizado en dispositivos con botones virtuales
const MIN_BOTTOM_PADDING_VIRTUAL_BUTTONS = 16;
const MIN_TAB_BAR_PADDING_VIRTUAL_BUTTONS = 8;

/**
 * Hook personalizado para detectar el tipo de navegación del dispositivo
 * Diferencia entre dispositivos que usan botones virtuales vs navegación gestual
 * 
 * En Android:
 * - Navegación gestual: insets.bottom >= 20 (barra gestual dentro de la app)
 * - Botones virtuales: insets.bottom < 20 (botones fuera del área de la app)
 * 
 * El problema en APK es que algunos dispositivos con botones virtuales
 * reportan insets.bottom = 0, lo que causa que el contenido quede tapado.
 */
export function useNavigationType() {
  const insets = useSafeAreaInsets();
  const { height } = Dimensions.get('window');

  // Solo aplica para Android, iOS siempre usa gestos
  if (Platform.OS === 'ios') {
    return {
      isGestural: true,
      hasVirtualButtons: false,
      tabBarElevation: 12,
      tabBarPaddingBottom: Math.max(insets.bottom - 8, 4),
      // Padding adicional para contenido en la parte inferior
      bottomContentPadding: Math.max(insets.bottom, 8),
      // Insets reales del sistema
      systemInsets: insets,
    };
  }

  // En Android, detectar el tipo de navegación
  // Si insets.bottom es muy bajo (< 20), probablemente usa botones virtuales
  // Si es alto (>= 20), probablemente usa navegación gestual
  const hasVirtualButtons = insets.bottom < 20;
  const isGestural = !hasVirtualButtons;

  // Para dispositivos con botones virtuales, garantizar un padding mínimo
  // ya que los botones ocupan espacio en la pantalla
  const guaranteedBottomPadding = hasVirtualButtons 
    ? Math.max(insets.bottom, MIN_BOTTOM_PADDING_VIRTUAL_BUTTONS)
    : insets.bottom;

  return {
    isGestural,
    hasVirtualButtons,
    // Mayor elevación para dispositivos con botones virtuales
    tabBarElevation: hasVirtualButtons ? 16 : 12,
    // Padding para el tab bar
    tabBarPaddingBottom: hasVirtualButtons 
      ? Math.max(insets.bottom, MIN_TAB_BAR_PADDING_VIRTUAL_BUTTONS)
      : Math.max(insets.bottom - 4, 8),
    // Padding garantizado para contenido en la parte inferior (usado en ScreenContainer)
    bottomContentPadding: guaranteedBottomPadding,
    // Insets reales del sistema (sin modificar)
    systemInsets: insets,
  };
}