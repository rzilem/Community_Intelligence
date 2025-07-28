// Real-time Service - WebSocket & Event Management for Phase 3

import { supabase } from '@/integrations/supabase/client';
import { 
  RealtimeEvent, 
  RealtimeChannel, 
  RealtimeSubscription,
  PushNotificationConfig,
  RealtimeEventType 
} from '@/types/realtime-types';

export class RealtimeService {
  private channels = new Map<string, any>();
  private eventListeners = new Map<string, Set<(event: RealtimeEvent) => void>>();

  // Channel Management
  async createChannel(
    name: string, 
    associationId: string, 
    type: RealtimeChannel['type'] = 'association'
  ): Promise<RealtimeChannel> {
    const { data, error } = await supabase
      .from('realtime_channels')
      .insert({
        name,
        association_id: associationId,
        type,
        participants: [],
        permissions: {},
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async subscribeToChannel(
    channelId: string, 
    userId: string, 
    eventTypes: RealtimeEventType[] = []
  ): Promise<void> {
    // Create subscription record
    const { error } = await supabase
      .from('realtime_subscriptions')
      .upsert({
        user_id: userId,
        channel_id: channelId,
        event_types: eventTypes,
        is_active: true
      });

    if (error) throw error;

    // Set up Supabase realtime subscription
    const channel = supabase
      .channel(`channel_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_events',
          filter: `channels=cs.{${channelId}}`
        },
        (payload) => this.handleRealtimeEvent(payload.new as RealtimeEvent)
      )
      .subscribe();

    this.channels.set(channelId, channel);
  }

  async unsubscribeFromChannel(channelId: string, userId: string): Promise<void> {
    // Remove subscription
    const { error } = await supabase
      .from('realtime_subscriptions')
      .update({ is_active: false })
      .eq('channel_id', channelId)
      .eq('user_id', userId);

    if (error) throw error;

    // Remove Supabase channel
    const channel = this.channels.get(channelId);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelId);
    }
  }

  // Event Management
  async emitEvent(event: Omit<RealtimeEvent, 'id' | 'timestamp'>): Promise<void> {
    const { error } = await supabase
      .from('realtime_events')
      .insert({
        ...event,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;
  }

  private handleRealtimeEvent(event: RealtimeEvent): void {
    // Notify local listeners
    event.channels.forEach(channelId => {
      const listeners = this.eventListeners.get(channelId);
      if (listeners) {
        listeners.forEach(listener => listener(event));
      }
    });

    // Handle specific event types
    this.processEventType(event);
  }

  private async processEventType(event: RealtimeEvent): Promise<void> {
    switch (event.type) {
      case 'emergency_alert':
        await this.handleEmergencyAlert(event);
        break;
      case 'maintenance_request_created':
        await this.handleMaintenanceRequest(event);
        break;
      case 'payment_received':
        await this.handlePaymentReceived(event);
        break;
      default:
        // Standard processing
        break;
    }
  }

  // Event Listeners
  addEventListener(channelId: string, listener: (event: RealtimeEvent) => void): void {
    if (!this.eventListeners.has(channelId)) {
      this.eventListeners.set(channelId, new Set());
    }
    this.eventListeners.get(channelId)!.add(listener);
  }

  removeEventListener(channelId: string, listener: (event: RealtimeEvent) => void): void {
    const listeners = this.eventListeners.get(channelId);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  // Push Notifications
  async registerPushNotifications(config: Omit<PushNotificationConfig, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { error } = await supabase
      .from('push_notification_configs')
      .upsert(config);

    if (error) throw error;
  }

  async sendPushNotification(
    userId: string, 
    title: string, 
    message: string, 
    data?: Record<string, any>
  ): Promise<void> {
    // Get user's push config
    const { data: configs } = await supabase
      .from('push_notification_configs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (!configs || configs.length === 0) return;

    // Send push notifications through configured channels
    for (const config of configs) {
      await this.sendPushToDevice(config, title, message, data);
    }
  }

  private async sendPushToDevice(
    config: PushNotificationConfig, 
    title: string, 
    message: string, 
    data?: Record<string, any>
  ): Promise<void> {
    // Check quiet hours
    if (this.isQuietHours(config)) return;

    // Platform-specific push notification logic would go here
    console.log(`Sending push to ${config.platform}:`, { title, message, data });
  }

  private isQuietHours(config: PushNotificationConfig): boolean {
    if (!config.preferences.quiet_hours_start || !config.preferences.quiet_hours_end) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = config.preferences.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = config.preferences.quiet_hours_end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Crosses midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Specialized Event Handlers
  private async handleEmergencyAlert(event: RealtimeEvent): Promise<void> {
    // Send immediate push notifications to all residents
    const { data: residents } = await supabase
      .from('association_members')
      .select('user_id')
      .eq('association_id', event.association_id);

    if (residents) {
      const promises = residents.map(resident => 
        this.sendPushNotification(
          resident.user_id,
          'Emergency Alert',
          event.data.message || 'Emergency alert issued for your community',
          { type: 'emergency', urgency: 'high' }
        )
      );
      await Promise.all(promises);
    }
  }

  private async handleMaintenanceRequest(event: RealtimeEvent): Promise<void> {
    // Notify maintenance team and property managers
    await this.emitEvent({
      type: 'maintenance_request_created',
      association_id: event.association_id,
      data: event.data,
      channels: [`maintenance_${event.association_id}`],
      priority: event.priority || 'normal'
    });
  }

  private async handlePaymentReceived(event: RealtimeEvent): Promise<void> {
    // Update payment status and notify accounting
    await this.emitEvent({
      type: 'payment_received',
      association_id: event.association_id,
      data: event.data,
      channels: [`accounting_${event.association_id}`],
      priority: 'normal'
    });
  }

  // Presence Management
  async updateUserPresence(userId: string, channelId: string, isOnline: boolean): Promise<void> {
    const presenceChannel = supabase.channel(`presence_${channelId}`);
    
    if (isOnline) {
      await presenceChannel.track({
        user_id: userId,
        online_at: new Date().toISOString()
      });
    } else {
      await presenceChannel.untrack();
    }
  }

  async getOnlineUsers(channelId: string): Promise<string[]> {
    const presenceChannel = supabase.channel(`presence_${channelId}`);
    const presenceState = presenceChannel.presenceState();
    
    return Object.keys(presenceState).map(key => 
      presenceState[key][0]?.user_id
    ).filter(Boolean);
  }

  // Cleanup
  async cleanup(): Promise<void> {
    // Remove all active subscriptions
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    
    this.channels.clear();
    this.eventListeners.clear();
  }
}

export const realtimeService = new RealtimeService();