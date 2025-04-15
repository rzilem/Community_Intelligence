
export type ColorScheme = 'blue' | 'purple' | 'green' | 'orange' | 'default' | 'teal' | 'slate' | 'cyan';

export type ThemeOption = 'light' | 'dark' | 'system';

export type DensityOption = 'compact' | 'default' | 'comfortable';

export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

export interface AppearanceSettings {
  theme: ThemeOption;
  colorScheme: ColorScheme;
  density: DensityOption;
  fontScale: number;
  animationsEnabled: boolean;
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
  sessionTimeout: number;
  passwordResetInterval: number;
  ipWhitelist: string[];
}

export interface SystemPreferences {
  defaultAssociationId: string;
  defaultDateFormat: DateFormat;
  defaultTimeFormat: TimeFormat;
  defaultCurrency: string;
  defaultLanguage: string;
  autoSave: boolean;
  sessionTimeout: number;
}

export interface IntegrationSettings {
  integrationSettings: {
    [key: string]: {
      apiKey?: string;
      secret?: string;
      clientId?: string;
      webhookSecret?: string;
      model?: string;
      configDate?: string;
      [key: string]: string | undefined;
    };
  };
}

export interface SystemSettings {
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  preferences: SystemPreferences;
  integrations: IntegrationSettings;
}
