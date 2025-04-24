
export interface Association {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}
