// Mock implementation for hoa resident service

export const createResident = async (data: any) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { 
    id: `resident-${Date.now()}`, 
    ...data, 
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};