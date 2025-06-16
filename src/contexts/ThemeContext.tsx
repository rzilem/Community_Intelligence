
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppearanceSettings } from '@/types/settings-types';
import { useSystemSetting, useUpdateSystemSetting } from '@/hooks/settings/use-system-settings';

interface ThemeContextType {
  settings: AppearanceSettings;
  updateSettings: (newSettings: Partial<AppearanceSettings>) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { data: settings, isLoading } = useSystemSetting<AppearanceSettings>('appearance');
  const updateSettingsMutation = useUpdateSystemSetting<AppearanceSettings>('appearance');
  
  // Apply settings to DOM whenever they change
  useEffect(() => {
    if (!settings) return;
    
    applyThemeSettings(settings);
  }, [settings]);

  const updateSettings = async (newSettings: Partial<AppearanceSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    
    // Apply immediately for instant feedback
    applyThemeSettings(updatedSettings);
    
    // Then persist to database
    await updateSettingsMutation.mutateAsync(updatedSettings);
  };

  return (
    <ThemeContext.Provider value={{
      settings: settings || getDefaultSettings(),
      updateSettings,
      isLoading
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

const getDefaultSettings = (): AppearanceSettings => ({
  theme: 'system',
  colorScheme: 'default',
  density: 'default',
  fontScale: 1,
  animationsEnabled: true,
  showAuthDebugger: false
});

const applyThemeSettings = (settings: AppearanceSettings) => {
  const root = document.documentElement;
  
  // Apply theme
  applyTheme(settings.theme);
  
  // Apply color scheme
  applyColorScheme(settings.colorScheme);
  
  // Apply font scale
  root.style.setProperty('--font-scale', settings.fontScale.toString());
  
  // Apply density
  applyDensity(settings.density);
  
  // Apply animations
  applyAnimations(settings.animationsEnabled);
};

const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
};

const applyColorScheme = (scheme: string) => {
  const root = document.documentElement;
  
  // Remove existing color scheme classes
  root.classList.remove('theme-blue', 'theme-purple', 'theme-green', 'theme-orange', 'theme-teal', 'theme-slate', 'theme-cyan');
  
  // Apply new color scheme
  if (scheme !== 'default') {
    root.classList.add(`theme-${scheme}`);
  }
};

const applyDensity = (density: 'compact' | 'default' | 'comfortable') => {
  const root = document.documentElement;
  
  // Remove existing density classes
  root.classList.remove('density-compact', 'density-comfortable');
  
  // Apply new density
  if (density !== 'default') {
    root.classList.add(`density-${density}`);
  }
};

const applyAnimations = (enabled: boolean) => {
  const root = document.documentElement;
  root.classList.toggle('animations-disabled', !enabled);
};
