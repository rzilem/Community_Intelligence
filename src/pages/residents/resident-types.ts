
export interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'owner' | 'tenant' | 'family-member';
  propertyId: string;
  propertyAddress: string;
  association: string;
  moveInDate: string;
  moveOutDate?: string; // Adding this property
  status: 'active' | 'inactive' | 'pending-approval';
  avatarUrl?: string;
}
