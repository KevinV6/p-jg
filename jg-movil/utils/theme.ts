// Hook para obtener clases de tema dinámicas con diseño futurista
export function useThemeColors(isDark: boolean) {
  return {
    // Backgrounds
    bgPrimary: isDark ? 'bg-dark-background' : 'bg-light-background',
    bgSecondary: isDark ? 'bg-dark-surface' : 'bg-light-surface',
    bgTertiary: isDark ? 'bg-dark-surfaceAlt' : 'bg-light-surfaceAlt',
    bgCard: isDark ? 'bg-dark-card' : 'bg-light-card',
    bgCardAlt: isDark ? 'bg-dark-cardAlt' : 'bg-light-cardAlt',
    
    // Text
    textPrimary: isDark ? 'text-dark-text' : 'text-light-text',
    textSecondary: isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary',
    textTertiary: isDark ? 'text-dark-textTertiary' : 'text-light-textTertiary',
    
    // Borders
    border: isDark ? 'border-dark-border' : 'border-light-border',
    borderLight: isDark ? 'border-dark-borderLight' : 'border-light-borderLight',
    
    // Colors (raw values for style prop)
    colors: {
      // Backgrounds
      background: isDark ? '#0A0D14' : '#F0F4F8',
      surface: isDark ? '#121820' : '#FFFFFF',
      surfaceAlt: isDark ? '#1A2332' : '#E5EBF1',
      card: isDark ? '#141B27' : '#FFFFFF',
      cardAlt: isDark ? '#1E2938' : '#F8FAFC',
      
      // Text colors
      text: isDark ? '#F7FAFC' : '#1A202C',
      textSecondary: isDark ? '#E2E8F0' : '#2D3748',
      textTertiary: isDark ? '#CBD5E0' : '#4A5568',
      
      // Border colors
      border: isDark ? '#2D3748' : '#CBD5E0',
      borderLight: isDark ? '#1A2332' : '#E2E8F0',
      
      // Shadow colors
      shadow: isDark ? 'rgba(0, 217, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
      shadowStrong: isDark ? 'rgba(0, 217, 255, 0.25)' : 'rgba(0, 0, 0, 0.12)',
      glow: isDark ? 'rgba(0, 217, 255, 0.3)' : 'rgba(0, 217, 255, 0.1)',
      
      // Brand colors
      primary: '#2563EB',
      primaryLight: '#60A5FA',
      primaryDark: '#1D4ED8',
      
      secondary: '#7C3AED',
      secondaryLight: '#A78BFA',
      secondaryDark: '#6D28D9',
      
      accent: '#06B6D4',
      accentLight: '#22D3EE',
      accentDark: '#0891B2',
      
      // Semantic colors
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#06B6D4',
      
      // Special effects
      gradientStart: isDark ? '#2563EB' : '#2563EB',
      gradientEnd: isDark ? '#7C3AED' : '#7C3AED',
    },
  };
}
