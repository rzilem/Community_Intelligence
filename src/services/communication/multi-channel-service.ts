// Multi-Channel Communication Service for Phase 3

import { supabase } from '@/integrations/supabase/client';
import { 
  MultiChannelMessage, 
  CommunicationChannel, 
  SmartRoutingRule,
  CommunicationAnalytics 
} from '@/types/realtime-types';
import { enhancedIntegrationService } from '../integration/enhanced-integration-service';

export class MultiChannelCommunicationService {
  private channelHandlers = new Map<string, (message: any, config: any) => Promise<boolean>>();

  constructor() {
    this.initializeChannelHandlers();
  }

  // Channel Management
  async getChannels(associationId: string): Promise<CommunicationChannel[]> {
    const { data, error } = await supabase
      .from('communication_channels')
      .select('*')
      .eq('association_id', associationId)
      .order('priority', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createChannel(channel: Omit<CommunicationChannel, 'id' | 'created_at'>): Promise<CommunicationChannel> {
    const { data, error } = await supabase
      .from('communication_channels')
      .insert(channel)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateChannel(id: string, updates: Partial<CommunicationChannel>): Promise<void> {
    const { error } = await supabase
      .from('communication_channels')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  // Message Orchestration
  async sendMultiChannelMessage(message: Omit<MultiChannelMessage, 'id' | 'created_at' | 'updated_at' | 'delivery_stats'>): Promise<string> {
    // Create message record
    const { data: messageRecord, error } = await supabase
      .from('multi_channel_messages')
      .insert({
        ...message,
        status: 'queued',
        delivery_stats: {
          total_recipients: message.recipients.length,
          sent_count: 0,
          delivered_count: 0,
          opened_count: 0,
          failed_count: 0
        }
      })
      .select()
      .single();

    if (error) throw error;

    // Process message asynchronously
    this.processMessageAsync(messageRecord.id);

    return messageRecord.id;
  }

  private async processMessageAsync(messageId: string): Promise<void> {
    try {
      // Update status to sending
      await this.updateMessageStatus(messageId, 'sending');

      const { data: message } = await supabase
        .from('multi_channel_messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (!message) return;

      // Get active channels
      const channels = await this.getChannels(message.association_id);
      const activeChannels = channels.filter(c => 
        c.is_active && message.channels.includes(c.id)
      );

      let totalSent = 0;
      let totalFailed = 0;

      // Send to each recipient
      for (const recipient of message.recipients) {
        const preferredChannel = recipient.preferred_channel 
          ? activeChannels.find(c => c.id === recipient.preferred_channel)
          : activeChannels[0]; // Use highest priority channel

        if (preferredChannel) {
          const success = await this.sendToChannel(
            preferredChannel, 
            message, 
            recipient.user_id
          );
          
          if (success) {
            totalSent++;
          } else {
            totalFailed++;
          }
        } else {
          totalFailed++;
        }
      }

      // Update final status
      await supabase
        .from('multi_channel_messages')
        .update({
          status: totalFailed === 0 ? 'sent' : (totalSent > 0 ? 'sent' : 'failed'),
          sent_at: new Date().toISOString(),
          delivery_stats: {
            total_recipients: message.recipients.length,
            sent_count: totalSent,
            delivered_count: 0, // Will be updated by delivery confirmations
            opened_count: 0,
            failed_count: totalFailed
          }
        })
        .eq('id', messageId);

    } catch (error) {
      console.error('Failed to process multi-channel message:', error);
      await this.updateMessageStatus(messageId, 'failed');
    }
  }

  private async sendToChannel(
    channel: CommunicationChannel, 
    message: MultiChannelMessage, 
    userId: string
  ): Promise<boolean> {
    const handler = this.channelHandlers.get(channel.type);
    if (!handler) {
      console.error(`No handler for channel type: ${channel.type}`);
      return false;
    }

    try {
      // Check rate limits
      if (channel.rate_limit) {
        const canSend = await this.checkChannelRateLimit(channel.id, channel.rate_limit);
        if (!canSend) {
          console.warn(`Rate limit exceeded for channel ${channel.id}`);
          return false;
        }
      }

      // Send message
      const success = await handler(
        {
          subject: message.subject,
          content: message.content,
          recipient_id: userId
        },
        channel.configuration
      );

      // Track analytics
      await this.trackChannelUsage(channel.id, success);

      return success;
    } catch (error) {
      console.error(`Failed to send via ${channel.type}:`, error);
      await this.trackChannelUsage(channel.id, false);
      return false;
    }
  }

  private initializeChannelHandlers(): void {
    // Email handler
    this.channelHandlers.set('email', async (message, config) => {
      // Integration with email service (SendGrid, etc.)
      console.log('Sending email:', message);
      return true; // Mock success
    });

    // SMS handler
    this.channelHandlers.set('sms', async (message, config) => {
      // Integration with Twilio
      console.log('Sending SMS:', message);
      return true; // Mock success
    });

    // Push notification handler
    this.channelHandlers.set('push', async (message, config) => {
      // Send push notification
      console.log('Sending push notification:', message);
      return true; // Mock success
    });

    // In-app message handler
    this.channelHandlers.set('in_app', async (message, config) => {
      // Store in-app message
      const { error } = await supabase
        .from('in_app_messages')
        .insert({
          user_id: message.recipient_id,
          subject: message.subject,
          content: message.content,
          is_read: false
        });
      return !error;
    });

    // Microsoft Teams handler
    this.channelHandlers.set('teams', async (message, config) => {
      // Integration with Microsoft Teams API
      console.log('Sending Teams message:', message);
      return true; // Mock success
    });

    // Slack handler
    this.channelHandlers.set('slack', async (message, config) => {
      // Integration with Slack API
      console.log('Sending Slack message:', message);
      return true; // Mock success
    });
  }

  // Smart Routing
  async createRoutingRule(rule: Omit<SmartRoutingRule, 'id' | 'created_at'>): Promise<SmartRoutingRule> {
    const { data, error } = await supabase
      .from('smart_routing_rules')
      .insert(rule)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async processIncomingMessage(
    associationId: string, 
    messageData: any
  ): Promise<void> {
    // Get applicable routing rules
    const { data: rules } = await supabase
      .from('smart_routing_rules')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (!rules) return;

    // Apply routing rules
    for (const rule of rules) {
      if (this.matchesConditions(messageData, rule.trigger_conditions)) {
        await this.executeRoutingActions(rule.routing_actions, messageData);
        break; // Stop at first matching rule
      }
    }
  }

  private matchesConditions(data: any, conditions: any[]): boolean {
    return conditions.every(condition => {
      const value = this.getNestedValue(data, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'contains':
          return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
        case 'greater_than':
          return Number(value) > Number(condition.value);
        case 'less_than':
          return Number(value) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async executeRoutingActions(actions: any[], messageData: any): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'assign_to_user':
          await this.assignToUser(action.config.user_id, messageData);
          break;
        case 'assign_to_role':
          await this.assignToRole(action.config.role, messageData);
          break;
        case 'escalate':
          await this.escalateMessage(action.config, messageData);
          break;
        case 'auto_respond':
          await this.sendAutoResponse(action.config, messageData);
          break;
        case 'create_task':
          await this.createTask(action.config, messageData);
          break;
      }
    }
  }

  // Routing Actions
  private async assignToUser(userId: string, messageData: any): Promise<void> {
    // Implementation for user assignment
    console.log(`Assigning message to user ${userId}:`, messageData);
  }

  private async assignToRole(role: string, messageData: any): Promise<void> {
    // Implementation for role assignment
    console.log(`Assigning message to role ${role}:`, messageData);
  }

  private async escalateMessage(config: any, messageData: any): Promise<void> {
    // Implementation for message escalation
    console.log('Escalating message:', messageData);
  }

  private async sendAutoResponse(config: any, messageData: any): Promise<void> {
    // Implementation for auto-response
    console.log('Sending auto-response:', config);
  }

  private async createTask(config: any, messageData: any): Promise<void> {
    // Implementation for task creation
    console.log('Creating task:', config);
  }

  // Analytics & Monitoring
  async getChannelAnalytics(
    channelId: string, 
    period: 'day' | 'week' | 'month'
  ): Promise<CommunicationAnalytics | null> {
    const { data, error } = await supabase
      .from('communication_analytics')
      .select('*')
      .eq('channel_id', channelId)
      .eq('period', period)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  }

  private async trackChannelUsage(channelId: string, success: boolean): Promise<void> {
    // Update channel usage metrics
    const { error } = await supabase.rpc('update_channel_metrics', {
      channel_id: channelId,
      was_successful: success
    });

    if (error) console.error('Failed to track channel usage:', error);
  }

  private async checkChannelRateLimit(
    channelId: string, 
    rateLimit: { max_per_hour: number; max_per_day: number }
  ): Promise<boolean> {
    // Check hourly limit
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: hourlyCount } = await supabase
      .from('channel_usage_log')
      .select('*', { count: 'exact' })
      .eq('channel_id', channelId)
      .gte('created_at', hourAgo);

    if (hourlyCount && hourlyCount >= rateLimit.max_per_hour) {
      return false;
    }

    // Check daily limit
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: dailyCount } = await supabase
      .from('channel_usage_log')
      .select('*', { count: 'exact' })
      .eq('channel_id', channelId)
      .gte('created_at', dayAgo);

    if (dailyCount && dailyCount >= rateLimit.max_per_day) {
      return false;
    }

    return true;
  }

  private async updateMessageStatus(messageId: string, status: MultiChannelMessage['status']): Promise<void> {
    const { error } = await supabase
      .from('multi_channel_messages')
      .update({ status })
      .eq('id', messageId);

    if (error) console.error('Failed to update message status:', error);
  }
}

export const multiChannelCommunicationService = new MultiChannelCommunicationService();