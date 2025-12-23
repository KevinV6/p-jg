import { SafeHeader, ScreenContainer } from '@/components/shared/ScreenContainer';
import { 
  ColorPreviewSection, 
  ConfigHeader, 
  InfoSection, 
  SettingsSection, 
  ThemeToggleCard 
} from '@/components/configuracion';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function ConfiguracionScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <ScreenContainer safeTop={false} statusBarStyle="light" statusBarColor="#51453C">
      {/* Header */}
      <SafeHeader backgroundColor="#51453C">
        <ConfigHeader onBack={() => router.back()} />
      </SafeHeader>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Sección Apariencia */}
        <SettingsSection title="Apariencia">
          <ThemeToggleCard isDark={isDark} onToggle={toggleTheme} />
        </SettingsSection>

        {/* Sección Información */}
        <SettingsSection title="Información">
          <InfoSection />
        </SettingsSection>

        {/* Vista Previa de Colores */}
        <View className="mb-8">
          <SettingsSection title="Vista Previa de Colores">
            <ColorPreviewSection />
          </SettingsSection>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
