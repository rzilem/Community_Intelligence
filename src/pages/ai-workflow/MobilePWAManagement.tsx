import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Smartphone, 
  Bell, 
  Download, 
  Wifi, 
  WifiOff, 
  Settings, 
  BarChart3, 
  Users, 
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';

interface MobilePWAManagementProps {
  associationId: string;
}

const MobilePWAManagement: React.FC<MobilePWAManagementProps> = ({ associationId }) => {
  const { toast } = useToast();
  const { isInstalled, isStandalone, canInstall, install, isOnline } = usePWA();
  const { permission, requestPermission, showNotification } = useNotifications();
  
  const [pwaConfig, setPwaConfig] = useState({
    appName: 'Community Intelligence',
    shortName: 'CI',
    description: 'AI-powered HOA management platform',
    themeColor: '#6366f1',
    backgroundColor: '#1f2937',
    display: 'standalone',
    orientation: 'portrait',
    startUrl: '/',
    scope: '/',
    enableOfflineSync: true,
    cacheDuration: 24, // hours
    maxCacheSize: 50 // MB
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    types: {
      maintenance: true,
      payments: true,
      announcements: true,
      emergencies: true
    }
  });

  const [analytics, setAnalytics] = useState({
    installations: 142,
    activeUsers: 89,
    offlineUsage: 23,
    pushNotificationsSent: 456,
    engagementRate: 67,
    averageSessionTime: '8m 32s'
  });

  const [syncQueue, setSyncQueue] = useState([
    { id: 1, type: 'maintenance_request', status: 'pending', timestamp: new Date().toISOString() },
    { id: 2, type: 'payment_update', status: 'syncing', timestamp: new Date().toISOString() },
    { id: 3, type: 'announcement', status: 'completed', timestamp: new Date().toISOString() }
  ]);

  const handleInstallPWA = async () => {
    if (canInstall) {
      try {
        await install();
        toast({
          title: "PWA Installed",
          description: "The app has been installed successfully",
        });
      } catch (error) {
        toast({
          title: "Installation Failed",
          description: "Failed to install the PWA",
          variant: "destructive"
        });
      }
    }
  };

  const handleNotificationPermission = async () => {
    try {
      const result = await requestPermission();
      if (result === 'granted') {
        setNotificationSettings(prev => ({ ...prev, enabled: true }));
        toast({
          title: "Notifications Enabled",
          description: "Push notifications are now enabled",
        });
      }
    } catch (error) {
      toast({
        title: "Permission Denied",
        description: "Notification permission was denied",
        variant: "destructive"
      });
    }
  };

  const sendTestNotification = async () => {
    if (permission === 'granted') {
      try {
        await showNotification({
          title: 'Test Notification',
          body: 'This is a test notification from Community Intelligence',
          icon: '/icons/icon-192x192.png'
        });
      } catch (error) {
        toast({
          title: "Failed to Send",
          description: "Failed to send test notification",
          variant: "destructive"
        });
      }
    }
  };

  const clearSyncQueue = () => {
    setSyncQueue([]);
    toast({
      title: "Queue Cleared",
      description: "Offline sync queue has been cleared",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'syncing': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <AppLayout>
      <PageTemplate
        title="Mobile PWA Management"
        icon={<Smartphone className="h-8 w-8 text-blue-500" />}
        description="Manage Progressive Web App features and settings"
        actions={
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Wifi className="h-4 w-4 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="h-4 w-4 mr-1" />
                Offline
              </Badge>
            )}
            {isInstalled && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <CheckCircle className="h-4 w-4 mr-1" />
                Installed
              </Badge>
            )}
          </div>
        }
      >
        <div className="space-y-6">

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="offline">Offline Sync</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PWA Status</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isInstalled ? 'Installed' : 'Not Installed'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isStandalone ? 'Running as standalone app' : 'Running in browser'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offline Usage</CardTitle>
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.offlineUsage}%</div>
                <p className="text-xs text-muted-foreground">
                  Of total app usage
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.engagementRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Average session: {analytics.averageSessionTime}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={handleInstallPWA} 
                  disabled={!canInstall}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install PWA
                </Button>
                
                <Button 
                  onClick={handleNotificationPermission}
                  disabled={permission === 'granted'}
                  variant="outline"
                  className="w-full"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </Button>
                
                <Button 
                  onClick={sendTestNotification}
                  disabled={permission !== 'granted'}
                  variant="outline"
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Test Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PWA Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">App Name</Label>
                  <Input
                    id="appName"
                    value={pwaConfig.appName}
                    onChange={(e) => setPwaConfig(prev => ({ ...prev, appName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shortName">Short Name</Label>
                  <Input
                    id="shortName"
                    value={pwaConfig.shortName}
                    onChange={(e) => setPwaConfig(prev => ({ ...prev, shortName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="themeColor">Theme Color</Label>
                  <Input
                    id="themeColor"
                    type="color"
                    value={pwaConfig.themeColor}
                    onChange={(e) => setPwaConfig(prev => ({ ...prev, themeColor: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={pwaConfig.backgroundColor}
                    onChange={(e) => setPwaConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={pwaConfig.description}
                  onChange={(e) => setPwaConfig(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="offlineSync"
                  checked={pwaConfig.enableOfflineSync}
                  onCheckedChange={(checked) => setPwaConfig(prev => ({ ...prev, enableOfflineSync: checked }))}
                />
                <Label htmlFor="offlineSync">Enable Offline Sync</Label>
              </div>
              
              <div className="flex gap-4">
                <Button>Save Configuration</Button>
                <Button variant="outline">Reset to Default</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Push Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificationsEnabled">Enable Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow the app to send push notifications
                  </p>
                </div>
                <Switch
                  id="notificationsEnabled"
                  checked={notificationSettings.enabled}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Notification Types</h4>
                
                {Object.entries(notificationSettings.types).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <Label htmlFor={type} className="capitalize">
                      {type.replace('_', ' ')}
                    </Label>
                    <Switch
                      id={type}
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          types: { ...prev.types, [type]: checked }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Sent today:</span>
                    <span className="ml-2 font-medium">23</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Open rate:</span>
                    <span className="ml-2 font-medium">78%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total sent:</span>
                    <span className="ml-2 font-medium">{analytics.pushNotificationsSent}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subscribers:</span>
                    <span className="ml-2 font-medium">{analytics.activeUsers}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Offline Sync Queue
                <Button variant="outline" size="sm" onClick={clearSyncQueue}>
                  Clear Queue
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {syncQueue.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2" />
                    <p>No items in sync queue</p>
                  </div>
                ) : (
                  syncQueue.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                        <div>
                          <p className="font-medium">{item.type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {item.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cache Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Cache Size</Label>
                  <p className="text-sm text-muted-foreground">
                    Current: 24.5 MB / 50 MB limit
                  </p>
                </div>
                <Progress value={49} className="w-32" />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Clear Cache
                </Button>
                <Button variant="outline" size="sm">
                  Optimize Storage
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Installations</span>
                    <span className="font-bold">{analytics.installations}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Week</span>
                    <span className="font-bold text-green-600">+18</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Conversion Rate</span>
                    <span className="font-bold">34%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Daily Active Users</span>
                    <span className="font-bold">{analytics.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Session</span>
                    <span className="font-bold">{analytics.averageSessionTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Retention Rate</span>
                    <span className="font-bold">82%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default MobilePWAManagement;