
export interface Association {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  
  // Additional fields needed by components
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contact_email?: string;
  phone?: string;
  property_type?: string;
  total_units?: number;
  website?: string;
  founded_date?: string;
  insurance_expiration?: string;
  fire_inspection_due?: string;
  is_archived?: boolean;
}

export interface AssociationAIIssue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  created_at: string;
  status: 'open' | 'in_progress' | 'resolved';
  association_id: string;
}
