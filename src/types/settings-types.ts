
export type ThemeOption = 'light' | 'dark' | 'system';
export type ColorScheme = 'blue' | 'purple' | 'green' | 'orange' | 'default';
export type DensityOption = 'compact' | 'default' | 'comfortable';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

export interface SystemPreferences {
  defaultAssociationId?: string;
  defaultDateFormat: DateFormat;
  defaultTimeFormat: TimeFormat;
  defaultCurrency: string;
  defaultLanguage: string;
  autoSave: boolean;
  sessionTimeout: number; // minutes
}

export interface AppearanceSettings {
  theme: ThemeOption;
  colorScheme: ColorScheme;
  density: DensityOption;
  animationsEnabled: boolean;
  fontScale: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  maintenanceAlerts: boolean;
  securityAlerts: boolean;
  newsAndUpdates: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number; // minutes
  passwordResetInterval: number; // days
  ipWhitelist: string[];
}

export interface IntegrationConfig {
  [key: string]: string;
  configDate?: string;
}

export interface IntegrationSettings {
  integrationSettings: Record<string, IntegrationConfig>;
}

export interface SystemSettings {
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  preferences: SystemPreferences;
  integrations: IntegrationSettings;
}
