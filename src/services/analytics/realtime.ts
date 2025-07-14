import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface RealtimeMetric {
  id: string;
  association_id: string;
  metric_name: string;
  metric_type: 'counter' | 'gauge' | 'histogram' | 'summary';
  metric_value: number;
  dimensions: Record<string, string>;
  timestamp: string;
  aggregation_period: 'minute' | 'hour' | 'day';
}

export interface Dashboard {
  id: string;
  association_id: string;
  dashboard_name: string;
  dashboard_config: {
    layout: any[];
    widgets: DashboardWidget[];
    refresh_interval: number;
    theme: string;
  };
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'alert_summary' | 'device_status';
  title: string;
  position: { x: number; y: number; width: number; height: number };
  config: {
    data_source: string;
    visualization_type?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    metrics: string[];
    time_range: '1h' | '6h' | '24h' | '7d' | '30d';
    filters?: Record<string, any>;
    aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  };
  created_at: string;
  updated_at: string;
}

export interface AlertRule {
  id: string;
  association_id: string;
  rule_name: string;
  metric_name: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'contains';
  threshold_value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notification_channels: ('email' | 'sms' | 'webhook' | 'in_app')[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StreamingData {
  source: string;
  timestamp: string;
  data: Record<string, any>;
  metadata: {
    version: string;
    quality: 'high' | 'medium' | 'low';
    latency_ms: number;
  };
}

export class RealtimeAnalyticsEngine {
  private websocketConnections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, any> = new Map();

  async recordMetric(metric: Omit<RealtimeMetric, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_metrics')
        .insert({
          ...metric,
          recorded_at: new Date().toISOString()
        });

      if (error) throw error;
      
      devLog.info('Recorded realtime metric', metric);
    } catch (error) {
      devLog.error('Failed to record metric', error);
      throw new Error(`Failed to record metric: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMetrics(params: {
    association_id: string;
    metric_names?: string[];
    time_range?: string;
    aggregation?: 'minute' | 'hour' | 'day';
    filters?: Record<string, any>;
  }): Promise<RealtimeMetric[]> {
    try {
      let query = supabase
        .from('analytics_metrics')
        .select('*')
        .eq('association_id', params.association_id);

      if (params.metric_names && params.metric_names.length > 0) {
        query = query.in('metric_name', params.metric_names);
      }

      if (params.time_range) {
        const timeRangeHours = this.parseTimeRange(params.time_range);
        const startTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000).toISOString();
        query = query.gte('recorded_at', startTime);
      }

      if (params.aggregation) {
        query = query.eq('aggregation_period', params.aggregation);
      }

      const { data, error } = await query
        .order('recorded_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      
      return (data as RealtimeMetric[]) || [];
    } catch (error) {
      devLog.error('Failed to fetch metrics', error);
      throw new Error(`Failed to fetch metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createDashboard(dashboardData: Omit<Dashboard, 'id' | 'created_at' | 'updated_at'>): Promise<Dashboard> {
    try {
      const { data, error } = await supabase
        .from('analytics_dashboards')
        .insert(dashboardData)
        .select()
        .single();

      if (error) throw error;
      
      devLog.info('Created analytics dashboard', data);
      return data as Dashboard;
    } catch (error) {
      devLog.error('Failed to create dashboard', error);
      throw new Error(`Failed to create dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDashboards(associationId: string): Promise<Dashboard[]> {
    try {
      const { data, error } = await supabase
        .from('analytics_dashboards')
        .select('*')
        .eq('association_id', associationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as Dashboard[]) || [];
    } catch (error) {
      devLog.error('Failed to fetch dashboards', error);
      throw new Error(`Failed to fetch dashboards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateDashboard(dashboardId: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    try {
      const { data, error } = await supabase
        .from('analytics_dashboards')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', dashboardId)
        .select()
        .single();

      if (error) throw error;
      
      devLog.info('Updated analytics dashboard', data);
      return data as Dashboard;
    } catch (error) {
      devLog.error('Failed to update dashboard', error);
      throw new Error(`Failed to update dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async startRealtimeStream(associationId: string, callback: (data: StreamingData) => void): Promise<string> {
    const streamId = `stream_${associationId}_${Date.now()}`;
    
    try {
      // Subscribe to realtime changes for analytics metrics
      const subscription = supabase
        .channel(streamId)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'analytics_metrics',
            filter: `association_id=eq.${associationId}`
          },
          (payload) => {
            const streamingData: StreamingData = {
              source: 'analytics_metrics',
              timestamp: new Date().toISOString(),
              data: payload.new,
              metadata: {
                version: '1.0',
                quality: 'high',
                latency_ms: Date.now() - new Date(payload.new.recorded_at).getTime()
              }
            };
            callback(streamingData);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'iot_sensor_readings'
          },
          (payload) => {
            const streamingData: StreamingData = {
              source: 'iot_sensors',
              timestamp: new Date().toISOString(),
              data: payload.new,
              metadata: {
                version: '1.0',
                quality: 'high',
                latency_ms: Date.now() - new Date(payload.new.timestamp).getTime()
              }
            };
            callback(streamingData);
          }
        )
        .subscribe();

      this.subscriptions.set(streamId, subscription);
      devLog.info('Started realtime analytics stream', { streamId, associationId });
      
      return streamId;
    } catch (error) {
      devLog.error('Failed to start realtime stream', error);
      throw new Error(`Failed to start stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stopRealtimeStream(streamId: string): Promise<void> {
    try {
      const subscription = this.subscriptions.get(streamId);
      if (subscription) {
        await supabase.removeChannel(subscription);
        this.subscriptions.delete(streamId);
        devLog.info('Stopped realtime analytics stream', { streamId });
      }
    } catch (error) {
      devLog.error('Failed to stop realtime stream', error);
      throw new Error(`Failed to stop stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRealtimeStats(associationId: string): Promise<Record<string, any>> {
    try {
      // Get various real-time statistics
      const now = new Date();
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

      const [metricsResult, alertsResult, devicesResult] = await Promise.all([
        supabase
          .from('analytics_metrics')
          .select('metric_name')
          .eq('association_id', associationId)
          .gte('recorded_at', lastHour.toISOString()),
        
        supabase
          .from('iot_alerts')
          .select('severity')
          .eq('is_acknowledged', false),
        
        supabase
          .from('iot_devices')
          .select('status')
          .eq('association_id', associationId)
      ]);

      const metrics = metricsResult.data || [];
      const alerts = alertsResult.data || [];
      const devices = devicesResult.data || [];

      return {
        metrics_per_hour: metrics.length,
        active_alerts: alerts.length,
        critical_alerts: alerts.filter(a => a.severity === 'critical').length,
        online_devices: devices.filter(d => d.status === 'online').length,
        total_devices: devices.length,
        device_uptime: devices.filter(d => d.status === 'online').length / devices.length || 0,
        last_updated: now.toISOString()
      };
    } catch (error) {
      devLog.error('Failed to get realtime stats', error);
      throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async aggregateMetrics(associationId: string, timeWindow: '1h' | '6h' | '24h'): Promise<Record<string, any>> {
    try {
      const timeRangeHours = this.parseTimeRange(timeWindow);
      const startTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('analytics_metrics')
        .select('metric_name, metric_value, metric_type')
        .eq('association_id', associationId)
        .gte('recorded_at', startTime);

      if (error) throw error;

      const metrics = data || [];
      const aggregated: Record<string, any> = {};

      // Group by metric name and calculate aggregations
      const grouped = metrics.reduce((acc, metric) => {
        if (!acc[metric.metric_name]) {
          acc[metric.metric_name] = [];
        }
        acc[metric.metric_name].push(metric.metric_value);
        return acc;
      }, {} as Record<string, number[]>);

      Object.entries(grouped).forEach(([metricName, values]) => {
        aggregated[metricName] = {
          count: values.length,
          sum: values.reduce((sum, val) => sum + val, 0),
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: values[values.length - 1]
        };
      });

      return aggregated;
    } catch (error) {
      devLog.error('Failed to aggregate metrics', error);
      throw new Error(`Failed to aggregate metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseTimeRange(timeRange: string): number {
    const timeRangeMap: Record<string, number> = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 168,
      '30d': 720
    };
    return timeRangeMap[timeRange] || 24;
  }
}

export const realtimeAnalyticsEngine = new RealtimeAnalyticsEngine();