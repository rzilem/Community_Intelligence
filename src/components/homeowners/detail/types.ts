
export interface Homeowner {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  moveInDate?: string;
  moveOutDate?: string;
  property?: string;
  propertyAddress?: string; // Added to match form usage
  unit?: string;
  unitNumber?: string; // Added to match form usage
  balance?: string;
  status?: string;
  tags?: string[];
  violations?: number | string[];
  lastContact?: {
    email?: string;
    called?: string;
    visit?: string;
  } | string;
  lastLoginDate?: string;
  notes?: NoteType[];
  avatarUrl?: string;
  type?: 'owner' | 'tenant' | 'family-member' | 'other';
}

export interface NoteType {
  id?: string;
  content: string;
  author: string;
  date: string;
  type: 'manual' | 'system';
}
