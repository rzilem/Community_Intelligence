// Mock implementation for API Gateway Service

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  association_id: string;
  permissions: string[];
  rate_limit_per_minute: number;
  expires_at: string | null;
  is_active: boolean;
  last_used: string | null;
  created_at: string;
  updated_at: string;
}

const mockApiKeys: ApiKey[] = [
  {
    id: 'api-key-1',
    name: 'Test API Key',
    key: 'sk_test_123456789',
    association_id: 'assoc-1',
    permissions: ['read', 'write'],
    rate_limit_per_minute: 60,
    expires_at: null,
    is_active: true,
    last_used: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const apiGatewayService = {
  getApiKeys: async (): Promise<ApiKey[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockApiKeys];
  },

  createApiKey: async (data: Partial<ApiKey>): Promise<ApiKey> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newKey: ApiKey = {
      id: `api-key-${Date.now()}`,
      name: data.name || 'New API Key',
      key: `sk_test_${Math.random().toString(36).substring(2)}`,
      association_id: data.association_id || '',
      permissions: data.permissions || ['read'],
      rate_limit_per_minute: data.rate_limit_per_minute || 60,
      expires_at: data.expires_at || null,
      is_active: true,
      last_used: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockApiKeys.push(newKey);
    return newKey;
  },

  updateApiKey: async (id: string, updates: Partial<ApiKey>): Promise<ApiKey> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockApiKeys.findIndex(key => key.id === id);
    if (index === -1) throw new Error('API Key not found');
    
    mockApiKeys[index] = {
      ...mockApiKeys[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockApiKeys[index];
  },

  deleteApiKey: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockApiKeys.findIndex(key => key.id === id);
    if (index !== -1) {
      mockApiKeys.splice(index, 1);
    }
  },

  validateApiKey: async (key: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockApiKeys.some(apiKey => apiKey.key === key && apiKey.is_active);
  }
};