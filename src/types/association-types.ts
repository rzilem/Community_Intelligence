
export interface Association {
  id: string;
  name: string;
  property_type?: string;
  total_units?: number;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contact_email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
  // Adding missing properties that were causing errors
  website?: string;
  description?: string;
  country?: string;
  founded_date?: string;
  insurance_expiration?: string;
  fire_inspection_due?: string;
}

export interface AssociationFormData {
  name: string;
  type?: string;
  units?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  email?: string;
  phone?: string;
}

export interface AssociationStats {
  total: number;
  active: number;
  inactive: number;
  recentlyAdded: number;
}

export interface AssociationEditProps {
  association: Association;
  onSave: (data: Partial<Association>) => void;
}

export interface AssociationDetailsProps {
  associationId: string;
}

// Adding missing type that was causing errors
export interface AssociationAIIssue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  status: 'open' | 'in_progress' | 'resolved';
  resolution_steps?: string[];
  association_id: string;
}
