
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
  status?: 'active' | 'inactive' | 'pending' | string;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  total_units?: number;
  contact_email?: string;
  is_archived?: boolean;
  property_type?: string;
  founded_date?: string;
  website?: string;
  phone?: string;
  country?: string;
  fire_inspection_due?: string;
  insurance_expiration?: string;
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
