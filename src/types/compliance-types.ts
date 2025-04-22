
// Compliance related types
export type Compliance = {
  id: string;
  association_id: string;
  property_id: string;
  resident_id?: string;
  violation_type: string;
  description?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'escalated';
  fine_amount?: number;
  due_date?: string;
  resolved_date?: string;
  created_at?: string;
  updated_at?: string;
};
