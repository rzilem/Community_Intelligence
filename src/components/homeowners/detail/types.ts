
export interface NoteType {
  id?: string;
  content: string;
  author: string;
  date: string;
  type: 'manual' | 'system';
}

export interface Homeowner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  moveInDate?: string;
  property?: string;
  unit?: string;
  balance?: string;
  status?: string;
  notes?: NoteType[];
  tags?: string[];
  violations?: number;
  avatarUrl?: string;
  lastContact?: string | {
    called?: string;
    visit?: string;
    email?: string;
  };
  lastLoginDate?: string;
}
