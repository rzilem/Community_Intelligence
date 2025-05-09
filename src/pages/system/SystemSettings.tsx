
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { SlidersHorizontal } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { 
  AppearanceSettings, 
  NotificationSettings, 
  SecuritySettings, 
  SystemPreferences, 
  SystemSettings as SystemSettingsType,
  IntegrationSettings 
} from '@/types/settings-types';
import { useAllSystemSettings } from '@/hooks/settings/use-system-settings';
import SystemSettingsSkeleton from '@/components/settings/SystemSettingsSkeleton';
import SystemSettingsSaveButton from '@/components/settings/SystemSettingsSaveButton';
import SystemSettingsContent from '@/components/settings/SystemSettingsContent';
import SystemSettingsTabs from '@/components/settings/SystemSettingsTabs';
import { saveSystemSettings } from '@/hooks/settings/use-system-settings-helpers';
import AISettingsSection from '@/components/settings/AISettingsSection';
import IntegrationsTab from '@/components/settings/IntegrationsTab';

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
      console.log("Loaded settings:", settings);
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

  const handleIntegrationsChange = (integrationsSettings: Partial<IntegrationSettings>) => {
    setUnsavedSettings(prev => ({
      ...prev,
      integrations: { ...prev.integrations, ...integrationsSettings }
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

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(unsavedSettings);
  
  return (
    <PageTemplate 
      title="System Settings" 
      icon={<SlidersHorizontal className="h-8 w-8" />}
      description="Configure the system settings and preferences"
      actions={
        <SystemSettingsSaveButton 
          isSaving={isSaving} 
          onClick={handleSaveSettings} 
          disabled={!hasUnsavedChanges}
        />
      }
    >
      <div className="mt-6">
        <SystemSettingsTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
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
          
          <TabsContent value="system">
            <SystemSettingsContent 
              settings={unsavedSettings.preferences} 
              onUpdate={handlePreferencesChange}
              section="preferences"
            />
          </TabsContent>
          
          <TabsContent value="integrations">
            <IntegrationsTab />
          </TabsContent>
          
          <TabsContent value="ai">
            <AISettingsSection />
          </TabsContent>
        </div>
      </div>
    </PageTemplate>
  );
};

export default SystemSettings;
