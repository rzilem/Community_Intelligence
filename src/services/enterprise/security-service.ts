import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface SecurityPolicy {
  id: string;
  name: string;
  type: 'password' | 'session' | 'access' | 'audit';
  rules: SecurityRule[];
  isActive: boolean;
  appliesTo: string[]; // roles or user groups
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityRule {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  message?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  timestamp: Date;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'policy_violation' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  resolved: boolean;
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface IPWhitelistEntry {
  id: string;
  ip_address: string;
  description: string;
  is_active: boolean;
  created_by: string;
  created_at: Date;
}

export interface SessionInfo {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  created_at: Date;
  last_activity: Date;
  is_active: boolean;
  location?: string;
  device_type?: string;
}

export class SecurityService {
  // Password Policy Management
  static async getPasswordPolicies(): Promise<SecurityPolicy[]> {
    try {
      const { data } = await supabase
        .from('security_policies')
        .select('*')
        .eq('type', 'password')
        .eq('is_active', true);

      return data ? data.map(policy => this.mapSecurityPolicyFromDb(policy)) : [];
    } catch (error) {
      console.error('Error getting password policies:', error);
      return [];
    }
  }

  static validatePassword(password: string, policies: SecurityPolicy[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const policy of policies) {
      for (const rule of policy.rules) {
        switch (rule.field) {
          case 'min_length':
            if (password.length < rule.value) {
              errors.push(rule.message || `Password must be at least ${rule.value} characters long`);
            }
            break;
          case 'require_uppercase':
            if (rule.value && !/[A-Z]/.test(password)) {
              errors.push(rule.message || 'Password must contain at least one uppercase letter');
            }
            break;
          case 'require_lowercase':
            if (rule.value && !/[a-z]/.test(password)) {
              errors.push(rule.message || 'Password must contain at least one lowercase letter');
            }
            break;
          case 'require_numbers':
            if (rule.value && !/\d/.test(password)) {
              errors.push(rule.message || 'Password must contain at least one number');
            }
            break;
          case 'require_special':
            if (rule.value && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
              errors.push(rule.message || 'Password must contain at least one special character');
            }
            break;
          case 'disallow_common':
            const commonPasswords = ['password', '123456', 'admin', 'letmein'];
            if (rule.value && commonPasswords.includes(password.toLowerCase())) {
              errors.push(rule.message || 'Password is too common');
            }
            break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Audit Logging
  static async logAuditEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: event.user_id,
          action: event.action,
          resource_type: event.resource_type,
          resource_id: event.resource_id,
          details: event.details as Json,
          ip_address: event.ip_address,
          user_agent: event.user_agent,
          session_id: event.session_id,
          risk_level: event.risk_level,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  static async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    resourceType?: string;
    riskLevel?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }
      if (filters.riskLevel) {
        query = query.eq('risk_level', filters.riskLevel);
      }
      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate.toISOString());
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data } = await query;

      return data ? data.map(log => this.mapAuditLogFromDb(log)) : [];
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }

  // Security Alerts
  static async createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'createdAt'>): Promise<void> {
    try {
      await supabase
        .from('security_alerts')
        .insert({
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          details: alert.details as Json,
          resolved: alert.resolved,
          assigned_to: alert.assignedTo,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }

  static async getSecurityAlerts(resolved: boolean = false): Promise<SecurityAlert[]> {
    try {
      const { data } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('resolved', resolved)
        .order('created_at', { ascending: false });

      return data ? data.map(alert => this.mapSecurityAlertFromDb(alert)) : [];
    } catch (error) {
      console.error('Error getting security alerts:', error);
      return [];
    }
  }

  // IP Whitelisting
  static async getIPWhitelist(): Promise<IPWhitelistEntry[]> {
    try {
      const { data } = await supabase
        .from('ip_whitelist')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      return data ? data.map(entry => ({
        id: entry.id,
        ip_address: entry.ip_address,
        description: entry.description || '',
        is_active: entry.is_active,
        created_by: entry.created_by,
        created_at: new Date(entry.created_at)
      })) : [];
    } catch (error) {
      console.error('Error getting IP whitelist:', error);
      return [];
    }
  }

  static async addIPToWhitelist(ip: string, description: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ip_whitelist')
        .insert({
          ip_address: ip,
          description,
          is_active: true,
          created_by: (await supabase.auth.getUser()).data.user?.id || ''
        });

      return !error;
    } catch (error) {
      console.error('Error adding IP to whitelist:', error);
      return false;
    }
  }

  static async isIPWhitelisted(ip: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('ip_whitelist')
        .select('id')
        .eq('ip_address', ip)
        .eq('is_active', true)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }

  // Session Management
  static async getActiveSessions(userId?: string): Promise<SessionInfo[]> {
    try {
      let query = supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data } = await query;

      return data ? data.map(session => ({
        id: session.id,
        user_id: session.user_id,
        ip_address: session.ip_address || '',
        user_agent: session.user_agent || '',
        created_at: new Date(session.created_at),
        last_activity: new Date(session.last_activity),
        is_active: session.is_active,
        location: session.location,
        device_type: session.device_type
      })) : [];
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  static async terminateSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          is_active: false,
          terminated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      return !error;
    } catch (error) {
      console.error('Error terminating session:', error);
      return false;
    }
  }

  // Risk Assessment
  static calculateRiskLevel(event: {
    action: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    userId: string;
  }): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;

    // High-risk actions
    const highRiskActions = ['delete_user', 'update_permissions', 'export_data', 'system_settings'];
    if (highRiskActions.includes(event.action)) {
      riskScore += 3;
    }

    // Medium-risk actions
    const mediumRiskActions = ['login', 'password_change', 'create_user'];
    if (mediumRiskActions.includes(event.action)) {
      riskScore += 2;
    }

    // Time-based risk (outside business hours)
    const hour = event.timestamp.getHours();
    if (hour < 6 || hour > 22) {
      riskScore += 1;
    }

    // Weekend activity
    const day = event.timestamp.getDay();
    if (day === 0 || day === 6) {
      riskScore += 1;
    }

    if (riskScore >= 5) return 'critical';
    if (riskScore >= 3) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  // Helper methods for type conversion
  private static mapSecurityPolicyFromDb(data: any): SecurityPolicy {
    return {
      id: data.id,
      name: data.name,
      type: data.type as 'password' | 'session' | 'access' | 'audit',
      rules: this.safeParse(data.rules, []),
      isActive: data.is_active,
      appliesTo: data.applies_to || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private static mapAuditLogFromDb(data: any): AuditLog {
    return {
      id: data.id,
      user_id: data.user_id,
      action: data.action,
      resource_type: data.resource_type,
      resource_id: data.resource_id || undefined,
      details: this.safeParse(data.details, {}),
      ip_address: data.ip_address || undefined,
      user_agent: data.user_agent || undefined,
      session_id: data.session_id || undefined,
      timestamp: new Date(data.timestamp),
      risk_level: data.risk_level as 'low' | 'medium' | 'high' | 'critical'
    };
  }

  private static mapSecurityAlertFromDb(data: any): SecurityAlert {
    return {
      id: data.id,
      type: data.type as 'failed_login' | 'suspicious_activity' | 'policy_violation' | 'data_breach',
      severity: data.severity as 'low' | 'medium' | 'high' | 'critical',
      message: data.message,
      details: this.safeParse(data.details, {}),
      resolved: data.resolved,
      assignedTo: data.assigned_to || undefined,
      createdAt: new Date(data.created_at),
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined
    };
  }

  private static safeParse<T>(jsonData: Json | null, defaultValue: T): T {
    try {
      if (!jsonData) return defaultValue;
      if (typeof jsonData === 'object' && jsonData !== null) {
        return jsonData as T;
      }
      return defaultValue;
    } catch (error) {
      console.warn('Failed to parse JSON data, using default:', error);
      return defaultValue;
    }
  }
}