
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { SlidersHorizontal } from 'lucide-react';
import { Tabs } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { 
  AppearanceSettings, 
  NotificationSettings, 
  SecuritySettings, 
  SystemPreferences, 
  SystemSettings as SystemSettingsType 
} from '@/types/settings-types';
import { useAllSystemSettings } from '@/hooks/settings/use-system-settings';
import SystemSettingsTabs from '@/components/settings/SystemSettingsTabs';
import SystemSettingsSkeleton from '@/components/settings/SystemSettingsSkeleton';
import SystemSettingsSaveButton from '@/components/settings/SystemSettingsSaveButton';
import SystemSettingsContent from '@/components/settings/SystemSettingsContent';
import { saveSystemSettings } from '@/hooks/settings/use-system-settings-helpers';

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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveSystemSettings(unsavedSettings);
      toast.success("System settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageTemplate 
        title="System Settings" 
        icon={<SlidersHorizontal className="h-8 w-8" />}
        description="Configure system-wide settings and preferences."
      >
        <SystemSettingsSkeleton />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title="System Settings" 
      icon={<SlidersHorizontal className="h-8 w-8" />}
      description="Configure system-wide settings and preferences."
      actions={
        <SystemSettingsSaveButton isSaving={isSaving} onClick={handleSave} />
      }
    >
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <SystemSettingsTabs activeTab={activeTab} />
        
        <SystemSettingsContent 
          activeTab={activeTab}
          settings={unsavedSettings}
          onChange={{
            handleAppearanceChange,
            handleNotificationsChange,
            handleSecurityChange,
            handlePreferencesChange
          }}
        />
      </Tabs>
    </PageTemplate>
  );
};

export default SystemSettings;
