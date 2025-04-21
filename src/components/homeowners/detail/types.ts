
export interface Homeowner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  moveInDate?: string;
  moveOutDate?: string;
  property?: string;
  propertyAddress?: string;
  unit?: string;
  unitNumber?: string;
  balance?: string;
  status?: string;
  notes?: NoteType[];
  tags?: string[];
  violations?: number | string[]; // Allow both number and string array for backward compatibility
  avatarUrl?: string;
  lastContact?: string | {
    called?: string;
    visit?: string;
    email?: string;
  };
  lastLoginDate?: string;
  type?: 'owner' | 'tenant' | 'family-member' | 'other';
  propertyId?: string;
  association?: string;
  closingDate?: string;
  lastPayment?: { amount: number; date: string };
}
