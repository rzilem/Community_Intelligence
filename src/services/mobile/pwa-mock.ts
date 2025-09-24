// Mock implementation for PWA service

export interface PWAConfig {
  id: string;
  app_name: string;
  app_description: string;
  theme_color: string;
  background_color: string;
  display: string;
  orientation: string;
  start_url: string;
  scope: string;
  icons: any[];
  manifest_url: string;
  service_worker_url: string;
  created_at: string;
}

export const pwaEngine = {
  generatePWAConfig: async (associationId: string): Promise<PWAConfig> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      id: 'pwa-' + Math.random().toString(36).substr(2, 9),
      app_name: 'HOA Manager',
      app_description: 'Mock PWA configuration',
      theme_color: '#007bff',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      icons: [],
      manifest_url: '/manifest.json',
      service_worker_url: '/sw.js',
      created_at: new Date().toISOString()
    };
  },

  updatePWAConfig: async (id: string, updates: Partial<PWAConfig>): Promise<PWAConfig> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      id,
      app_name: updates.app_name || 'HOA Manager',
      app_description: updates.app_description || 'Mock PWA configuration',
      theme_color: updates.theme_color || '#007bff',
      background_color: updates.background_color || '#ffffff',
      display: updates.display || 'standalone',
      orientation: updates.orientation || 'portrait',
      start_url: updates.start_url || '/',
      scope: updates.scope || '/',
      icons: updates.icons || [],
      manifest_url: updates.manifest_url || '/manifest.json',
      service_worker_url: updates.service_worker_url || '/sw.js',
      created_at: new Date().toISOString()
    };
  }
};