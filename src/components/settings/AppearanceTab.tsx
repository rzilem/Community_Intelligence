
import React from 'react';
import { AppearanceSettings } from '@/types/settings-types';
import ThemeSettingsCard from '@/components/settings/appearance/ThemeSettingsCard';
import ColorSchemeSettingsCard from '@/components/settings/appearance/ColorSchemeSettingsCard';
import DensitySettingsCard from '@/components/settings/appearance/DensitySettingsCard';
import TextSizeSettingsCard from '@/components/settings/appearance/TextSizeSettingsCard';
import AdditionalOptionsCard from '@/components/settings/appearance/AdditionalOptionsCard';

interface AppearanceTabProps {
  settings: AppearanceSettings;
  onChange: (settings: Partial<AppearanceSettings>) => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({ settings, onChange }) => {
  return (
    <div className="space-y-6">
      <ThemeSettingsCard 
        value={settings.theme}
        onChange={(theme) => onChange({ theme })}
      />
      
      <ColorSchemeSettingsCard 
        value={settings.colorScheme}
        onChange={(colorScheme) => onChange({ colorScheme })}
      />
      
      <DensitySettingsCard 
        value={settings.density}
        onChange={(density) => onChange({ density })}
      />
      
      <TextSizeSettingsCard 
        value={settings.fontScale}
        onChange={(fontScale) => onChange({ fontScale })}
      />
      
      <AdditionalOptionsCard 
        animationsEnabled={settings.animationsEnabled}
        onChange={(checked) => onChange({ animationsEnabled: checked })}
      />
    </div>
  );
};

export default AppearanceTab;
