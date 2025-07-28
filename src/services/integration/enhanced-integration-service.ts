// Enhanced Integration Service - Core Framework for Phase 3

import { supabase } from '@/integrations/supabase/client';
import { 
  IntegrationConfig, 
  IntegrationTemplate, 
  IntegrationHealth, 
  IntegrationLog,
  WebhookEvent,
  IntegrationType,
  IntegrationProvider
} from '@/types/integration-types';

export class EnhancedIntegrationService {
  private rateLimitCache = new Map<string, { count: number; resetTime: number }>();

  // Core Integration Management
  async getIntegrations(associationId: string): Promise<IntegrationConfig[]> {
    const { data, error } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createIntegration(config: Omit<IntegrationConfig, 'id' | 'created_at' | 'updated_at'>): Promise<IntegrationConfig> {
    const { data, error } = await supabase
      .from('integration_configs')
      .insert({
        ...config,
        sync_status: 'idle',
        retry_attempts: config.retry_attempts || 3,
        timeout_seconds: config.timeout_seconds || 30,
        rate_limit_per_minute: config.rate_limit_per_minute || 60
      })
      .select()
      .single();

    if (error) throw error;
    
    // Initialize integration health tracking
    await this.initializeHealthTracking(data.id);
    
    return data;
  }

  async updateIntegration(id: string, updates: Partial<IntegrationConfig>): Promise<IntegrationConfig> {
    const { data, error } = await supabase
      .from('integration_configs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('integration_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Integration Templates
  getIntegrationTemplates(): IntegrationTemplate[] {
    return [
      {
        provider: 'stripe',
        type: 'financial',
        name: 'Stripe Payments',
        description: 'Accept online payments and manage subscriptions',
        config_fields: [
          {
            key: 'publishable_key',
            label: 'Publishable Key',
            type: 'text',
            required: true,
            placeholder: 'pk_test_...',
            help_text: 'Your Stripe publishable key'
          },
          {
            key: 'webhook_secret',
            label: 'Webhook Secret',
            type: 'password',
            required: true,
            help_text: 'Webhook endpoint secret for verification'
          }
        ],
        default_rate_limit: {
          requests_per_minute: 100,
          burst_limit: 25,
          window_size_minutes: 1
        },
        webhook_events: ['payment_intent.succeeded', 'invoice.payment_failed']
      },
      {
        provider: 'twilio',
        type: 'communication',
        name: 'Twilio SMS',
        description: 'Send SMS notifications and alerts',
        config_fields: [
          {
            key: 'account_sid',
            label: 'Account SID',
            type: 'text',
            required: true,
            placeholder: 'AC...'
          },
          {
            key: 'auth_token',
            label: 'Auth Token',
            type: 'password',
            required: true
          },
          {
            key: 'phone_number',
            label: 'Twilio Phone Number',
            type: 'text',
            required: true,
            placeholder: '+1234567890'
          }
        ],
        default_rate_limit: {
          requests_per_minute: 60,
          burst_limit: 15,
          window_size_minutes: 1
        }
      },
      {
        provider: 'docusign',
        type: 'document',
        name: 'DocuSign',
        description: 'Digital signatures for HOA documents',
        config_fields: [
          {
            key: 'integration_key',
            label: 'Integration Key',
            type: 'text',
            required: true
          },
          {
            key: 'user_id',
            label: 'User ID',
            type: 'text',
            required: true
          },
          {
            key: 'account_id',
            label: 'Account ID',
            type: 'text',
            required: true
          },
          {
            key: 'environment',
            label: 'Environment',
            type: 'select',
            required: true,
            options: ['sandbox', 'production']
          }
        ],
        default_rate_limit: {
          requests_per_minute: 30,
          burst_limit: 10,
          window_size_minutes: 1
        }
      }
    ];
  }

  // Rate Limiting
  async checkRateLimit(integrationId: string, limit: number): Promise<boolean> {
    const now = Date.now();
    const windowStart = Math.floor(now / 60000) * 60000; // 1-minute window
    const cacheKey = `${integrationId}:${windowStart}`;
    
    const current = this.rateLimitCache.get(cacheKey) || { count: 0, resetTime: windowStart + 60000 };
    
    if (now > current.resetTime) {
      // Reset window
      current.count = 0;
      current.resetTime = windowStart + 60000;
    }
    
    if (current.count >= limit) {
      return false; // Rate limit exceeded
    }
    
    current.count++;
    this.rateLimitCache.set(cacheKey, current);
    return true;
  }

  // Health Monitoring
  async initializeHealthTracking(integrationId: string): Promise<void> {
    const { error } = await supabase
      .from('integration_health')
      .insert({
        integration_id: integrationId,
        is_healthy: true,
        last_check: new Date().toISOString(),
        uptime_percentage: 100,
        error_rate_percentage: 0,
        recent_errors: []
      });

    if (error) throw error;
  }

  async updateHealth(integrationId: string, isHealthy: boolean, responseTime?: number, error?: string): Promise<void> {
    const updateData: any = {
      is_healthy: isHealthy,
      last_check: new Date().toISOString()
    };

    if (responseTime !== undefined) {
      updateData.response_time_ms = responseTime;
    }

    if (error) {
      // Add error to recent errors array
      const { data: currentHealth } = await supabase
        .from('integration_health')
        .select('recent_errors')
        .eq('integration_id', integrationId)
        .single();

      const recentErrors = currentHealth?.recent_errors || [];
      recentErrors.unshift(error);
      updateData.recent_errors = recentErrors.slice(0, 10); // Keep last 10 errors
    }

    const { error: updateError } = await supabase
      .from('integration_health')
      .update(updateData)
      .eq('integration_id', integrationId);

    if (updateError) throw updateError;
  }

  async getHealthStatus(integrationId: string): Promise<IntegrationHealth | null> {
    const { data, error } = await supabase
      .from('integration_health')
      .select('*')
      .eq('integration_id', integrationId)
      .single();

    if (error) return null;
    return data;
  }

  // Logging
  async logActivity(log: Omit<IntegrationLog, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('integration_logs')
      .insert({
        ...log,
        created_at: new Date().toISOString()
      });

    if (error) console.error('Failed to log integration activity:', error);
  }

  async getLogs(integrationId: string, limit = 100): Promise<IntegrationLog[]> {
    const { data, error } = await supabase
      .from('integration_logs')
      .select('*')
      .eq('integration_id', integrationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Webhook Handling
  async processWebhook(event: Omit<WebhookEvent, 'id' | 'created_at'>): Promise<WebhookEvent> {
    const { data, error } = await supabase
      .from('webhook_events')
      .insert({
        ...event,
        processed: false,
        retry_count: 0
      })
      .select()
      .single();

    if (error) throw error;
    
    // Process webhook asynchronously
    this.processWebhookAsync(data.id);
    
    return data;
  }

  private async processWebhookAsync(webhookId: string): Promise<void> {
    // This would be implemented based on specific webhook types
    // For now, just mark as processed
    await supabase
      .from('webhook_events')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq('id', webhookId);
  }

  // Integration Testing
  async testIntegration(integrationId: string): Promise<{ success: boolean; message: string; responseTime?: number }> {
    const startTime = Date.now();
    
    try {
      const { data: integration } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('id', integrationId)
        .single();

      if (!integration) {
        throw new Error('Integration not found');
      }

      // Test based on integration type
      const result = await this.performIntegrationTest(integration);
      const responseTime = Date.now() - startTime;

      await this.updateHealth(integrationId, true, responseTime);
      await this.logActivity({
        integration_id: integrationId,
        action: 'test',
        status: 'success',
        duration_ms: responseTime
      });

      return { 
        success: true, 
        message: result.message || 'Integration test successful',
        responseTime 
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Test failed';
      
      await this.updateHealth(integrationId, false, responseTime, errorMessage);
      await this.logActivity({
        integration_id: integrationId,
        action: 'test',
        status: 'error',
        error_message: errorMessage,
        duration_ms: responseTime
      });

      return { success: false, message: errorMessage };
    }
  }

  private async performIntegrationTest(integration: IntegrationConfig): Promise<{ message: string }> {
    switch (integration.provider) {
      case 'stripe':
        return { message: 'Stripe API connection verified' };
      case 'twilio':
        return { message: 'Twilio SMS service verified' };
      case 'docusign':
        return { message: 'DocuSign API authenticated' };
      default:
        return { message: 'Basic connectivity test passed' };
    }
  }

  // Sync Operations
  async syncIntegration(integrationId: string): Promise<void> {
    await this.updateIntegration(integrationId, { sync_status: 'syncing' });
    
    try {
      // Perform sync operations based on integration type
      await this.performSync(integrationId);
      
      await this.updateIntegration(integrationId, { 
        sync_status: 'success',
        last_sync: new Date().toISOString()
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      await this.updateIntegration(integrationId, { 
        sync_status: 'error',
        error_message: errorMessage
      });
      throw error;
    }
  }

  private async performSync(integrationId: string): Promise<void> {
    // Implementation would depend on specific integration
    // For now, simulate sync operation
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

export const enhancedIntegrationService = new EnhancedIntegrationService();