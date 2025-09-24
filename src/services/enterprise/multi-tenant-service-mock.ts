// Mock implementation for Multi-Tenant Service

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  settings: any;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  permissions: string[];
  created_at: string;
}

const mockTenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Acme HOA',
    domain: 'acme-hoa.com',
    subdomain: 'acme',
    settings: { theme: 'default' },
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const multiTenantService = {
  getTenants: async (): Promise<Tenant[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockTenants];
  },

  createTenant: async (data: Partial<Tenant>): Promise<Tenant> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: data.name || 'New Tenant',
      domain: data.domain || '',
      subdomain: data.subdomain || '',
      settings: data.settings || {},
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockTenants.push(newTenant);
    return newTenant;
  },

  updateTenant: async (id: string, updates: Partial<Tenant>): Promise<Tenant> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockTenants.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Tenant not found');
    
    mockTenants[index] = {
      ...mockTenants[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockTenants[index];
  },

  deleteTenant: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockTenants.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTenants.splice(index, 1);
    }
  },

  getTenantUsers: async (tenantId: string): Promise<TenantUser[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [
      {
        id: 'tu-1',
        tenant_id: tenantId,
        user_id: 'user-1',
        role: 'admin',
        permissions: ['read', 'write'],
        created_at: new Date().toISOString()
      }
    ];
  },

  addUserToTenant: async (tenantId: string, userId: string, role: string): Promise<TenantUser> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: `tu-${Date.now()}`,
      tenant_id: tenantId,
      user_id: userId,
      role,
      permissions: ['read'],
      created_at: new Date().toISOString()
    };
  },

  getUsageMetrics: async (tenantId: string): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      api_calls: 1234,
      storage_used: 500,
      users_count: 25,
      last_activity: new Date().toISOString()
    };
  }
};