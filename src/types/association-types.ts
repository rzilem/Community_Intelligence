
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
