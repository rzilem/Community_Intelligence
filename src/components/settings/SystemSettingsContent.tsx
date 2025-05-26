
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SystemPreferencesTab from './SystemPreferencesTab';
import IntegrationsTab from './IntegrationsTab';
import SecurityTab from './SecurityTab';
import NotificationsTab from './NotificationsTab';
import AppearanceTab from './AppearanceTab';
import AIConfigurationSection from './AIConfigurationSection';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  SystemSettings, 
  AppearanceSettings, 
  NotificationSettings, 
  SecuritySettings, 
  SystemPreferences 
} from '@/types/settings-types';

const SystemSettingsContent: React.FC = () => {
  const { toast } = useToast();
  
  // Default settings
  const [settings, setSettings] = useState<SystemSettings>({
    appearance: {
      theme: 'system',
      colorScheme: 'default',
      density: 'default',
      fontScale: 1,
      animationsEnabled: true
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
      ipWhitelist: []
    },
    preferences: {
      defaultAssociationId: '',
      defaultDateFormat: 'MM/DD/YYYY',
      defaultTimeFormat: '12h',
      defaultCurrency: 'USD',
      defaultLanguage: 'en',
      autoSave: true,
      sessionTimeout: 30
    },
    integrations: {
      integrationSettings: {}
    },
    webhook_settings: {}
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        setIsLoading(false);
        return;
      }

      // Load user settings from the database using the actual table structure
      const { data: userSettings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading settings:', error);
        setIsLoading(false);
        return;
      }

      if (userSettings) {
        // Map the database fields to our settings structure
        const loadedSettings: SystemSettings = {
          ...settings,
          appearance: {
            ...settings.appearance,
            theme: userSettings.theme || 'system'
          },
          notifications: {
            ...settings.notifications,
            emailNotifications: userSettings.notifications_enabled ?? true
          },
          preferences: {
            ...settings.preferences,
            // Map any column_preferences if they exist
            ...(userSettings.column_preferences ? userSettings.column_preferences : {})
          }
        };
        
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (category: keyof SystemSettings, newSettings: Partial<any>) => {
    try {
      const updatedCategorySettings = { ...settings[category], ...newSettings };
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        [category]: updatedCategorySettings
      }));

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No user found');
      }

      // Map settings back to database structure
      let updateData: any = {};
      
      if (category === 'appearance') {
        updateData.theme = updatedCategorySettings.theme;
      } else if (category === 'notifications') {
        updateData.notifications_enabled = updatedCategorySettings.emailNotifications;
      } else if (category === 'preferences') {
        updateData.column_preferences = updatedCategorySettings;
      }

      // Save to database using upsert
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...updateData
        });

      if (error) {
        console.error('Error saving settings:', error);
        toast({
          title: "Error",
          description: "Failed to save settings",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Settings Saved",
          description: "Your settings have been updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-2">
            Loading your system preferences and configurations...
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your system preferences, integrations, and configurations.
        </p>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="ai-config">AI Config</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <SystemPreferencesTab 
            settings={settings.preferences}
            onChange={(newSettings) => updateSettings('preferences', newSettings)}
          />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>

        <TabsContent value="ai-config">
          <AIConfigurationSection />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab 
            settings={settings.security}
            onChange={(newSettings) => updateSettings('security', newSettings)}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab 
            settings={settings.notifications}
            onChange={(newSettings) => updateSettings('notifications', newSettings)}
          />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceTab 
            settings={settings.appearance}
            onChange={(newSettings) => updateSettings('appearance', newSettings)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettingsContent;
