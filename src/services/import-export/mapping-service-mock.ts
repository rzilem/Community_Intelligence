// Mock implementation for mapping service

export const mappingService = {
  saveMappings: async (mappings: any): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Mock save functionality
  },

  getMappings: async (type: string): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return [
      {
        id: 'mapping-1',
        type: type,
        source_field: 'Name',
        target_field: 'name',
        confidence: 0.95
      }
    ];
  },

  updateMapping: async (id: string, updates: any): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      id: id,
      ...updates,
      updated_at: new Date().toISOString()
    };
  },

  deleteMapping: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Mock delete functionality
  }
};