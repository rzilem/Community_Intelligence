import { supabase } from '@/integrations/supabase/client';

export interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  version: string;
  rateLimitPerMinute: number;
  requiresAuth: boolean;
  permissions: string[];
  deprecated: boolean;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  associationId?: string;
  permissions: string[];
  rateLimitPerMinute: number;
  expiresAt?: Date;
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
}

export interface APIUsageMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  apiKeyId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export class APIGatewayService {
  private static readonly ENDPOINTS: APIEndpoint[] = [
    // Association Management
    {
      id: 'get-associations',
      path: '/api/v1/associations',
      method: 'GET',
      description: 'Retrieve all associations for authenticated user',
      version: 'v1',
      rateLimitPerMinute: 100,
      requiresAuth: true,
      permissions: ['associations:read'],
      deprecated: false
    },
    {
      id: 'create-association',
      path: '/api/v1/associations',
      method: 'POST',
      description: 'Create a new association',
      version: 'v1',
      rateLimitPerMinute: 10,
      requiresAuth: true,
      permissions: ['associations:write'],
      deprecated: false
    },
    
    // Property Management
    {
      id: 'get-properties',
      path: '/api/v1/properties',
      method: 'GET',
      description: 'Retrieve properties with filtering and pagination',
      version: 'v1',
      rateLimitPerMinute: 200,
      requiresAuth: true,
      permissions: ['properties:read'],
      deprecated: false
    },
    {
      id: 'create-property',
      path: '/api/v1/properties',
      method: 'POST',
      description: 'Create a new property',
      version: 'v1',
      rateLimitPerMinute: 20,
      requiresAuth: true,
      permissions: ['properties:write'],
      deprecated: false
    },
    
    // Financial Management
    {
      id: 'get-assessments',
      path: '/api/v1/assessments',
      method: 'GET',
      description: 'Retrieve assessment data',
      version: 'v1',
      rateLimitPerMinute: 150,
      requiresAuth: true,
      permissions: ['financials:read'],
      deprecated: false
    },
    {
      id: 'create-payment',
      path: '/api/v1/payments',
      method: 'POST',
      description: 'Process a payment transaction',
      version: 'v1',
      rateLimitPerMinute: 30,
      requiresAuth: true,
      permissions: ['financials:write'],
      deprecated: false
    },
    
    // Communication
    {
      id: 'send-message',
      path: '/api/v1/communications/messages',
      method: 'POST',
      description: 'Send message to residents or groups',
      version: 'v1',
      rateLimitPerMinute: 50,
      requiresAuth: true,
      permissions: ['communications:write'],
      deprecated: false
    },
    
    // Analytics & Reporting
    {
      id: 'get-analytics',
      path: '/api/v1/analytics',
      method: 'GET',
      description: 'Retrieve analytics data and insights',
      version: 'v1',
      rateLimitPerMinute: 100,
      requiresAuth: true,
      permissions: ['analytics:read'],
      deprecated: false
    }
  ];

  static getEndpoints(): APIEndpoint[] {
    return this.ENDPOINTS;
  }

  static getEndpoint(path: string, method: string): APIEndpoint | undefined {
    return this.ENDPOINTS.find(endpoint => 
      endpoint.path === path && endpoint.method === method
    );
  }

  static async validateAPIKey(apiKey: string): Promise<APIKey | null> {
    try {
      const { data } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key', apiKey)
        .eq('is_active', true)
        .single();

      if (!data) return null;

      // Check if key has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        key: data.key,
        associationId: data.association_id,
        permissions: data.permissions || [],
        rateLimitPerMinute: data.rate_limit_per_minute || 100,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
        isActive: data.is_active,
        lastUsed: data.last_used ? new Date(data.last_used) : undefined,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error validating API key:', error);
      return null;
    }
  }

  static async checkRateLimit(apiKeyId: string, endpoint: string): Promise<boolean> {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

      const { count } = await supabase
        .from('api_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('api_key_id', apiKeyId)
        .eq('endpoint', endpoint)
        .gte('timestamp', oneMinuteAgo.toISOString());

      const apiKey = await this.validateAPIKey(apiKeyId);
      if (!apiKey) return false;

      return (count || 0) < apiKey.rateLimitPerMinute;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return false;
    }
  }

  static async logAPIUsage(metrics: APIUsageMetrics): Promise<void> {
    try {
      await supabase
        .from('api_usage_logs')
        .insert({
          endpoint: metrics.endpoint,
          method: metrics.method,
          status_code: metrics.statusCode,
          response_time: metrics.responseTime,
          timestamp: metrics.timestamp.toISOString(),
          api_key_id: metrics.apiKeyId,
          user_agent: metrics.userAgent,
          ip_address: metrics.ipAddress
        });
    } catch (error) {
      console.error('Error logging API usage:', error);
    }
  }

  static async getAPIMetrics(associationId?: string, timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
    requestsOverTime: Array<{ timestamp: string; count: number }>;
  }> {
    try {
      const now = new Date();
      let startTime: Date;

      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      let query = supabase
        .from('api_usage_logs')
        .select('*')
        .gte('timestamp', startTime.toISOString());

      if (associationId) {
        // Filter by association if provided
        const { data: apiKeys } = await supabase
          .from('api_keys')
          .select('id')
          .eq('association_id', associationId);

        if (apiKeys && apiKeys.length > 0) {
          const keyIds = apiKeys.map(key => key.id);
          query = query.in('api_key_id', keyIds);
        }
      }

      const { data: usageLogs } = await query;

      if (!usageLogs || usageLogs.length === 0) {
        return {
          totalRequests: 0,
          averageResponseTime: 0,
          errorRate: 0,
          topEndpoints: [],
          requestsOverTime: []
        };
      }

      const totalRequests = usageLogs.length;
      const averageResponseTime = Math.round(
        usageLogs.reduce((sum, log) => sum + (log.response_time || 0), 0) / totalRequests
      );
      const errorCount = usageLogs.filter(log => log.status_code >= 400).length;
      const errorRate = Math.round((errorCount / totalRequests) * 100);

      // Top endpoints
      const endpointCounts: Record<string, number> = {};
      usageLogs.forEach(log => {
        endpointCounts[log.endpoint] = (endpointCounts[log.endpoint] || 0) + 1;
      });
      const topEndpoints = Object.entries(endpointCounts)
        .map(([endpoint, count]) => ({ endpoint, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Requests over time (hourly buckets)
      const hourlyData: Record<string, number> = {};
      usageLogs.forEach(log => {
        const hour = new Date(log.timestamp).toISOString().slice(0, 13) + ':00:00.000Z';
        hourlyData[hour] = (hourlyData[hour] || 0) + 1;
      });
      const requestsOverTime = Object.entries(hourlyData)
        .map(([timestamp, count]) => ({ timestamp, count }))
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

      return {
        totalRequests,
        averageResponseTime,
        errorRate,
        topEndpoints,
        requestsOverTime
      };
    } catch (error) {
      console.error('Error getting API metrics:', error);
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        topEndpoints: [],
        requestsOverTime: []
      };
    }
  }
}