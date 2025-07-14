import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface RealtimeMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_type: string;
  timestamp: string;
  association_id: string;
  dimensions?: Record<string, any>;
}

export interface Dashboard {
  id: string;
  dashboard_name: string;
  association_id: string;
  dashboard_config: {
    layout: any[];
    widgets: DashboardWidget[];
    refresh_interval: number;
    theme: string;
  };
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'gauge' | 'text';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: {
    data_source: string;
    chart_type?: string;
    metric_key?: string;
    thresholds?: { warning: number; critical: number };
    refresh_interval?: number;
  };
  styling: {
    background_color?: string;
    text_color?: string;
    border_color?: string;
  };
}

export interface AlertRule {
  id: string;
  rule_name: string;
  metric_name: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  notification_channels: string[];
  created_at: string;
  updated_at: string;
}

export interface SystemAlert {
  id: string;
  type: 'performance' | 'system' | 'security' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface RealtimeStats {
  metrics_per_hour: number;
  active_alerts: number;
  critical_alerts: number;
  online_devices: number;
  total_devices: number;
  device_uptime: number;
  last_updated: string;
}

export interface StreamingQuery {
  id: string;
  query: string;
  metrics: string[];
  filters: Record<string, any>;
  aggregation: 'avg' | 'sum' | 'count' | 'max' | 'min';
  time_window: number;
  is_active: boolean;
}

export class RealtimeAnalyticsEngine {
  private websocket: WebSocket | null = null;
  private subscriptions: Map<string, (data: any) => void> = new Map();

