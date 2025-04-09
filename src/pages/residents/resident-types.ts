
export interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'owner' | 'tenant' | 'family-member' | 'other'; // Add 'other' to match ResidentType in resident-types.ts
  propertyId: string;
  propertyAddress: string;
  association: string;
  moveInDate: string;
  moveOutDate?: string;
  status: 'active' | 'inactive' | 'pending-approval';
  avatarUrl?: string;
}
