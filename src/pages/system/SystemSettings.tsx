
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { SlidersHorizontal, Save, Palette, Bell, Shield, Database } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AppearanceTab from '@/components/settings/AppearanceTab';
import NotificationsTab from '@/components/settings/NotificationsTab';
import SecurityTab from '@/components/settings/SecurityTab';
import SystemPreferencesTab from '@/components/settings/SystemPreferencesTab';
import { 
  AppearanceSettings, 
  NotificationSettings, 
  SecuritySettings, 
  SystemPreferences, 
  SystemSettings 
} from '@/types/settings-types';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('appearance');
  
  // Default settings
  const [settings, setSettings] = useState<SystemSettings>({
    appearance: {
      theme: 'system',
      colorScheme: 'default',
      density: 'default',
      animationsEnabled: true,
      fontScale: 1
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      maintenanceAlerts: true,
      securityAlerts: true,
      newsAndUpdates: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordResetInterval: 90,
      ipWhitelist: ['192.168.1.1', '10.0.0.1']
    },
    preferences: {
      defaultAssociationId: 'assoc-1',
      defaultDateFormat: 'MM/DD/YYYY',
      defaultTimeFormat: '12h',
      defaultCurrency: 'USD',
      defaultLanguage: 'en',
      autoSave: true,
      sessionTimeout: 30
    }
  });

  const handleAppearanceChange = (appearanceSettings: Partial<AppearanceSettings>) => {
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, ...appearanceSettings }
    }));
  };

  const handleNotificationsChange = (notificationsSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...notificationsSettings }
    }));
  };

  const handleSecurityChange = (securitySettings: Partial<SecuritySettings>) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, ...securitySettings }
    }));
  };

  const handlePreferencesChange = (preferencesSettings: Partial<SystemPreferences>) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferencesSettings }
    }));
  };

  const handleSave = () => {
    // In a real app, this would save the settings to the database
    toast.success("System settings saved successfully!");
  };

  return (
    <PageTemplate 
      title="System Settings" 
      icon={<SlidersHorizontal className="h-8 w-8" />}
      description="Configure system-wide settings and preferences."
      actions={
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" /> 
          Save Settings
        </Button>
      }
    >
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" /> 
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> 
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> 
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" /> 
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="appearance">
          <AppearanceTab 
            settings={settings.appearance} 
            onChange={handleAppearanceChange} 
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab 
            settings={settings.notifications} 
            onChange={handleNotificationsChange} 
          />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab 
            settings={settings.security} 
            onChange={handleSecurityChange} 
          />
        </TabsContent>

        <TabsContent value="system">
          <SystemPreferencesTab 
            settings={settings.preferences} 
            onChange={handlePreferencesChange} 
          />
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default SystemSettings;
