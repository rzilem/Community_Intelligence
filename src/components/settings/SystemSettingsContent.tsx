import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { mockRPCCall } from '@/hooks/supabase/supabase-utils';
import { AIConfigurationSection } from './AIConfigurationSection';

// Define proper types
type ThemeOption = 'light' | 'dark' | 'system';
type ColorScheme = 'blue' | 'green' | 'purple' | 'orange';
type DensityOption = 'compact' | 'comfortable' | 'spacious';

interface AppearanceSettings {
  theme: ThemeOption;
  colorScheme: ColorScheme;
  density: DensityOption;
  fontScale: number;
  animationsEnabled: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  maintenanceAlerts: boolean;
  securityAlerts: boolean;
  newsAndUpdates: boolean;
}

interface IntegrationSettings {
  autoSync: boolean;
  syncInterval: number;
  dataRetention: number;
  backupEnabled: boolean;
  backupFrequency: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  auditLogging: boolean;
  ipWhitelisting: boolean;
}

interface PreferenceSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  defaultView: string;
}

interface AllSettings {
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
  security: SecuritySettings;
  preferences: PreferenceSettings;
}

const defaultSettings: AllSettings = {
  appearance: {
    theme: 'system' as ThemeOption,
    colorScheme: 'blue' as ColorScheme,
    density: 'comfortable' as DensityOption,
    fontScale: 1,
    animationsEnabled: true,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    maintenanceAlerts: true,
    securityAlerts: true,
    newsAndUpdates: false,
  },
  integrations: {
    autoSync: true,
    syncInterval: 15,
    dataRetention: 365,
    backupEnabled: true,
    backupFrequency: 'daily',
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 480,
    passwordExpiry: 90,
    auditLogging: true,
    ipWhitelisting: false,
  },
  preferences: {
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'US',
    defaultView: 'dashboard',
  },
};

export function SystemSettingsContent() {
  const [settings, setSettings] = useState<AllSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('preferences');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await mockRPCCall('get_secret', {
        secret_name: 'system_settings'
      });

      if (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load system settings');
        return;
      }

      if (data) {
        const parsedSettings = typeof data === 'object' ? data : JSON.parse(data as string);
        setSettings({
          ...defaultSettings,
          ...parsedSettings as Partial<AllSettings>
        });
        toast.success('Settings loaded successfully');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await mockRPCCall('set_secret', {
        secret_name: 'system_settings',
        secret_value: JSON.stringify(settings)
      });

      if (error) {
        console.error('Error saving settings:', error);
        toast.error('Failed to save system settings');
        return;
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save system settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateAppearanceSettings = (updates: Partial<AppearanceSettings>) => {
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, ...updates }
    }));
  };

  const updateNotificationSettings = (updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates }
    }));
  };

  const updateIntegrationSettings = (updates: Partial<IntegrationSettings>) => {
    setSettings(prev => ({
      ...prev,
      integrations: { ...prev.integrations, ...updates }
    }));
  };

  const updateSecuritySettings = (updates: Partial<SecuritySettings>) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, ...updates }
    }));
  };

  const updatePreferenceSettings = (updates: Partial<PreferenceSettings>) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Manage your system preferences, integrations, and configurations.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="ai-config">AI Config</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Configure your basic system preferences and defaults.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={settings.preferences.language} 
                    onValueChange={(value) => updatePreferenceSettings({ language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={settings.preferences.timezone} 
                    onValueChange={(value) => updatePreferenceSettings({ timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select 
                    value={settings.preferences.dateFormat} 
                    onValueChange={(value) => updatePreferenceSettings({ dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultView">Default View</Label>
                  <Select 
                    value={settings.preferences.defaultView} 
                    onValueChange={(value) => updatePreferenceSettings({ defaultView: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="properties">Properties</SelectItem>
                      <SelectItem value="residents">Residents</SelectItem>
                      <SelectItem value="financials">Financials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Configure system integrations and data synchronization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Sync</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically sync data with external systems
                  </div>
                </div>
                <Switch
                  checked={settings.integrations.autoSync}
                  onCheckedChange={(checked) => updateIntegrationSettings({ autoSync: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Sync Interval (minutes)</Label>
                <Slider
                  value={[settings.integrations.syncInterval]}
                  onValueChange={([value]) => updateIntegrationSettings({ syncInterval: value })}
                  max={60}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">
                  Current: {settings.integrations.syncInterval} minutes
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Backup Enabled</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable automatic data backups
                  </div>
                </div>
                <Switch
                  checked={settings.integrations.backupEnabled}
                  onCheckedChange={(checked) => updateIntegrationSettings({ backupEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-config" className="space-y-4">
          <AIConfigurationSection />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and access control settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <div className="text-sm text-muted-foreground">
                    Require 2FA for account access
                  </div>
                </div>
                <Switch
                  checked={settings.security.twoFactorEnabled}
                  onCheckedChange={(checked) => updateSecuritySettings({ twoFactorEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Audit Logging</Label>
                  <div className="text-sm text-muted-foreground">
                    Log all system activities
                  </div>
                </div>
                <Switch
                  checked={settings.security.auditLogging}
                  onCheckedChange={(checked) => updateSecuritySettings({ auditLogging: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Slider
                  value={[settings.security.sessionTimeout]}
                  onValueChange={([value]) => updateSecuritySettings({ sessionTimeout: value })}
                  max={1440}
                  min={30}
                  step={30}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">
                  Current: {settings.security.sessionTimeout} minutes
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateNotificationSettings({ emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive push notifications in browser
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => updateNotificationSettings({ pushNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Alerts</Label>
                  <div className="text-sm text-muted-foreground">
                    Get notified about maintenance requests
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.maintenanceAlerts}
                  onCheckedChange={(checked) => updateNotificationSettings({ maintenanceAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Security Alerts</Label>
                  <div className="text-sm text-muted-foreground">
                    Get notified about security events
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.securityAlerts}
                  onCheckedChange={(checked) => updateNotificationSettings({ securityAlerts: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your interface.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select 
                  value={settings.appearance.theme} 
                  onValueChange={(value: ThemeOption) => updateAppearanceSettings({ theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select 
                  value={settings.appearance.colorScheme} 
                  onValueChange={(value: ColorScheme) => updateAppearanceSettings({ colorScheme: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animations</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable interface animations
                  </div>
                </div>
                <Switch
                  checked={settings.appearance.animationsEnabled}
                  onCheckedChange={(checked) => updateAppearanceSettings({ animationsEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
