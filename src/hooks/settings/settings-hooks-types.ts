
import { 
  AppearanceSettings, 
  NotificationSettings, 
  SecuritySettings, 
  SystemPreferences,
  SystemSettings
} from '@/types/settings-types';
import { UseQueryResult } from '@tanstack/react-query';

export type SettingKey = 'appearance' | 'notifications' | 'security' | 'preferences' | 'integrations';

// Default settings to use if we can't fetch from the database
export const defaultSettings: SystemSettings = {
  appearance: {
    theme: 'system',
    colorScheme: 'default',
    density: 'default',
    animationsEnabled: true,
    fontScale: 1
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    maintenanceAlerts: true,
    securityAlerts: true,
    newsAndUpdates: false
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordResetInterval: 90,
    ipWhitelist: ['192.168.1.1', '10.0.0.1']
  },
  preferences: {
    defaultAssociationId: 'assoc-1',
    defaultDateFormat: 'MM/DD/YYYY',
    defaultTimeFormat: '12h',
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
    autoSave: true,
    sessionTimeout: 30
  },
  integrations: {
    integrationSettings: {}
  }
};

// Use composition to ensure it has all properties from UseQueryResult
export interface SystemSettingResult<T> extends UseQueryResult<T> {
  // Override the data property to ensure it's always defined
  data: T;
}
