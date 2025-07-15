import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Thermometer, 
  Camera, 
  Shield, 
  Zap, 
  Droplets, 
  Activity,
  Plus,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Gauge
} from 'lucide-react';
import { iotIntegrationEngine } from '@/services/iot/integration';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';

interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'camera' | 'controller' | 'monitor';
  category: 'environmental' | 'security' | 'utility' | 'maintenance';
  status: 'online' | 'offline' | 'error' | 'maintenance';
  lastSeen: Date;
  batteryLevel?: number;
  signalStrength: number;
  location: string;
  data?: any;
}

interface IoTMetrics {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  errorDevices: number;
  averageSignalStrength: number;
  totalDataPoints: number;
  averageResponseTime: number;
}

const IoTIntegrationDashboard: React.FC = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [metrics, setMetrics] = useState<IoTMetrics>({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    errorDevices: 0,
    averageSignalStrength: 0,
    totalDataPoints: 0,
    averageResponseTime: 0
  });
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDevices();
    loadMetrics();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadDevices();
      loadMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadDevices = async () => {
    try {
      const devicesData = await iotIntegrationEngine.getDevices();
      setDevices(devicesData);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const metricsData = await iotIntegrationEngine.getMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'maintenance':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sensor':
        return <Thermometer className="h-4 w-4" />;
      case 'camera':
        return <Camera className="h-4 w-4" />;
      case 'controller':
        return <Settings className="h-4 w-4" />;
      case 'monitor':
        return <Gauge className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeviceAction = async (deviceId: string, action: string) => {
    try {
      await iotIntegrationEngine.controlDevice(deviceId, action);
      await loadDevices();
    } catch (error) {
      console.error('Failed to control device:', error);
    }
  };

  const MetricCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color === 'text-green-600' ? 'bg-green-100' : color === 'text-red-600' ? 'bg-red-100' : 'bg-blue-100'}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <PageTemplate
        title="IoT Integration Dashboard"
        icon={<Wifi className="h-8 w-8 text-blue-500" />}
        description="Manage and monitor IoT devices and sensors"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        }
      >
        <div className="space-y-6">

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Devices"
          value={metrics.totalDevices}
          icon={<Activity className="h-5 w-5" />}
          color="text-blue-600"
        />
        <MetricCard
          title="Online"
          value={metrics.onlineDevices}
          icon={<CheckCircle className="h-5 w-5" />}
          color="text-green-600"
        />
        <MetricCard
          title="Offline"
          value={metrics.offlineDevices}
          icon={<WifiOff className="h-5 w-5" />}
          color="text-red-600"
        />
        <MetricCard
          title="Errors"
          value={metrics.errorDevices}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="text-yellow-600"
        />
      </div>

      <Tabs defaultValue="devices" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedDevice(device)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(device.type)}
                          {getStatusIcon(device.status)}
                        </div>
                        <div>
                          <h3 className="font-medium">{device.name}</h3>
                          <p className="text-sm text-gray-500">{device.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(device.status)}>
                          {device.status}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Wifi className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{device.signalStrength}%</span>
                        </div>
                        {device.batteryLevel && (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-3 border border-gray-300 rounded-sm">
                              <div
                                className={`h-full rounded-sm ${
                                  device.batteryLevel > 50 ? 'bg-green-500' : 
                                  device.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${device.batteryLevel}%` }}
                              />
                            </div>
                            <span className="text-sm">{device.batteryLevel}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Sensors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.filter(d => d.category === 'environmental').map((sensor) => (
                  <Card key={sensor.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{sensor.name}</span>
                      </div>
                      {getStatusIcon(sensor.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Temperature</span>
                        <span className="text-sm font-medium">
                          {sensor.data?.temperature || '--'}°C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Humidity</span>
                        <span className="text-sm font-medium">
                          {sensor.data?.humidity || '--'}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Air Quality</span>
                        <span className="text-sm font-medium">
                          {sensor.data?.airQuality || '--'}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Network Health</span>
                      <span className="text-sm text-gray-500">
                        {metrics.averageSignalStrength}%
                      </span>
                    </div>
                    <Progress value={metrics.averageSignalStrength} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">System Performance</span>
                      <span className="text-sm text-gray-500">
                        {Math.round(metrics.averageResponseTime)}ms
                      </span>
                    </div>
                    <Progress value={100 - (metrics.averageResponseTime / 10)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Security</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {devices.filter(d => d.category === 'security' && d.status === 'online').length}
                    </p>
                    <p className="text-sm text-gray-500">Active Cameras</p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Utility</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {devices.filter(d => d.category === 'utility' && d.status === 'online').length}
                    </p>
                    <p className="text-sm text-gray-500">Monitoring Systems</p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Maintenance</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {devices.filter(d => d.category === 'maintenance' && d.status === 'online').length}
                    </p>
                    <p className="text-sm text-gray-500">Active Sensors</p>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IoT Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">Device Status Distribution</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Online</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(metrics.onlineDevices / metrics.totalDevices) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{metrics.onlineDevices}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Offline</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${(metrics.offlineDevices / metrics.totalDevices) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{metrics.offlineDevices}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Errors</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: `${(metrics.errorDevices / metrics.totalDevices) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{metrics.errorDevices}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">System Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Total Data Points</span>
                        <span className="text-sm font-bold">{metrics.totalDataPoints.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Avg Response Time</span>
                        <span className="text-sm font-bold">{Math.round(metrics.averageResponseTime)}ms</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Network Uptime</span>
                        <span className="text-sm font-bold text-green-600">99.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Device Details Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  {getTypeIcon(selectedDevice.type)}
                  <span>{selectedDevice.name}</span>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDevice(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedDevice.status)}
                      <Badge className={getStatusColor(selectedDevice.status)}>
                        {selectedDevice.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="mt-1">{selectedDevice.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Signal Strength</p>
                    <p className="mt-1">{selectedDevice.signalStrength}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Seen</p>
                    <p className="mt-1">{selectedDevice.lastSeen.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeviceAction(selectedDevice.id, 'restart')}
                  >
                    Restart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeviceAction(selectedDevice.id, 'calibrate')}
                  >
                    Calibrate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeviceAction(selectedDevice.id, 'update')}
                  >
                    Update Firmware
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default IoTIntegrationDashboard;