
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
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
  SystemSettings 
} from '@/types/settings-types';

interface SystemSettingsContentProps {
  activeTab: string;
  settings: SystemSettings;
  onChange: {
    handleAppearanceChange: (settings: Partial<AppearanceSettings>) => void;
    handleNotificationsChange: (settings: Partial<NotificationSettings>) => void;
    handleSecurityChange: (settings: Partial<SecuritySettings>) => void;
    handlePreferencesChange: (settings: Partial<SystemPreferences>) => void;
  };
}

const SystemSettingsContent: React.FC<SystemSettingsContentProps> = ({ 
  activeTab, 
  settings, 
  onChange 
}) => {
  return (
    <>
      <TabsContent value="appearance">
        <AppearanceTab 
          settings={settings.appearance} 
          onChange={onChange.handleAppearanceChange} 
        />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationsTab 
          settings={settings.notifications} 
          onChange={onChange.handleNotificationsChange} 
        />
      </TabsContent>

      <TabsContent value="security">
        <SecurityTab 
          settings={settings.security} 
          onChange={onChange.handleSecurityChange} 
        />
      </TabsContent>

      <TabsContent value="system">
        <SystemPreferencesTab 
          settings={settings.preferences} 
          onChange={onChange.handlePreferencesChange} 
        />
      </TabsContent>

      <TabsContent value="integrations">
        <IntegrationsTab />
      </TabsContent>
    </>
  );
};

export default SystemSettingsContent;
