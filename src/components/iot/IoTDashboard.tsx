import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Plus,
  Thermometer,
  Droplets,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import { iotDeviceService, IoTDevice, IoTAlert } from '@/services/iot/iot-device-service';
import { useQuery } from '@tanstack/react-query';

interface IoTDashboardProps {
  associationId: string;
}

const IoTDashboard: React.FC<IoTDashboardProps> = ({ associationId }) => {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['iot-devices', associationId],
    queryFn: () => iotDeviceService.getDevices(associationId)
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['iot-alerts', associationId],
    queryFn: () => iotDeviceService.getAlerts(associationId, 'active')
  });

  const deviceStats = {
    total: devices.length,
    active: devices.filter(d => d.status === 'active').length,
    inactive: devices.filter(d => d.status === 'inactive').length,
    maintenance: devices.filter(d => d.status === 'maintenance').length,
    error: devices.filter(d => d.status === 'error').length
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'temperature': return <Thermometer className="h-4 w-4" />;
      case 'humidity': return <Droplets className="h-4 w-4" />;
      case 'energy': return <Zap className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'inactive': return 'bg-muted';
      case 'maintenance': return 'bg-warning';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-warning';
      case 'high': return 'bg-destructive';
      case 'critical': return 'bg-red-700';
      default: return 'bg-muted';
    }
  };

  const handleAcknowledgeAlert = async (alertId: string, userId: string) => {
    try {
      await iotDeviceService.acknowledgeAlert(alertId, userId);
      // Refresh alerts
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  if (devicesLoading || alertsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold text-foreground">{deviceStats.total}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-success">{deviceStats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                <p className="text-2xl font-bold text-warning">{alerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-destructive">{deviceStats.inactive + deviceStats.error}</p>
              </div>
              <WifiOff className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Active Alerts
            </CardTitle>
            <CardDescription>Devices requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <Alert key={alert.id} className="border-l-4" style={{ borderLeftColor: getAlertSeverityColor(alert.severity) }}>
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={getAlertSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{alert.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        {alert.current_value && alert.threshold_value && (
                          <p className="text-sm">
                            Current: {alert.current_value} | Threshold: {alert.threshold_value}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcknowledgeAlert(alert.id, 'current-user-id')}
                      >
                        Acknowledge
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="devices" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="alerts">All Alerts</TabsTrigger>
            <TabsTrigger value="automations">Automations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Device
          </Button>
        </div>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <Card 
                key={device.id} 
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedDevice === device.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedDevice(device.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.device_type)}
                      <span className="font-medium">{device.device_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(device.status)}>
                        {device.status}
                      </Badge>
                      {device.status === 'active' ? (
                        <Wifi className="h-4 w-4 text-success" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="capitalize">{device.device_type}</span>
                    </div>
                    {device.location && (
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span>{device.location}</span>
                      </div>
                    )}
                    {device.battery_level && (
                      <div className="flex justify-between">
                        <span>Battery:</span>
                        <span>{device.battery_level}%</span>
                      </div>
                    )}
                    {device.last_seen && (
                      <div className="flex justify-between">
                        <span>Last Seen:</span>
                        <span>{new Date(device.last_seen).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end mt-3 pt-3 border-t">
                    <Button size="sm" variant="ghost">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Alerts</CardTitle>
              <CardDescription>Complete alert history and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getAlertSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{alert.status}</Badge>
                      {alert.status === 'active' && (
                        <Button size="sm" variant="outline">
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IoT Automations</CardTitle>
              <CardDescription>Automated responses to device events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No automations configured yet</p>
                <Button className="mt-4">Create Automation</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Device Performance</CardTitle>
                <CardDescription>Overview of device health and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Uptime</span>
                    <span className="font-medium">98.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Time</span>
                    <span className="font-medium">125ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Energy Efficiency</span>
                    <span className="font-medium">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>Device usage patterns and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Peak Usage Hours</span>
                    <span className="font-medium">8AM - 10AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Most Active Device</span>
                    <span className="font-medium">Main Entrance</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Points Today</span>
                    <span className="font-medium">12,847</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IoTDashboard;