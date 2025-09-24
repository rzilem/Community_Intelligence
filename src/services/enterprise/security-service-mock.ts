// Mock implementation for Security Service

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user_id?: string;
  ip_address?: string;
  created_at: string;
}

const mockPolicies: SecurityPolicy[] = [
  {
    id: 'policy-1',
    name: 'Default Security Policy',
    description: 'Standard security settings',
    rules: { password_min_length: 8 },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockEvents: SecurityEvent[] = [
  {
    id: 'event-1',
    event_type: 'login_attempt',
    severity: 'low',
    description: 'Successful login',
    user_id: 'user-1',
    ip_address: '192.168.1.1',
    created_at: new Date().toISOString()
  }
];

export const securityService = {
  getPolicies: async (): Promise<SecurityPolicy[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockPolicies];
  },

  createPolicy: async (data: Partial<SecurityPolicy>): Promise<SecurityPolicy> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newPolicy: SecurityPolicy = {
      id: `policy-${Date.now()}`,
      name: data.name || 'New Policy',
      description: data.description || '',
      rules: data.rules || {},
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockPolicies.push(newPolicy);
    return newPolicy;
  },

  getSecurityEvents: async (limit: number = 100): Promise<SecurityEvent[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockEvents.slice(0, limit);
  },

  logSecurityEvent: async (event: Partial<SecurityEvent>): Promise<SecurityEvent> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newEvent: SecurityEvent = {
      id: `event-${Date.now()}`,
      event_type: event.event_type || 'unknown',
      severity: event.severity || 'low',
      description: event.description || '',
      user_id: event.user_id,
      ip_address: event.ip_address,
      created_at: new Date().toISOString()
    };
    mockEvents.push(newEvent);
    return newEvent;
  },

  scanForThreats: async (): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      threats_found: 0,
      scan_time: new Date().toISOString(),
      status: 'clean'
    };
  }
};