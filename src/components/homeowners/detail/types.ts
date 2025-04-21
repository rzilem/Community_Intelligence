
export interface Homeowner {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  moveInDate?: string;
  property?: string;
  unit?: string;
  balance?: string;
  status?: string;
  tags?: string[];
  // Allow violations to be either a number or a string array
  violations?: number | string[];
  lastContact?: {
    email?: string;
    called?: string;
    visit?: string;
  } | string;
  lastLoginDate?: string;
  notes?: NoteType[];
  avatarUrl?: string;
}

export interface NoteType {
  id?: string;
  content: string;
  author: string;
  date: string;
  type?: 'manual' | 'system';
}
