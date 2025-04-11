
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { SlidersHorizontal, Save, Palette, Bell, Shield, Database, Puzzle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AppearanceTab from '@/components/settings/AppearanceTab';
import NotificationsTab from '@/components/settings/NotificationsTab';
import SecurityTab from '@/components/settings/SecurityTab';
import SystemPreferencesTab from '@/components/settings/SystemPreferencesTab';
import IntegrationsTab from '@/components/settings/IntegrationsTab';
import type { 
  AppearanceSettings, 
  NotificationSettings, 
  SecuritySettings, 
  SystemPreferences, 
  SystemSettings as SystemSettingsType 
} from '@/types/settings-types';
import { useAllSystemSettings } from '@/hooks/settings/use-system-settings';
import { Skeleton } from '@/components/ui/skeleton';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('appearance');
  const { settings, isLoading } = useAllSystemSettings();
  
  // Local state to track unsaved changes
  const [unsavedSettings, setUnsavedSettings] = useState<SystemSettingsType>(settings);
  
  // Update local state when settings are loaded
  React.useEffect(() => {
    if (!isLoading) {
      setUnsavedSettings(settings);
    }
  }, [isLoading, settings]);

  const handleAppearanceChange = (appearanceSettings: Partial<AppearanceSettings>) => {
    setUnsavedSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, ...appearanceSettings }
    }));
  };

  const handleNotificationsChange = (notificationsSettings: Partial<NotificationSettings>) => {
    setUnsavedSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...notificationsSettings }
    }));
  };

  const handleSecurityChange = (securitySettings: Partial<SecuritySettings>) => {
    setUnsavedSettings(prev => ({
      ...prev,
      security: { ...prev.security, ...securitySettings }
    }));
  };

  const handlePreferencesChange = (preferencesSettings: Partial<SystemPreferences>) => {
    setUnsavedSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferencesSettings }
    }));
  };

  const handleSave = async () => {
    try {
      // Save all settings that have changed
      const savePromises = Object.keys(unsavedSettings).map(async (key) => {
        const settingKey = key as keyof SystemSettingsType;
        const currentValue = JSON.stringify(settings[settingKey]);
        const newValue = JSON.stringify(unsavedSettings[settingKey]);
        
        // Only save if the setting has changed
        if (currentValue !== newValue) {
          const { error } = await supabase
            .from('system_settings')
            .upsert({ 
              key: settingKey, 
              value: unsavedSettings[settingKey] 
            }, {
              onConflict: 'key'
            });
            
          if (error) throw error;
        }
      });
      
      await Promise.all(savePromises);
      toast.success("System settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <PageTemplate 
        title="System Settings" 
        icon={<SlidersHorizontal className="h-8 w-8" />}
        description="Configure system-wide settings and preferences."
      >
        <div className="space-y-6 mt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageTemplate>
    );
  }

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
          <TabsList className="grid grid-cols-5 w-full md:w-auto">
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
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Puzzle className="h-4 w-4" /> 
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="appearance">
          <AppearanceTab 
            settings={unsavedSettings.appearance} 
            onChange={handleAppearanceChange} 
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab 
            settings={unsavedSettings.notifications} 
            onChange={handleNotificationsChange} 
          />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab 
            settings={unsavedSettings.security} 
            onChange={handleSecurityChange} 
          />
        </TabsContent>

        <TabsContent value="system">
          <SystemPreferencesTab 
            settings={unsavedSettings.preferences} 
            onChange={handlePreferencesChange} 
          />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default SystemSettings;
