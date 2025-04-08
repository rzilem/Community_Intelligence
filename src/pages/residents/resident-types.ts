
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
  status: 'active' | 'inactive' | 'pending-approval';
  avatarUrl?: string;
}
