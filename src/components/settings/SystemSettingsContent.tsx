
import React from 'react';
import AppearanceTab from '@/components/settings/AppearanceTab';
import NotificationsTab from '@/components/settings/NotificationsTab';
import SecurityTab from '@/components/settings/SecurityTab';
import SystemPreferencesTab from '@/components/settings/SystemPreferencesTab';
import IntegrationsTab from '@/components/settings/IntegrationsTab';
import { 
  AppearanceSettings, 
  NotificationSettings, 
  SecuritySettings, 
  SystemPreferences,
  IntegrationSettings
} from '@/types/settings-types';

interface SystemSettingsContentProps {
  settings: AppearanceSettings | NotificationSettings | SecuritySettings | SystemPreferences | IntegrationSettings;
  onUpdate: (settings: Partial<any>) => void;
  section: 'appearance' | 'notifications' | 'security' | 'preferences' | 'integrations';
}

const SystemSettingsContent: React.FC<SystemSettingsContentProps> = ({ 
  settings, 
  onUpdate,
  section
}) => {
  if (section === 'appearance') {
    return (
      <AppearanceTab 
        settings={settings as AppearanceSettings} 
        onChange={onUpdate} 
      />
    );
  }
  
  if (section === 'notifications') {
    return (
      <NotificationsTab 
        settings={settings as NotificationSettings} 
        onChange={onUpdate} 
      />
    );
  }
  
  if (section === 'security') {
    return (
      <SecurityTab 
        settings={settings as SecuritySettings} 
        onChange={onUpdate} 
      />
    );
  }
  
  if (section === 'preferences') {
    return (
      <SystemPreferencesTab 
        settings={settings as SystemPreferences} 
        onChange={onUpdate} 
      />
    );
  }
  
  if (section === 'integrations') {
    return (
      <IntegrationsTab />
    );
  }
  
  return null;
};

export default SystemSettingsContent;