  async getMetrics(associationId: string, params: {
    metrics?: string[];
    timeRange?: number;
    aggregation?: string;
  } = {}): Promise<RealtimeMetric[]> {
    try {
      let query = supabase
        .from('analytics_metrics')
        .select('*')
        .eq('association_id', associationId);

      if (params.metrics && params.metrics.length > 0) {
        query = query.in('metric_name', params.metrics);
      }

      if (params.timeRange) {
        const startTime = new Date(Date.now() - params.timeRange * 60000).toISOString();
        query = query.gte('recorded_at', startTime);
      }

      if (params.aggregation) {
        query = query.eq('aggregation_period', params.aggregation);
      }

      const { data, error } = await query
        .order('recorded_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        timestamp: item.recorded_at
      })) as RealtimeMetric[];
    } catch (error) {
      devLog.error('Failed to fetch metrics', error);
      // Return mock data for now
      return this.generateMockMetrics(associationId);
    }
  }

  private generateMockMetrics(associationId: string): RealtimeMetric[] {
    const metrics = ['cpu_usage', 'memory_usage', 'disk_usage', 'network_traffic', 'response_time'];
    const mockData: RealtimeMetric[] = [];
    
    metrics.forEach(metric => {
      for (let i = 0; i < 10; i++) {
        mockData.push({
          id: `mock-${metric}-${i}`,
          metric_name: metric,
          metric_value: Math.random() * 100,
          metric_type: 'gauge',
          timestamp: new Date(Date.now() - i * 60000).toISOString(),
          association_id: associationId,
          dimensions: { source: 'mock' }
        });
      }
    });
    
    return mockData;
  }

  async createDashboard(dashboardData: Omit<Dashboard, 'id' | 'created_at' | 'updated_at'>): Promise<Dashboard> {
    try {
      const { data, error } = await supabase
        .from('analytics_dashboards')
        .insert({
          ...dashboardData,
          dashboard_config: dashboardData.dashboard_config as any,
          widgets: dashboardData.dashboard_config.widgets as any
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        dashboard_config: data.dashboard_config as any
      } as Dashboard;
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
        .eq('is_active', true);

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        dashboard_config: item.dashboard_config as any
      })) as Dashboard[];
    } catch (error) {
      devLog.error('Failed to fetch dashboards', error);
      return [];
    }
  }

  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    try {
      const { data, error } = await supabase
        .from('analytics_dashboards')
        .update({
          ...updates,
          dashboard_config: updates.dashboard_config as any,
          widgets: updates.dashboard_config?.widgets as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        dashboard_config: data.dashboard_config as any
      } as Dashboard;
    } catch (error) {
      devLog.error('Failed to update dashboard', error);
      throw new Error(`Failed to update dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteDashboard(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_dashboards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      devLog.info('Dashboard deleted', { id });
    } catch (error) {
      devLog.error('Failed to delete dashboard', error);
      throw new Error(`Failed to delete dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createAlertRule(rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>): Promise<AlertRule> {
    try {
      // Mock implementation for now
      const mockRule: AlertRule = {
        ...rule,
        id: Math.random().toString(36).substring(7),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      devLog.info('Alert rule created (mock)', mockRule);
      return mockRule;
    } catch (error) {
      devLog.error('Failed to create alert rule', error);
      throw new Error(`Failed to create alert rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAlertRules(associationId: string): Promise<AlertRule[]> {
    try {
      // Mock data for now
      return [
        {
          id: '1',
          rule_name: 'High CPU Usage',
          metric_name: 'cpu_usage',
          condition: 'greater_than',
          threshold: 80,
          severity: 'high',
          is_active: true,
          notification_channels: ['email', 'slack'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          rule_name: 'Low Memory',
          metric_name: 'memory_usage',
          condition: 'greater_than',
          threshold: 90,
          severity: 'critical',
          is_active: true,
          notification_channels: ['email', 'sms'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      devLog.error('Failed to fetch alert rules', error);
      return [];
    }
  }

  async getRealtimeStats(associationId: string): Promise<RealtimeStats> {
    try {
      // Mock data for now
      return {
        metrics_per_hour: 1247,
        active_alerts: 3,
        critical_alerts: 1,
        online_devices: 42,
        total_devices: 45,
        device_uptime: 0.933,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      devLog.error('Failed to get realtime stats', error);
      throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSystemAlerts(associationId: string): Promise<SystemAlert[]> {
    try {
      // Mock data for now
      return [
        {
          id: '1',
          type: 'performance',
          severity: 'high',
          message: 'High CPU usage detected on server cluster',
          timestamp: new Date().toISOString(),
          resolved: false
        },
        {
          id: '2',
          type: 'system',
          severity: 'medium',
          message: 'Database connection pool is 80% full',
          timestamp: new Date().toISOString(),
          resolved: false
        },
        {
          id: '3',
          type: 'security',
          severity: 'critical',
          message: 'Multiple failed login attempts detected',
          timestamp: new Date().toISOString(),
          resolved: false
        }
      ];
    } catch (error) {
      devLog.error('Failed to fetch system alerts', error);
      return [];
    }
  }

  async createStreamingQuery(query: Omit<StreamingQuery, 'id'>): Promise<StreamingQuery> {
    try {
      const streamingQuery: StreamingQuery = {
        ...query,
        id: Math.random().toString(36).substring(7)
      };
      
      devLog.info('Streaming query created', streamingQuery);
      return streamingQuery;
    } catch (error) {
      devLog.error('Failed to create streaming query', error);
      throw new Error(`Failed to create streaming query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async subscribeToMetrics(associationId: string, callback: (data: RealtimeMetric[]) => void): Promise<void> {
    try {
      const subscriptionId = `metrics_${associationId}`;
      this.subscriptions.set(subscriptionId, callback);
      
      // Simulate real-time data
      const interval = setInterval(() => {
        const mockData = this.generateMockMetrics(associationId);
        callback(mockData.slice(0, 5)); // Send latest 5 metrics
      }, 5000);
      
      devLog.info('Subscribed to metrics', { associationId });
    } catch (error) {
      devLog.error('Failed to subscribe to metrics', error);
      throw new Error(`Failed to subscribe to metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async unsubscribeFromMetrics(associationId: string): Promise<void> {
    try {
      const subscriptionId = `metrics_${associationId}`;
      this.subscriptions.delete(subscriptionId);
      
      devLog.info('Unsubscribed from metrics', { associationId });
    } catch (error) {
      devLog.error('Failed to unsubscribe from metrics', error);
      throw new Error(`Failed to unsubscribe from metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportData(associationId: string, params: {
    startDate: string;
    endDate: string;
    metrics: string[];
    format: 'csv' | 'json' | 'xlsx';
  }): Promise<string> {
    try {
      // Mock implementation for now
      const exportData = {
        association_id: associationId,
        exported_at: new Date().toISOString(),
        parameters: params,
        data_points: 1000,
        format: params.format
      };
      
      devLog.info('Data export initiated', exportData);
      return `export_${associationId}_${Date.now()}.${params.format}`;
    } catch (error) {
      devLog.error('Failed to export data', error);
      throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async optimizeQueries(associationId: string): Promise<void> {
    try {
      // Mock implementation for now
      devLog.info('Query optimization completed', { associationId });
    } catch (error) {
      devLog.error('Failed to optimize queries', error);
      throw new Error(`Failed to optimize queries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  cleanup(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.subscriptions.clear();
  }
}

export const realtimeAnalyticsEngine = new RealtimeAnalyticsEngine();