import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface PWAConfig {
  id: string;
  association_id: string;
  app_name: string;
  app_description: string;
  theme_color: string;
  background_color: string;
  start_url: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation: 'any' | 'natural' | 'landscape' | 'portrait';
  icons: PWAIcon[];
  features: PWAFeature[];
  offline_pages: string[];
  push_notifications: {
    enabled: boolean;
    vapid_key?: string;
    default_title: string;
    default_icon: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

export interface PWAFeature {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  association_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  device_info: {
    user_agent: string;
    platform: string;
    is_mobile: boolean;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfflineSyncItem {
  id: string;
  user_id: string;
  action_type: 'create' | 'update' | 'delete';
  table_name: string;
  data: Record<string, any>;
  timestamp: string;
  sync_status: 'pending' | 'synced' | 'failed';
  error_message?: string;
  retry_count: number;
}

export interface PWAAnalytics {
  installs: number;
  active_users: number;
  page_views: Record<string, number>;
  feature_usage: Record<string, number>;
  performance_metrics: {
    load_time: number;
    offline_usage: number;
    push_notification_engagement: number;
  };
  user_engagement: {
    session_duration: number;
    bounce_rate: number;
    return_visits: number;
  };
}

export class PWAEngine {
  async createPWAConfig(configData: Omit<PWAConfig, 'id' | 'created_at' | 'updated_at'>): Promise<PWAConfig> {
    try {
      const { data, error } = await supabase
        .from('pwa_configurations')
        .insert(configData)
        .select()
        .single();

      if (error) throw error;
      
      devLog.info('Created PWA configuration', data);
      return data as PWAConfig;
    } catch (error) {
      devLog.error('Failed to create PWA config', error);
      throw new Error(`Failed to create PWA config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPWAConfig(associationId: string): Promise<PWAConfig | null> {
    try {
      const { data, error } = await supabase
        .from('pwa_configurations')
        .select('*')
        .eq('association_id', associationId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      
      return data as PWAConfig || null;
    } catch (error) {
      devLog.error('Failed to fetch PWA config', error);
      throw new Error(`Failed to fetch PWA config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updatePWAConfig(configId: string, updates: Partial<PWAConfig>): Promise<PWAConfig> {
    try {
      const { data, error } = await supabase
        .from('pwa_configurations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', configId)
        .select()
        .single();

      if (error) throw error;
      
      devLog.info('Updated PWA configuration', data);
      return data as PWAConfig;
    } catch (error) {
      devLog.error('Failed to update PWA config', error);
      throw new Error(`Failed to update PWA config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateManifest(associationId: string): Promise<Record<string, any>> {
    try {
      const config = await this.getPWAConfig(associationId);
      if (!config) {
        throw new Error('PWA configuration not found');
      }

      const manifest = {
        name: config.app_name,
        short_name: config.app_name,
        description: config.app_description,
        start_url: config.start_url,
        display: config.display,
        orientation: config.orientation,
        theme_color: config.theme_color,
        background_color: config.background_color,
        icons: config.icons,
        categories: ['business', 'productivity', 'utilities'],
        lang: 'en',
        dir: 'ltr',
        scope: '/',
        prefer_related_applications: false
      };

      devLog.info('Generated PWA manifest', { associationId, manifest });
      return manifest;
    } catch (error) {
      devLog.error('Failed to generate PWA manifest', error);
      throw new Error(`Failed to generate manifest: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async registerPushSubscription(subscriptionData: Omit<PushSubscription, 'id' | 'created_at' | 'updated_at'>): Promise<PushSubscription> {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) throw error;
      
      devLog.info('Registered push subscription', data);
      return data as PushSubscription;
    } catch (error) {
      devLog.error('Failed to register push subscription', error);
      throw new Error(`Failed to register subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sendPushNotification(params: {
    association_id: string;
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: Record<string, any>;
    target_users?: string[];
  }): Promise<{ sent: number; failed: number }> {
    try {
      let query = supabase
        .from('push_subscriptions')
        .select('*')
        .eq('association_id', params.association_id)
        .eq('is_active', true);

      if (params.target_users && params.target_users.length > 0) {
        query = query.in('user_id', params.target_users);
      }

      const { data: subscriptions, error } = await query;

      if (error) throw error;

      let sent = 0;
      let failed = 0;

      // In a real implementation, you would use the Web Push Protocol
      // For now, we'll simulate the sending process
      for (const subscription of subscriptions || []) {
        try {
          // Simulate push notification sending
          await this.simulatePushSend(subscription, {
            title: params.title,
            body: params.body,
            icon: params.icon,
            badge: params.badge,
            data: params.data
          });
          sent++;
        } catch (error) {
          failed++;
          devLog.error('Failed to send push notification', { subscription: subscription.id, error });
        }
      }

      devLog.info('Push notification campaign completed', { sent, failed });
      return { sent, failed };
    } catch (error) {
      devLog.error('Failed to send push notifications', error);
      throw new Error(`Failed to send notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async syncOfflineData(userId: string): Promise<{ synced: number; failed: number }> {
    try {
      const { data: offlineItems, error } = await supabase
        .from('offline_sync_queue')
        .select('*')
        .eq('user_id', userId)
        .eq('sync_status', 'pending')
        .order('timestamp', { ascending: true });

      if (error) throw error;

      let synced = 0;
      let failed = 0;

      for (const item of offlineItems || []) {
        try {
          await this.processOfflineSync(item);
          await this.updateSyncStatus(item.id, 'synced');
          synced++;
        } catch (error) {
          await this.updateSyncStatus(item.id, 'failed', error instanceof Error ? error.message : 'Unknown error');
          failed++;
        }
      }

      devLog.info('Offline sync completed', { userId, synced, failed });
      return { synced, failed };
    } catch (error) {
      devLog.error('Failed to sync offline data', error);
      throw new Error(`Failed to sync data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPWAAnalytics(associationId: string, timeRange: '7d' | '30d' | '90d' = '30d'): Promise<PWAAnalytics> {
    try {
      // Mock analytics data - in a real implementation, you'd aggregate from various sources
      const analytics: PWAAnalytics = {
        installs: 145,
        active_users: 89,
        page_views: {
          '/dashboard': 1250,
          '/maintenance-requests': 890,
          '/amenities': 650,
          '/communications': 420,
          '/events': 380
        },
        feature_usage: {
          'push_notifications': 78,
          'offline_access': 45,
          'camera_integration': 62,
          'geolocation': 34,
          'file_upload': 91
        },
        performance_metrics: {
          load_time: 1.2,
          offline_usage: 0.15,
          push_notification_engagement: 0.68
        },
        user_engagement: {
          session_duration: 8.5,
          bounce_rate: 0.12,
          return_visits: 0.74
        }
      };

      return analytics;
    } catch (error) {
      devLog.error('Failed to get PWA analytics', error);
      throw new Error(`Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async installPWA(): Promise<boolean> {
    try {
      // Check if PWA installation is available
      if ('beforeinstallprompt' in window) {
        const event = (window as any).beforeinstallprompt;
        if (event) {
          event.prompt();
          const result = await event.userChoice;
          return result.outcome === 'accepted';
        }
      }
      return false;
    } catch (error) {
      devLog.error('Failed to install PWA', error);
      return false;
    }
  }

  async checkPWAInstalled(): Promise<boolean> {
    try {
      // Check if running in standalone mode (installed PWA)
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true ||
             document.referrer.includes('android-app://');
    } catch (error) {
      devLog.error('Failed to check PWA installation status', error);
      return false;
    }
  }

  private async simulatePushSend(subscription: PushSubscription, notification: any): Promise<void> {
    // In a real implementation, you would use the Web Push Protocol
    // This is a simulation for development purposes
    return new Promise((resolve) => {
      setTimeout(resolve, 100); // Simulate network delay
    });
  }

  private async processOfflineSync(item: OfflineSyncItem): Promise<void> {
    try {
      switch (item.action_type) {
        case 'create':
          await supabase.from(item.table_name).insert(item.data);
          break;
        case 'update':
          await supabase.from(item.table_name).update(item.data).eq('id', item.data.id);
          break;
        case 'delete':
          await supabase.from(item.table_name).delete().eq('id', item.data.id);
          break;
      }
    } catch (error) {
      throw new Error(`Failed to sync ${item.action_type} operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async updateSyncStatus(itemId: string, status: OfflineSyncItem['sync_status'], errorMessage?: string): Promise<void> {
    await supabase
      .from('offline_sync_queue')
      .update({
        sync_status: status,
        error_message: errorMessage,
        retry_count: status === 'failed' ? 1 : 0
      })
      .eq('id', itemId);
  }
}

export const pwaEngine = new PWAEngine();