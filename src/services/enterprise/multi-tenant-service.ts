import { supabase } from '@/integrations/supabase/client';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  customDomain?: string;
  branding: TenantBranding;
  settings: TenantSettings;
  subscription: TenantSubscription;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  companyName: string;
  supportEmail: string;
  supportPhone?: string;
  customCss?: string;
  emailTemplates?: Record<string, string>;
}

export interface TenantSettings {
  maxAssociations: number;
  maxUsers: number;
  maxStorageGB: number;
  enabledFeatures: string[];
  apiRateLimit: number;
  timeZone: string;
  locale: string;
  currency: string;
  dateFormat: string;
  customFields?: Record<string, any>;
}

export interface TenantSubscription {
  plan: 'starter' | 'professional' | 'enterprise' | 'custom';
  billingCycle: 'monthly' | 'annual';
  pricePerMonth: number;
  trialEndsAt?: Date;
  nextBillingDate: Date;
  isActive: boolean;
  features: string[];
  limits: Record<string, number>;
}

export interface TenantUsage {
  tenantId: string;
  associations: number;
  users: number;
  storageUsedGB: number;
  apiCallsThisMonth: number;
  lastUpdated: Date;
}

export class MultiTenantService {
  static async getTenant(tenantId: string): Promise<Tenant | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        domain: data.domain,
        customDomain: data.custom_domain,
        branding: data.branding || {},
        settings: data.settings || {},
        subscription: data.subscription || {},
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error getting tenant:', error);
      return null;
    }
  }

  static async getTenantByDomain(domain: string): Promise<Tenant | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .or(`domain.eq.${domain},custom_domain.eq.${domain}`)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        domain: data.domain,
        customDomain: data.custom_domain,
        branding: data.branding || {},
        settings: data.settings || {},
        subscription: data.subscription || {},
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error getting tenant by domain:', error);
      return null;
    }
  }

  static async createTenant(tenantData: Partial<Tenant>): Promise<Tenant | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert({
          name: tenantData.name,
          domain: tenantData.domain,
          custom_domain: tenantData.customDomain,
          branding: tenantData.branding || {},
          settings: tenantData.settings || this.getDefaultSettings(),
          subscription: tenantData.subscription || this.getTrialSubscription(),
          status: tenantData.status || 'trial'
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Error creating tenant:', error);
        return null;
      }

      // Initialize tenant schema and default data
      await this.initializeTenantData(data.id);

      return {
        id: data.id,
        name: data.name,
        domain: data.domain,
        customDomain: data.custom_domain,
        branding: data.branding || {},
        settings: data.settings || {},
        subscription: data.subscription || {},
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error creating tenant:', error);
      return null;
    }
  }

  static async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: updates.name,
          custom_domain: updates.customDomain,
          branding: updates.branding,
          settings: updates.settings,
          subscription: updates.subscription,
          status: updates.status
        })
        .eq('id', tenantId);

      return !error;
    } catch (error) {
      console.error('Error updating tenant:', error);
      return false;
    }
  }

  static async getTenantUsage(tenantId: string): Promise<TenantUsage | null> {
    try {
      // Get associations count
      const { count: associationsCount } = await supabase
        .from('associations')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      // Get users count
      const { count: usersCount } = await supabase
        .from('tenant_users')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      // Get storage usage (mock calculation)
      const storageUsage = await this.calculateStorageUsage(tenantId);

      // Get API calls this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: apiCallsCount } = await supabase
        .from('api_usage_logs')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', startOfMonth.toISOString());

      return {
        tenantId,
        associations: associationsCount || 0,
        users: usersCount || 0,
        storageUsedGB: storageUsage,
        apiCallsThisMonth: apiCallsCount || 0,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting tenant usage:', error);
      return null;
    }
  }

  static async checkTenantLimits(tenantId: string): Promise<{
    withinLimits: boolean;
    violations: string[];
    usage: TenantUsage;
  }> {
    try {
      const tenant = await this.getTenant(tenantId);
      const usage = await this.getTenantUsage(tenantId);

      if (!tenant || !usage) {
        return {
          withinLimits: false,
          violations: ['Unable to check tenant limits'],
          usage: usage || {} as TenantUsage
        };
      }

      const violations: string[] = [];

      if (usage.associations > tenant.settings.maxAssociations) {
        violations.push(`Associations limit exceeded: ${usage.associations}/${tenant.settings.maxAssociations}`);
      }

      if (usage.users > tenant.settings.maxUsers) {
        violations.push(`Users limit exceeded: ${usage.users}/${tenant.settings.maxUsers}`);
      }

      if (usage.storageUsedGB > tenant.settings.maxStorageGB) {
        violations.push(`Storage limit exceeded: ${usage.storageUsedGB}GB/${tenant.settings.maxStorageGB}GB`);
      }

      if (usage.apiCallsThisMonth > tenant.settings.apiRateLimit) {
        violations.push(`API rate limit exceeded: ${usage.apiCallsThisMonth}/${tenant.settings.apiRateLimit} calls this month`);
      }

      return {
        withinLimits: violations.length === 0,
        violations,
        usage
      };
    } catch (error) {
      console.error('Error checking tenant limits:', error);
      return {
        withinLimits: false,
        violations: ['Error checking limits'],
        usage: {} as TenantUsage
      };
    }
  }

  private static async initializeTenantData(tenantId: string): Promise<void> {
    try {
      // Create default roles for the tenant
      const defaultRoles = [
        { name: 'admin', permissions: ['*'], tenant_id: tenantId },
        { name: 'manager', permissions: ['associations:read', 'associations:write', 'properties:read', 'properties:write'], tenant_id: tenantId },
        { name: 'user', permissions: ['associations:read', 'properties:read'], tenant_id: tenantId }
      ];

      await supabase
        .from('tenant_roles')
        .insert(defaultRoles);

      // Create default settings
      await supabase
        .from('tenant_settings')
        .insert({
          tenant_id: tenantId,
          settings: this.getDefaultSettings()
        });
    } catch (error) {
      console.error('Error initializing tenant data:', error);
    }
  }

  private static getDefaultSettings(): TenantSettings {
    return {
      maxAssociations: 10,
      maxUsers: 50,
      maxStorageGB: 10,
      enabledFeatures: ['associations', 'properties', 'residents', 'communications'],
      apiRateLimit: 10000,
      timeZone: 'UTC',
      locale: 'en-US',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY'
    };
  }

  private static getTrialSubscription(): TenantSubscription {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 30);

    return {
      plan: 'starter',
      billingCycle: 'monthly',
      pricePerMonth: 0,
      trialEndsAt: trialEnd,
      nextBillingDate: trialEnd,
      isActive: true,
      features: ['basic_features'],
      limits: {
        associations: 5,
        users: 25,
        storage: 5
      }
    };
  }

  private static async calculateStorageUsage(tenantId: string): Promise<number> {
    try {
      // This would calculate actual storage usage from various buckets
      // For now, return a mock calculation
      const { data: documents } = await supabase
        .from('documents')
        .select('file_size')
        .eq('tenant_id', tenantId);

      if (!documents) return 0;

      const totalBytes = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
      return Math.round(totalBytes / (1024 * 1024 * 1024)); // Convert to GB
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return 0;
    }
  }
}