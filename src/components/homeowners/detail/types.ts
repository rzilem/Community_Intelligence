
export interface NoteType {
  type: 'system' | 'manual';
  author: string;
  content: string;
  date: string;
}

export interface Homeowner {
  id: string;
  name: string;
  email: string;
  phone: string;
  moveInDate: string;
  property: string;
  unit: string;
  balance: number;
  tags: string[];
  violations: string[];
  lastContact: {
    called: string;
    visit: string;
    email: string;
  };
  status: string;
  avatarUrl: string;
  notes: NoteType[];
}
