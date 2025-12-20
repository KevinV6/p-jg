// Paleta de colores profesional para la aplicación JG

export const Colors = {
  // Azul corporativo principal
  primary: '#3B82F6',
  primaryDark: '#1E40AF',
  primaryLight: '#60A5FA',
  primaryLighter: '#DBEAFE',
  
  // Púrpura secundario
  secondary: '#8B5CF6',
  secondaryDark: '#5B21B6',
  secondaryLight: '#A78BFA',
  secondaryLighter: '#EDE9FE',
  
  // Gris oscuro para acentos
  accent: '#0F172A',
  accentDark: '#0F172A',
  accentLight: '#475569',
  accentLighter: '#E2E8F0',
  
  // Rojo para errores/cancelaciones
  danger: '#EF4444',
  dangerDark: '#b91c1c',
  dangerLight: '#f87171',
  dangerLighter: '#fee2e2',
  
  // Colores de estado semánticos
  warning: '#F59E0B',
  info: '#3B82F6',
  success: '#059669',
  error: '#dc2626',
  
  // Fondos
  background: '#f8fafc',
  backgroundSecondary: '#f1f5f9',
  backgroundDark: '#0f172a',
  backgroundDarkSecondary: '#1e293b',
  
  // Textos
  text: '#0f172a',
  textSecondary: '#475569',
  textLight: '#94a3b8',
  textDark: '#ffffff',
  textDarkSecondary: '#cbd5e1',
  
  // Bordes
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderDark: '#334155',
  
  // Tarjetas y superficies
  card: '#ffffff',
  cardDark: '#1e293b',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  
  shadow: '#000000',
  overlay: 'rgba(15, 23, 42, 0.5)',
  
  // Estados específicos
  pending: '#f59e0b',
  confirmed: '#059669',
  cancelled: '#dc2626',
  paid: '#059669',
  overdue: '#dc2626',
  
  white: '#ffffff',
  black: '#000000',
  disabled: '#cbd5e1',
};

export const Shadows = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
