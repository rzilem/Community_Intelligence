
export interface Homeowner {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'owner' | 'tenant' | 'family-member';
  propertyId: string;
  propertyAddress: string;
  association: string;
  moveInDate: string;
  moveOutDate?: string;
  status: 'active' | 'inactive' | 'pending-approval';
  avatarUrl?: string;
  balance?: number;
  lastPayment?: { amount: number; date: string };
  aclStartDate?: string;
  unitNumber?: string;
  property?: string; // Adding this for backward compatibility
  unit?: string; // Adding this for backward compatibility
  tags?: string[]; // Add missing property used in useHomeownerData
  violations?: string[]; // Add missing property used in useHomeownerData
  lastContact?: { // Add missing property used in useHomeownerData
    called: string;
    visit: string;
    email: string;
  };
  notes?: { // Add missing property used in useHomeownerData
    type: 'system' | 'manual';
    author: string;
    content: string;
    date: string;
  }[];
  closingDate?: string; // Added the missing closingDate property
}
