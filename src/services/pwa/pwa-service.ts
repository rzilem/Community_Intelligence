// Simplified PWA service with mock data to avoid database schema issues
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
  // Mock data for development
  private mockConfigs: PWAConfiguration[] = [];
  private mockSubscriptions: PushSubscription[] = [];
  private mockAnalytics: AppAnalyticsEvent[] = [];

  // PWA Configuration
  async getPWAConfiguration(associationId: string): Promise<PWAConfiguration | null> {
    const config = this.mockConfigs.find(c => c.association_id === associationId);
    return config || null;
  }

  async createPWAConfiguration(config: Omit<PWAConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<PWAConfiguration> {
    const newConfig: PWAConfiguration = {
      ...config,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.mockConfigs.push(newConfig);
    return newConfig;
  }

  async updatePWAConfiguration(associationId: string, updates: Partial<PWAConfiguration>): Promise<PWAConfiguration> {
    const index = this.mockConfigs.findIndex(c => c.association_id === associationId);
    
    if (index === -1) {
      // Create new config if none exists
      return this.createPWAConfiguration({
        association_id: associationId,
        app_name: 'Community App',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        features_enabled: {},
        notification_settings: {},
        offline_settings: {},
        ...updates
      });
    }
    
    this.mockConfigs[index] = {
      ...this.mockConfigs[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return this.mockConfigs[index];
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
    const newSubscription: PushSubscription = {
      id: Date.now().toString(),
      user_id: userId,
      association_id: associationId,
      subscription_data: subscriptionData,
      device_type: deviceInfo?.platform || 'unknown',
      user_agent: deviceInfo?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.mockSubscriptions.push(newSubscription);
    return newSubscription;
  }

  async unsubscribeFromPushNotifications(subscriptionId: string): Promise<void> {
    const index = this.mockSubscriptions.findIndex(s => s.id === subscriptionId);
    if (index !== -1) {
      this.mockSubscriptions[index].is_active = false;
      this.mockSubscriptions[index].updated_at = new Date().toISOString();
    }
  }

  async getUserPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    return this.mockSubscriptions.filter(s => s.user_id === userId && s.is_active);
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
    let subscriptions = this.mockSubscriptions.filter(
      s => s.association_id === associationId && s.is_active
    );

    if (userIds && userIds.length > 0) {
      subscriptions = subscriptions.filter(s => userIds.includes(s.user_id));
    }

    // In a real implementation, this would send actual push notifications
    for (const subscription of subscriptions) {
      console.log('Sending push notification to:', subscription.user_id, notification);
    }
  }

  // Offline Capabilities
  async syncOfflineData(userId: string, offlineData: any[]): Promise<{ synced: number; failed: number }> {
    let synced = 0;
    let failed = 0;

    for (const item of offlineData) {
      try {
        // In a real implementation, this would sync to the actual database
        console.log('Syncing offline data:', item);
        synced++;
      } catch (error) {
        console.error('Failed to sync offline item:', error);
        failed++;
      }
    }

    return { synced, failed };
  }

  async cacheEssentialData(associationId: string): Promise<any> {
    // Mock essential data for caching
    const cacheData = {
      association: { id: associationId, name: 'Mock Association' },
      announcements: [],
      contacts: [],
      cached_at: new Date().toISOString()
    };

    // Store in IndexedDB or local storage (simulated)
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open('community-app-data');
        await cache.put('/cached-data', new Response(JSON.stringify(cacheData)));
      } catch (error) {
        console.error('Failed to cache data:', error);
      }
    }

    return cacheData;
  }

  // Analytics
  async trackEvent(event: Omit<AppAnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const newEvent: AppAnalyticsEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    this.mockAnalytics.push(newEvent);
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
    const events = this.mockAnalytics.filter(
      e => e.association_id === associationId &&
           e.timestamp >= startDate &&
           e.timestamp <= endDate
    );
    
    return {
      user_engagement: this.analyzeUserEngagement(events),
      feature_usage: this.analyzeFeatureUsage(events),
      performance_metrics: this.analyzePerformanceMetrics(events)
    };
  }

  // Background Sync
  async registerBackgroundSync(tag: string): Promise<void> {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register(tag);
      } catch (error) {
        console.error('Failed to register background sync:', error);
      }
    }
  }

  // Installation
  async checkInstallability(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'getInstalledRelatedApps' in navigator) {
      try {
        const relatedApps = await (navigator as any).getInstalledRelatedApps();
        return relatedApps.length === 0;
      } catch (error) {
        console.error('Failed to check installability:', error);
      }
    }
    return true;
  }

  async promptInstallation(): Promise<boolean> {
    // This would be implemented with the beforeinstallprompt event
    console.log('Install prompt would be shown here');
    return false;
  }

  // Helper methods
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