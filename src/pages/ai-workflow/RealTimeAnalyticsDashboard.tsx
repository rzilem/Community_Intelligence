import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Clock,
  Database,
  Wifi,
  WifiOff,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  LineChart,
  PieChart,
  Settings
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import { analyticsEngine } from '@/services/analytics/realtime';
import { devLog } from '@/utils/dev-logger';
import AppLayout from '@/components/layout/AppLayout';
import PageTemplate from '@/components/layout/PageTemplate';

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  timestamp: string;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  metric: string;
  timestamp: string;
  acknowledged: boolean;
}

const RealTimeAnalyticsDashboard: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Chart colors
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4'
  };

  useEffect(() => {
    // Initialize real-time analytics
    initializeRealTimeAnalytics();
    
    return () => {
      if (isStreaming) {
        stopStreaming();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isStreaming) {
      interval = setInterval(() => {
        fetchRealTimeData();
      }, refreshInterval);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isStreaming, refreshInterval]);

  const initializeRealTimeAnalytics = async () => {
    try {
      devLog.info('Initializing real-time analytics');
      
      // Load initial data
      await fetchRealTimeData();
      await fetchHistoricalData();
      
      setConnectionStatus('connected');
    } catch (error) {
      devLog.error('Failed to initialize real-time analytics', error);
      setConnectionStatus('disconnected');
    }
  };

  const fetchRealTimeData = async () => {
    try {
      const data = await analyticsEngine.getRealTimeMetrics();
      setMetrics(data.metrics);
      
      // Check for alerts
      const newAlerts: Alert[] = data.metrics
        .filter(metric => metric.changePercent > 50 || metric.changePercent < -30)
        .map(metric => ({
          id: `alert-${metric.id}-${Date.now()}`,
          type: (metric.changePercent > 50 ? 'warning' : 'error') as 'warning' | 'error',
          message: `${metric.name} has ${metric.changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(metric.changePercent)}%`,
          metric: metric.name,
          timestamp: new Date().toISOString(),
          acknowledged: false
        }));
      
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 20));
      setLastUpdated(new Date());
      
      devLog.info('Real-time data updated', { metricsCount: data.metrics.length });
    } catch (error) {
      devLog.error('Failed to fetch real-time data', error);
      setConnectionStatus('disconnected');
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const data = await analyticsEngine.getHistoricalData(selectedTimeRange);
      setHistoricalData(data);
    } catch (error) {
      devLog.error('Failed to fetch historical data', error);
    }
  };

  const startStreaming = async () => {
    setIsStreaming(true);
    setConnectionStatus('connecting');
    
    try {
      await analyticsEngine.startRealTimeStream();
      setConnectionStatus('connected');
      devLog.info('Real-time streaming started');
    } catch (error) {
      devLog.error('Failed to start streaming', error);
      setConnectionStatus('disconnected');
      setIsStreaming(false);
    }
  };

  const stopStreaming = async () => {
    setIsStreaming(false);
    
    try {
      await analyticsEngine.stopRealTimeStream();
      setConnectionStatus('disconnected');
      devLog.info('Real-time streaming stopped');
    } catch (error) {
      devLog.error('Failed to stop streaming', error);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const getMetricIcon = (name: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'Active Users': Users,
      'Revenue': DollarSign,
      'System Load': Activity,
      'Response Time': Clock,
      'Database Queries': Database,
      'API Calls': TrendingUp
    };
    
    return iconMap[name] || Activity;
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'currency') {
      return `$${value.toLocaleString()}`;
    }
    if (unit === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === 'ms') {
      return `${value.toFixed(0)}ms`;
    }
    return value.toLocaleString();
  };

  const MetricCard: React.FC<{ metric: RealTimeMetric }> = ({ metric }) => {
    const Icon = getMetricIcon(metric.name);
    
    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(metric.value, metric.unit)}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {metric.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {metric.trend === 'stable' && <Activity className="h-3 w-3 text-gray-500" />}
            <span className={`${metric.changePercent > 0 ? 'text-green-500' : metric.changePercent < 0 ? 'text-red-500' : 'text-gray-500'}`}>
              {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
            </span>
            <span>from last hour</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AlertItem: React.FC<{ alert: Alert }> = ({ alert }) => {
    const getBadgeVariant = (type: string) => {
      switch (type) {
        case 'error': return 'destructive';
        case 'warning': return 'secondary';
        default: return 'default';
      }
    };

    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${alert.acknowledged ? 'opacity-50' : ''}`}>
        <div className="flex items-center space-x-3">
          <AlertTriangle className={`h-4 w-4 ${alert.type === 'error' ? 'text-red-500' : 'text-yellow-500'}`} />
          <div>
            <p className="text-sm font-medium">{alert.message}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getBadgeVariant(alert.type)}>{alert.type}</Badge>
          {!alert.acknowledged && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => acknowledgeAlert(alert.id)}
            >
              Acknowledge
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <PageTemplate
        title="Real-Time Analytics"
        icon={<Activity className="h-8 w-8 text-blue-500" />}
        description="Live monitoring and performance insights"
        actions={
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' && <Wifi className="h-4 w-4 text-green-500" />}
              {connectionStatus === 'disconnected' && <WifiOff className="h-4 w-4 text-red-500" />}
              {connectionStatus === 'connecting' && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
              <span className="text-sm text-muted-foreground">
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
            
            <Button
              variant={isStreaming ? "destructive" : "default"}
              size="sm"
              onClick={isStreaming ? stopStreaming : startStreaming}
              disabled={connectionStatus === 'connecting'}
            >
              {isStreaming ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isStreaming ? 'Stop' : 'Start'} Streaming
            </Button>
          </div>
        }
      >
        <div className="space-y-6">

        {/* Connection Status */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">System Status</p>
                <p className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Refresh Rate</p>
                  <p className="text-sm font-medium">{refreshInterval / 1000}s</p>
                </div>
                <Progress value={isStreaming ? 100 : 0} className="w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Performance Trends</CardTitle>
                  <div className="flex items-center space-x-2">
                    {(['1h', '6h', '24h', '7d'] as const).map((range) => (
                      <Button
                        key={range}
                        variant={selectedTimeRange === range ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTimeRange(range)}
                      >
                        {range}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="line" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="line">
                      <LineChart className="h-4 w-4 mr-2" />
                      Line
                    </TabsTrigger>
                    <TabsTrigger value="bar">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Bar
                    </TabsTrigger>
                    <TabsTrigger value="pie">
                      <PieChart className="h-4 w-4 mr-2" />
                      Pie
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="line" className="mt-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="timestamp" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke={chartColors.primary} strokeWidth={2} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="bar" className="mt-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="timestamp" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill={chartColors.secondary} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pie" className="mt-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Tooltip />
                          {/* Pie chart implementation would go here */}
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Alerts</span>
                  <Badge variant="secondary">{alerts.filter(a => !a.acknowledged).length}</Badge>
                </CardTitle>
                <CardDescription>
                  System alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No alerts at this time</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <AlertItem key={alert.id} alert={alert} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>
              Real-time system health and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-muted-foreground">67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Network I/O</span>
                  <span className="text-sm text-muted-foreground">23%</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </PageTemplate>
    </AppLayout>
  );
};

export default RealTimeAnalyticsDashboard;