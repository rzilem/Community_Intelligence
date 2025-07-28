import { supabase } from '@/integrations/supabase/client';

export interface PWAConfiguration {
  id: string;
  association_id: string;
  app_name: string;
  app_description?: string;
  theme_color: string;
  background_color: string;
  app_icon_url?: string;
  splash_screen_url?: string;
  features_enabled: Record<string, boolean>;
  notification_settings: Record<string, any>;
  offline_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  association_id: string;
  subscription_data: Record<string, any>;
  device_type?: string;
  user_agent?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppAnalyticsEvent {
  id: string;
  user_id?: string;
  association_id?: string;
  event_type: string;
  event_data: Record<string, any>;
  session_id?: string;
  device_info: Record<string, any>;
  timestamp: string;
}

class PWAService {
  // PWA Configuration
  async getPWAConfiguration(associationId: string): Promise<PWAConfiguration | null> {
    const { data, error } = await supabase
      .from('pwa_configurations')
      .select('*')
      .eq('association_id', associationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createPWAConfiguration(config: Omit<PWAConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<PWAConfiguration> {
    const { data, error } = await supabase
      .from('pwa_configurations')
      .insert(config)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePWAConfiguration(associationId: string, updates: Partial<PWAConfiguration>): Promise<PWAConfiguration> {
    const { data, error } = await supabase
      .from('pwa_configurations')
      .update(updates)
      .eq('association_id', associationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async generateManifest(associationId: string): Promise<any> {
    const config = await this.getPWAConfiguration(associationId);
    
    if (!config) {
      throw new Error('PWA configuration not found');
    }

    return {
      name: config.app_name,
      short_name: config.app_name,
      description: config.app_description || `${config.app_name} Community App`,
      start_url: '/',
      display: 'standalone',
      background_color: config.background_color,
      theme_color: config.theme_color,
      icons: [
        {
          src: config.app_icon_url || '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: config.app_icon_url || '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      shortcuts: [
        {
          name: 'Dashboard',
          short_name: 'Dashboard',
          description: 'View community dashboard',
          url: '/dashboard',
          icons: [{ src: '/icon-dashboard.png', sizes: '96x96' }]
        },
        {
          name: 'Maintenance',
          short_name: 'Maintenance',
          description: 'Submit maintenance request',
          url: '/maintenance/requests/new',
          icons: [{ src: '/icon-maintenance.png', sizes: '96x96' }]
        }
      ]
    };
  }

  // Push Notifications
  async subscribeToPushNotifications(
    userId: string,
    associationId: string,
    subscriptionData: any,
    deviceInfo?: Record<string, any>
  ): Promise<PushSubscription> {
    const { data, error } = await supabase
      .from('push_notification_subscriptions')
      .insert({
        user_id: userId,
        association_id: associationId,
        subscription_data: subscriptionData,
        device_type: deviceInfo?.platform || 'unknown',
        user_agent: deviceInfo?.userAgent || navigator?.userAgent,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async unsubscribeFromPushNotifications(subscriptionId: string): Promise<void> {
    const { error } = await supabase
      .from('push_notification_subscriptions')
      .update({ is_active: false })
      .eq('id', subscriptionId);

    if (error) throw error;
  }

  async getUserPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    const { data, error } = await supabase
      .from('push_notification_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async sendPushNotification(
    associationId: string,
    notification: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      data?: Record<string, any>;
      actions?: Array<{ action: string; title: string; icon?: string }>;
    },
    userIds?: string[]
  ): Promise<void> {
    let query = supabase
      .from('push_notification_subscriptions')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_active', true);

    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    const { data: subscriptions, error } = await query;

    if (error) throw error;

    // In a real implementation, this would send actual push notifications
    // For now, we'll simulate the process
    for (const subscription of subscriptions || []) {
      try {
        console.log('Sending push notification to:', subscription.user_id, notification);
        // Actual push notification sending would happen here
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }
  }

  // Offline Capabilities
  async syncOfflineData(userId: string, offlineData: any[]): Promise<{ synced: number; failed: number }> {
    let synced = 0;
    let failed = 0;

    for (const item of offlineData) {
      try {
        switch (item.type) {
          case 'maintenance_request':
            await supabase.from('maintenance_requests').insert(item.data);
            break;
          case 'communication':
            await supabase.from('communications').insert(item.data);
            break;
          // Add more offline data types as needed
        }
        synced++;
      } catch (error) {
        console.error('Failed to sync offline item:', error);
        failed++;
      }
    }

    return { synced, failed };
  }

  async cacheEssentialData(associationId: string): Promise<any> {
    // Cache essential data for offline use
    const cacheData = {
      association: await this.getAssociationData(associationId),
      announcements: await this.getAnnouncementsData(associationId),
      contacts: await this.getContactsData(associationId),
      cached_at: new Date().toISOString()
    };

    // Store in IndexedDB or local storage
    if ('caches' in window) {
      const cache = await caches.open('community-app-data');
      await cache.put('/cached-data', new Response(JSON.stringify(cacheData)));
    }

    return cacheData;
  }

  // Analytics
  async trackEvent(event: Omit<AppAnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const { error } = await supabase
      .from('mobile_app_analytics')
      .insert({
        ...event,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  async getAnalytics(
    associationId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    user_engagement: any;
    feature_usage: any;
    performance_metrics: any;
  }> {
    const { data, error } = await supabase
      .from('mobile_app_analytics')
      .select('*')
      .eq('association_id', associationId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    if (error) throw error;

    const events = data || [];
    
    return {
      user_engagement: this.analyzeUserEngagement(events),
      feature_usage: this.analyzeFeatureUsage(events),
      performance_metrics: this.analyzePerformanceMetrics(events)
    };
  }

  // Background Sync
  async registerBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
    }
  }

  // Installation
  async checkInstallability(): Promise<boolean> {
    if ('getInstalledRelatedApps' in navigator) {
      const relatedApps = await (navigator as any).getInstalledRelatedApps();
      return relatedApps.length === 0;
    }
    return true;
  }

  async promptInstallation(): Promise<boolean> {
    // This would be implemented with the beforeinstallprompt event
    // The actual prompt is handled by the browser
    return false;
  }

  // Helper methods
  private async getAssociationData(associationId: string): Promise<any> {
    const { data, error } = await supabase
      .from('associations')
      .select('*')
      .eq('id', associationId)
      .single();

    if (error) throw error;
    return data;
  }

  private async getAnnouncementsData(associationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('association_id', associationId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  private async getContactsData(associationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('association_users')
      .select('*, profiles(*)')
      .eq('association_id', associationId)
      .in('role', ['admin', 'manager']);

    if (error) throw error;
    return data || [];
  }

  private analyzeUserEngagement(events: AppAnalyticsEvent[]): any {
    const dailyActiveUsers = new Set(events.map(e => e.user_id)).size;
    const sessionDurations = events
      .filter(e => e.event_type === 'session_end')
      .map(e => e.event_data.duration || 0);
    
    const avgSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
      : 0;

    return {
      daily_active_users: dailyActiveUsers,
      average_session_duration: avgSessionDuration,
      total_sessions: sessionDurations.length
    };
  }

  private analyzeFeatureUsage(events: AppAnalyticsEvent[]): any {
    const featureUsage: Record<string, number> = {};
    
    events.forEach(event => {
      const feature = event.event_data.feature || event.event_type;
      featureUsage[feature] = (featureUsage[feature] || 0) + 1;
    });

    return featureUsage;
  }

  private analyzePerformanceMetrics(events: AppAnalyticsEvent[]): any {
    const performanceEvents = events.filter(e => e.event_type === 'performance');
    
    if (performanceEvents.length === 0) {
      return { page_load_times: [], api_response_times: [] };
    }

    return {
      page_load_times: performanceEvents
        .filter(e => e.event_data.metric === 'page_load')
        .map(e => e.event_data.value),
      api_response_times: performanceEvents
        .filter(e => e.event_data.metric === 'api_response')
        .map(e => e.event_data.value)
    };
  }
}

export const pwaService = new PWAService();