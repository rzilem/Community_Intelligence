
export interface Compliance {
  id: string;
  association_id: string;
  property_id: string;
  resident_id?: string;
  violation_type: string;
  description?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'escalated';
  due_date?: string;
  fine_amount?: number;
  resolved_date?: string;
  created_at: string;
  updated_at: string;
}
