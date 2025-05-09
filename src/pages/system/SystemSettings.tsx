
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { SlidersHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { 
  AppearanceSettings, 
  NotificationSettings, 
  SecuritySettings, 
  SystemPreferences, 
  SystemSettings as SystemSettingsType 
} from '@/types/settings-types';
import { useAllSystemSettings } from '@/hooks/settings/use-system-settings';
import SystemSettingsSkeleton from '@/components/settings/SystemSettingsSkeleton';
import SystemSettingsSaveButton from '@/components/settings/SystemSettingsSaveButton';
import SystemSettingsContent from '@/components/settings/SystemSettingsContent';
import { saveSystemSettings } from '@/hooks/settings/use-system-settings-helpers';
import AISettingsSection from '@/components/settings/AISettingsSection';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('appearance');
  const { settings, isLoading } = useAllSystemSettings();
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state to track unsaved changes
  const [unsavedSettings, setUnsavedSettings] = useState<SystemSettingsType>(settings);
  
  // Update local state when settings are loaded
  useEffect(() => {
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

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveSystemSettings(unsavedSettings);
      toast.success('System settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SystemSettingsSkeleton />;
  }

  return (
    <PageTemplate 
      title="System Settings" 
      icon={<SlidersHorizontal className="h-8 w-8" />}
      description="Configure the system settings and preferences"
      actions={
        <SystemSettingsSaveButton 
          isSaving={isSaving} 
          onClick={handleSaveSettings} 
          disabled={JSON.stringify(settings) === JSON.stringify(unsavedSettings)}
        />
      }
    >
      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="ai">AI & Integrations</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="appearance">
              <SystemSettingsContent 
                settings={unsavedSettings.appearance} 
                onUpdate={handleAppearanceChange}
                section="appearance"
              />
            </TabsContent>
            
            <TabsContent value="notifications">
              <SystemSettingsContent 
                settings={unsavedSettings.notifications} 
                onUpdate={handleNotificationsChange}
                section="notifications"
              />
            </TabsContent>
            
            <TabsContent value="security">
              <SystemSettingsContent 
                settings={unsavedSettings.security} 
                onUpdate={handleSecurityChange}
                section="security"
              />
            </TabsContent>
            
            <TabsContent value="preferences">
              <SystemSettingsContent 
                settings={unsavedSettings.preferences} 
                onUpdate={handlePreferencesChange}
                section="preferences"
              />
            </TabsContent>
            
            <TabsContent value="ai">
              <AISettingsSection />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default SystemSettings;
