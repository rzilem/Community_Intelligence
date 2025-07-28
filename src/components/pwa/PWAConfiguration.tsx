import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Download, 
  Bell, 
  Wifi, 
  WifiOff, 
  Palette, 
  Settings, 
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pwaService, PWAConfiguration as PWAConfig } from '@/services/pwa/pwa-service';
import { usePWA } from '@/hooks/usePWA';

interface PWAConfigurationProps {
  associationId: string;
}

const PWAConfiguration: React.FC<PWAConfigurationProps> = ({ associationId }) => {
  const [config, setConfig] = useState<Partial<PWAConfig>>({
    app_name: '',
    app_description: '',
    theme_color: '#1f2937',
    background_color: '#ffffff',
    features_enabled: {},
    notification_settings: {},
    offline_settings: {}
  });

  const queryClient = useQueryClient();
  const { isInstallable, isInstalled, isOnline, install } = usePWA();

  const { data: pwaConfig, isLoading } = useQuery({
    queryKey: ['pwa-config', associationId],
    queryFn: () => pwaService.getPWAConfiguration(associationId)
  });

  const updateConfigMutation = useMutation({
    mutationFn: (updates: Partial<PWAConfig>) => 
      pwaService.updatePWAConfiguration(associationId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pwa-config', associationId] });
    }
  });

  const createConfigMutation = useMutation({
    mutationFn: (newConfig: Omit<PWAConfig, 'id' | 'created_at' | 'updated_at'>) =>
      pwaService.createPWAConfiguration(newConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pwa-config', associationId] });
    }
  });

  useEffect(() => {
    if (pwaConfig) {
      setConfig(pwaConfig);
    }
  }, [pwaConfig]);

  const handleSave = () => {
    if (pwaConfig) {
      updateConfigMutation.mutate(config);
    } else {
      createConfigMutation.mutate({
        ...config,
        association_id: associationId
      } as Omit<PWAConfig, 'id' | 'created_at' | 'updated_at'>);
    }
  };

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      features_enabled: {
        ...prev.features_enabled,
        [feature]: enabled
      }
    }));
  };

  const handleInstallApp = async () => {
    try {
      await install();
    } catch (error) {
      console.error('Failed to install app:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-8 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PWA Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">App Status</p>
                <p className="text-lg font-bold text-foreground">
                  {isInstalled ? 'Installed' : isInstallable ? 'Ready to Install' : 'Web App'}
                </p>
              </div>
              <Smartphone className={`h-8 w-8 ${isInstalled ? 'text-success' : 'text-primary'}`} />
            </div>
            {isInstallable && !isInstalled && (
              <Button onClick={handleInstallApp} className="w-full mt-3" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connection</p>
                <p className="text-lg font-bold text-foreground">
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              {isOnline ? (
                <Wifi className="h-8 w-8 text-success" />
              ) : (
                <WifiOff className="h-8 w-8 text-destructive" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Push Notifications</p>
                <p className="text-lg font-bold text-foreground">
                  {Notification?.permission === 'granted' ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <Bell className={`h-8 w-8 ${
                Notification?.permission === 'granted' ? 'text-success' : 'text-muted-foreground'
              }`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="app-config" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="app-config">App Configuration</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="app-config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                App Configuration
              </CardTitle>
              <CardDescription>Configure the basic settings for your PWA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="app-name">App Name</Label>
                    <Input
                      id="app-name"
                      value={config.app_name || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, app_name: e.target.value }))}
                      placeholder="Community App"
                    />
                  </div>

                  <div>
                    <Label htmlFor="app-description">App Description</Label>
                    <Textarea
                      id="app-description"
                      value={config.app_description || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, app_description: e.target.value }))}
                      placeholder="Manage your community with ease"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="theme-color">Theme Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="theme-color"
                        type="color"
                        value={config.theme_color || '#1f2937'}
                        onChange={(e) => setConfig(prev => ({ ...prev, theme_color: e.target.value }))}
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.theme_color || '#1f2937'}
                        onChange={(e) => setConfig(prev => ({ ...prev, theme_color: e.target.value }))}
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="background-color"
                        type="color"
                        value={config.background_color || '#ffffff'}
                        onChange={(e) => setConfig(prev => ({ ...prev, background_color: e.target.value }))}
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.background_color || '#ffffff'}
                        onChange={(e) => setConfig(prev => ({ ...prev, background_color: e.target.value }))}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="app-icon">App Icon URL</Label>
                    <Input
                      id="app-icon"
                      value={config.app_icon_url || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, app_icon_url: e.target.value }))}
                      placeholder="/icon-512x512.png"
                    />
                  </div>

                  <div>
                    <Label htmlFor="splash-screen">Splash Screen URL</Label>
                    <Input
                      id="splash-screen"
                      value={config.splash_screen_url || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, splash_screen_url: e.target.value }))}
                      placeholder="/splash-screen.png"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={handleSave} 
                  disabled={updateConfigMutation.isPending || createConfigMutation.isPending}
                >
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Management</CardTitle>
              <CardDescription>Enable or disable PWA features for your association</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { key: 'offline_mode', label: 'Offline Mode', description: 'Allow app to work without internet connection' },
                  { key: 'push_notifications', label: 'Push Notifications', description: 'Send notifications to users\' devices' },
                  { key: 'background_sync', label: 'Background Sync', description: 'Sync data when connection is restored' },
                  { key: 'install_prompt', label: 'Install Prompt', description: 'Show install prompt to users' },
                  { key: 'camera_access', label: 'Camera Access', description: 'Allow photo capture for maintenance requests' },
                  { key: 'location_services', label: 'Location Services', description: 'Use GPS for location-based features' },
                  { key: 'biometric_auth', label: 'Biometric Authentication', description: 'Use fingerprint/face ID for login' },
                  { key: 'app_shortcuts', label: 'App Shortcuts', description: 'Quick actions from app icon' }
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{feature.label}</h4>
                        <Badge variant="outline" className={
                          config.features_enabled?.[feature.key] ? 'bg-success/10 text-success' : 'bg-muted/10'
                        }>
                          {config.features_enabled?.[feature.key] ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                    <Switch
                      checked={config.features_enabled?.[feature.key] || false}
                      onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure push notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Notification?.permission !== 'granted' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Push notifications are not enabled. 
                      <Button 
                        variant="link" 
                        className="p-0 h-auto ml-1"
                        onClick={() => Notification.requestPermission()}
                      >
                        Enable notifications
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Notification Types</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'maintenance_updates', label: 'Maintenance Updates' },
                        { key: 'payment_reminders', label: 'Payment Reminders' },
                        { key: 'announcements', label: 'Community Announcements' },
                        { key: 'emergency_alerts', label: 'Emergency Alerts' },
                        { key: 'event_reminders', label: 'Event Reminders' },
                        { key: 'document_updates', label: 'Document Updates' }
                      ].map((type) => (
                        <div key={type.key} className="flex items-center justify-between">
                          <Label htmlFor={type.key}>{type.label}</Label>
                          <Switch
                            id={type.key}
                            checked={config.notification_settings?.[type.key] || false}
                            onCheckedChange={(checked) => 
                              setConfig(prev => ({
                                ...prev,
                                notification_settings: {
                                  ...prev.notification_settings,
                                  [type.key]: checked
                                }
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Delivery Preferences</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Quiet Hours (9 PM - 8 AM)</Label>
                        <Switch
                          checked={config.notification_settings?.quiet_hours || false}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({
                              ...prev,
                              notification_settings: {
                                ...prev.notification_settings,
                                quiet_hours: checked
                              }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Group Similar Notifications</Label>
                        <Switch
                          checked={config.notification_settings?.group_notifications || false}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({
                              ...prev,
                              notification_settings: {
                                ...prev.notification_settings,
                                group_notifications: checked
                              }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Badge App Icon</Label>
                        <Switch
                          checked={config.notification_settings?.badge_icon || false}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({
                              ...prev,
                              notification_settings: {
                                ...prev.notification_settings,
                                badge_icon: checked
                              }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                App Analytics
              </CardTitle>
              <CardDescription>Monitor app usage and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Daily Active Users</p>
                        <p className="text-2xl font-bold">124</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Install Rate</p>
                        <p className="text-2xl font-bold">68%</p>
                      </div>
                      <Download className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Session</p>
                        <p className="text-2xl font-bold">4.2m</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-warning" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Feature Usage</h4>
                {[
                  { feature: 'Maintenance Requests', usage: 85, sessions: 342 },
                  { feature: 'Announcements', usage: 72, sessions: 298 },
                  { feature: 'Payment Portal', usage: 68, sessions: 245 },
                  { feature: 'Document Library', usage: 45, sessions: 156 },
                  { feature: 'Calendar Events', usage: 38, sessions: 129 }
                ].map((item) => (
                  <div key={item.feature} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{item.feature}</span>
                      <p className="text-sm text-muted-foreground">{item.sessions} sessions this month</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{item.usage}%</span>
                      <p className="text-sm text-muted-foreground">usage rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PWAConfiguration;