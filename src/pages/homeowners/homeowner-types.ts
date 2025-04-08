
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
}
