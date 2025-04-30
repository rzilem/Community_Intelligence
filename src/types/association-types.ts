
export interface Association {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  created_at: string;
  updated_at: string;
  status?: string; // Changed from restricted enum to accept any string
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  total_units?: number;
  [key: string]: any; // Allow for additional fields
}

export interface AssociationAIIssue {
  id: string;
  association_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  created_at: string;
  updated_at: string;
}
