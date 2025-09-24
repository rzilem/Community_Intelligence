// Use mock implementation
export * from './resident-query-service-mock';

// Add missing exports for compatibility
export const fetchResidentById = async (id: string) => {
  const { residentQueryService } = await import('./resident-query-service-mock');
  return residentQueryService.getResidentById(id);
};

export const updateResident = async (id: string, updates: any) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { id, ...updates, updated_at: new Date().toISOString() };
};

export const createResident = async (data: any) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { 
    id: `resident-${Date.now()}`, 
    ...data, 
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};