// Mock implementation for resident query service

export interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergency_contact?: string;
  resident_type: string;
  property_id: string;
  is_primary: boolean;
  move_in_date: string;
  move_out_date?: string;
  created_at: string;
  updated_at: string;
}

const mockResidents: Resident[] = [
  {
    id: 'resident-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    emergency_contact: 'Jane Doe - 555-987-6543',
    resident_type: 'owner',
    property_id: 'prop-1',
    is_primary: true,
    move_in_date: '2023-01-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const residentQueryService = {
  getResidents: async (): Promise<Resident[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockResidents];
  },

  getResidentById: async (id: string): Promise<Resident | null> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockResidents.find(r => r.id === id) || null;
  },

  getResidentsByProperty: async (propertyId: string): Promise<Resident[]> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return mockResidents.filter(r => r.property_id === propertyId);
  },

  searchResidents: async (query: string): Promise<Resident[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockResidents.filter(r => 
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.email.toLowerCase().includes(query.toLowerCase())
    );
  }
};