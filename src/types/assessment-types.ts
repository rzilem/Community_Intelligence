
// Assessment related types
export type Assessment = {
  id: string;
  property_id: string;
  association_id: string;
  amount: number;
  due_date: string;
  assessment_type: 'monthly' | 'quarterly' | 'annual' | 'special';
  assessment_type_id?: string; // Added to match the service implementation
  status: 'paid' | 'unpaid' | 'partial' | 'late';
  paid?: boolean;
  payment_date?: string;
  late_fee?: number;
  created_at?: string;
  updated_at?: string;
};

export type AssessmentType = {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  is_recurring?: boolean;
  recurrence_period?: string;
  created_at?: string;
  updated_at?: string;
};
