
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSettingsCard from '@/components/settings/appearance/ThemeSettingsCard';
import ColorSchemeSettingsCard from '@/components/settings/appearance/ColorSchemeSettingsCard';
import DensitySettingsCard from '@/components/settings/appearance/DensitySettingsCard';
import TextSizeSettingsCard from '@/components/settings/appearance/TextSizeSettingsCard';
import AdditionalOptionsCard from '@/components/settings/appearance/AdditionalOptionsCard';
import { AppearanceSettings } from '@/types/settings-types';

const AppearanceTab: React.FC = () => {
  const { settings, updateSettings, isLoading } = useTheme();

  const handleChange = (newSettings: Partial<AppearanceSettings>) => {
    updateSettings(newSettings);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-6"></div>
          <div className="h-32 bg-muted rounded-lg mb-6"></div>
          <div className="h-32 bg-muted rounded-lg mb-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ThemeSettingsCard 
        value={settings.theme}
        onChange={(theme) => handleChange({ theme })}
      />
      
      <ColorSchemeSettingsCard 
        value={settings.colorScheme}
        onChange={(colorScheme) => handleChange({ colorScheme })}
      />
      
      <DensitySettingsCard 
        value={settings.density}
        onChange={(density) => handleChange({ density })}
      />
      
      <TextSizeSettingsCard 
        value={settings.fontScale}
        onChange={(fontScale) => handleChange({ fontScale })}
      />
      
      <AdditionalOptionsCard 
        animationsEnabled={settings.animationsEnabled}
        onChange={(animationsEnabled) => handleChange({ animationsEnabled })}
      />
    </div>
  );
};

export default AppearanceTab;
