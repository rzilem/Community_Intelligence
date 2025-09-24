import { toast } from 'sonner';
import { Association } from '@/types/association-types';
import { devLog } from '@/utils/dev-logger';

// Mock implementation for association service

export const fetchAllAssociations = async () => {
  devLog.info('MOCK: Fetching all associations...');
  
  const mockAssociations = [
    {
      id: '1',
      name: 'Sunrise HOA',
      description: 'A beautiful sunrise community',
      address: '123 Sunrise Blvd',
      city: 'Phoenix',
      state: 'AZ',
      zip: '85001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '2',
      name: 'Mountain View Association',
      description: 'Scenic mountain community',
      address: '456 Mountain Dr',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active'
    }
  ];
  
  devLog.info(`MOCK: Successfully fetched ${mockAssociations.length} associations`);
  return mockAssociations;
};

export const fetchAssociationById = async (id: string) => {
  devLog.info('MOCK: Fetching association by ID:', id);
  
  const mockAssociation = {
    id,
    name: 'Sample HOA',
    description: 'A sample homeowners association',
    address: '123 Main St',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active'
  };
  
  return mockAssociation;
};

export const createAssociation = async (associationData: { 
  name: string, 
  address?: string, 
  contact_email?: string,
  city?: string,
  state?: string,
  zip?: string,
  phone?: string,
  property_type?: string,
  total_units?: number
}) => {
  devLog.info('MOCK: Creating association with data:', associationData);
  
  const mockAssociation = {
    id: Math.random().toString(),
    name: associationData.name,
    address: associationData.address || '',
    city: associationData.city || '',
    state: associationData.state || '',
    zip: associationData.zip || '',
    contact_email: associationData.contact_email || '',
    contact_phone: associationData.phone || '',
    property_type: associationData.property_type || 'hoa',
    total_units: associationData.total_units || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active'
  };
  
  toast.success(`Association "${mockAssociation.name}" created successfully`);
  return mockAssociation;
};

export const updateAssociation = async (id: string, updates: Record<string, any>) => {
  devLog.info('MOCK: Updating association:', id, updates);
  
  const mockUpdatedAssociation = {
    id,
    name: 'Updated Association',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active',
    ...updates
  };
  
  return mockUpdatedAssociation;
};

export const deleteAssociation = async (id: string) => {
  devLog.info('MOCK: Deleting association:', id);
  toast.success('Association deleted successfully');
  return true;
};

// Also export the user association functions from the existing service
export const fetchUserAssociations = async (userId: string) => {
  try {
    const mockData = [
      {
        id: '1',
        role: 'admin',
        associations: {
          id: '1',
          name: 'Sunrise HOA',
          description: 'A beautiful community',
          address: '123 Main St',
          city: 'Phoenix',
          state: 'AZ',
          zip: '85001',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'active'
        }
      }
    ];

    return mockData;
  } catch (error) {
    devLog.error('Error in fetchUserAssociations:', error);
    return [];
  }
};

export const assignUserToAssociation = async (
  userId: string, 
  associationId: string, 
  role: 'admin' | 'manager' | 'member' = 'member'
) => {
  try {
    devLog.info('MOCK: Assigning user to association', { userId, associationId, role });
    return { success: true };
  } catch (error) {
    devLog.error('Error in assignUserToAssociation:', error);
    return null;
  }
};

export const updateUserRole = async (
  userId: string,
  associationId: string,
  role: 'admin' | 'manager' | 'member'
) => {
  try {
    devLog.info('MOCK: Updating user role', { userId, associationId, role });
    return { success: true };
  } catch (error) {
    devLog.error('Error in updateUserRole:', error);
    return null;
  }
};