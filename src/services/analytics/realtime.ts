import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  timestamp: string;
}

export interface HistoricalDataPoint {
  timestamp: string;
  value: number;
  metric: string;
}

export interface RealTimeAnalyticsData {
  metrics: RealTimeMetric[];
  lastUpdated: string;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export class RealTimeAnalyticsEngine {
  private streamingInterval: NodeJS.Timeout | null = null;
  private isStreaming = false;
  private subscribers: Array<(data: RealTimeAnalyticsData) => void> = [];

  async getRealTimeMetrics(): Promise<RealTimeAnalyticsData> {
    try {
      // Generate mock real-time metrics for demonstration
      const baseMetrics = [
        { name: 'Active Users', baseValue: 1250, unit: 'count' },
        { name: 'Revenue', baseValue: 45670, unit: 'currency' },
        { name: 'System Load', baseValue: 68, unit: 'percentage' },
        { name: 'Response Time', baseValue: 150, unit: 'ms' },
        { name: 'Database Queries', baseValue: 890, unit: 'count' },
        { name: 'API Calls', baseValue: 2340, unit: 'count' },
        { name: 'Error Rate', baseValue: 0.5, unit: 'percentage' },
        { name: 'Uptime', baseValue: 99.9, unit: 'percentage' }
      ];

      const metrics: RealTimeMetric[] = baseMetrics.map((base, index) => {
        // Generate realistic fluctuations
        const fluctuation = (Math.random() - 0.5) * 0.2; // ±10% variation
        const currentValue = base.baseValue * (1 + fluctuation);
        const previousValue = base.baseValue * (1 + (Math.random() - 0.5) * 0.15);
        const change = currentValue - previousValue;
        const changePercent = (change / previousValue) * 100;

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (Math.abs(changePercent) > 1) {
          trend = changePercent > 0 ? 'up' : 'down';
        }

        return {
          id: `metric-${index}`,
          name: base.name,
          value: currentValue,
          change,
          changePercent,
          trend,
          unit: base.unit,
          timestamp: new Date().toISOString()
        };
      });

      return {
        metrics,
        lastUpdated: new Date().toISOString(),
        connectionStatus: 'connected'
      };
    } catch (error) {
      devLog.error('Failed to get real-time metrics', error);
      throw error;
    }
  }

  async getHistoricalData(timeRange: '1h' | '6h' | '24h' | '7d'): Promise<HistoricalDataPoint[]> {
    try {
      const now = new Date();
      const dataPoints: HistoricalDataPoint[] = [];
      
      // Generate mock historical data points
      const intervals = {
        '1h': { points: 60, intervalMs: 60000 }, // 1 minute intervals
        '6h': { points: 72, intervalMs: 300000 }, // 5 minute intervals
        '24h': { points: 96, intervalMs: 900000 }, // 15 minute intervals
        '7d': { points: 168, intervalMs: 3600000 } // 1 hour intervals
      };

      const config = intervals[timeRange];
      
      for (let i = config.points; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * config.intervalMs));
        const baseValue = 1000 + Math.sin((i / config.points) * Math.PI * 2) * 300;
        const noise = (Math.random() - 0.5) * 100;
        
        dataPoints.push({
          timestamp: timestamp.toISOString(),
          value: Math.max(0, baseValue + noise),
          metric: 'primary'
        });
      }

      return dataPoints;
    } catch (error) {
      devLog.error('Failed to get historical data', error);
      throw error;
    }
  }

  async startRealTimeStream(): Promise<void> {
    try {
      if (this.isStreaming) {
        return;
      }

      this.isStreaming = true;
      devLog.info('Starting real-time analytics stream');

      // Set up real-time subscription to database changes
      const subscription = supabase
        .channel('analytics-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public' }, 
          (payload) => {
            devLog.info('Database change detected', payload);
            this.notifySubscribers();
          }
        )
        .subscribe();

      // Also set up periodic updates for demonstration
      this.streamingInterval = setInterval(async () => {
        if (this.isStreaming) {
          await this.notifySubscribers();
        }
      }, 2000); // Update every 2 seconds

      return Promise.resolve();
    } catch (error) {
      devLog.error('Failed to start real-time stream', error);
      throw error;
    }
  }

  async stopRealTimeStream(): Promise<void> {
    try {
      this.isStreaming = false;
      
      if (this.streamingInterval) {
        clearInterval(this.streamingInterval);
        this.streamingInterval = null;
      }

      // Unsubscribe from database changes
      await supabase.removeAllChannels();
      
      devLog.info('Real-time analytics stream stopped');
    } catch (error) {
      devLog.error('Failed to stop real-time stream', error);
      throw error;
    }
  }

  private async notifySubscribers(): Promise<void> {
    try {
      const data = await this.getRealTimeMetrics();
      this.subscribers.forEach(subscriber => {
        try {
          subscriber(data);
        } catch (error) {
          devLog.error('Error notifying subscriber', error);
        }
      });
    } catch (error) {
      devLog.error('Failed to notify subscribers', error);
    }
  }

  subscribe(callback: (data: RealTimeAnalyticsData) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Advanced analytics methods
  async getSystemPerformance(): Promise<{
    cpu: number;
    memory: number;
    network: number;
    disk: number;
  }> {
    try {
      // Mock system performance data
      return {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 100,
        disk: Math.random() * 100
      };
    } catch (error) {
      devLog.error('Failed to get system performance', error);
      throw error;
    }
  }

  async getAlerts(): Promise<Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }>> {
    try {
      // Generate mock alerts based on current metrics
      const alerts = [];
      const metrics = await this.getRealTimeMetrics();
      
      for (const metric of metrics.metrics) {
        if (Math.abs(metric.changePercent) > 25) {
          alerts.push({
            id: `alert-${metric.id}-${Date.now()}`,
            type: metric.changePercent > 0 ? 'warning' : 'error' as const,
            message: `${metric.name} ${metric.changePercent > 0 ? 'spike' : 'drop'} detected: ${metric.changePercent.toFixed(1)}%`,
            timestamp: new Date().toISOString(),
            acknowledged: false
          });
        }
      }

      return alerts;
    } catch (error) {
      devLog.error('Failed to get alerts', error);
      throw error;
    }
  }

  async predictTrends(metric: string, hours: number = 24): Promise<{
    prediction: number[];
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }> {
    try {
      // Simple trend prediction using historical data
      const historical = await this.getHistoricalData('24h');
      const values = historical.map(d => d.value);
      
      // Calculate trend using linear regression
      const n = values.length;
      const sumX = values.reduce((sum, _, i) => sum + i, 0);
      const sumY = values.reduce((sum, val) => sum + val, 0);
      const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
      const sumXX = values.reduce((sum, _, i) => sum + i * i, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      // Generate predictions
      const predictions = [];
      for (let i = 0; i < hours; i++) {
        const predictedValue = intercept + slope * (n + i);
        predictions.push(Math.max(0, predictedValue));
      }
      
      const trend = slope > 5 ? 'increasing' : slope < -5 ? 'decreasing' : 'stable';
      const confidence = Math.max(0.1, Math.min(0.9, 1 - Math.abs(slope) / 100));
      
      return {
        prediction: predictions,
        confidence,
        trend
      };
    } catch (error) {
      devLog.error('Failed to predict trends', error);
      throw error;
    }
  }
}

export const analyticsEngine = new RealTimeAnalyticsEngine();