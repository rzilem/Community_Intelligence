
export interface DatabaseProperty {
  id: string;
  address: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_footage?: number;
  hoa_id?: string; // Changed from association_id to match actual schema
  unit_number?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseResident {
  id: string;
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  resident_type: string;
  is_primary?: boolean;
  move_in_date?: string;
  move_out_date?: string;
  property_id?: string;
  emergency_contact?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FormattedResident {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyAddress: string;
  propertyId: string;
  type: 'owner' | 'tenant' | 'family-member';
  status: 'active' | 'inactive' | 'pending-approval';
  moveInDate: string;
  moveOutDate?: string;
  association: string;
  associationName: string;
  lastPayment: { amount: number; date: string } | null;
  closingDate: string | null;
  hasValidAssociation: boolean;
  // Additional properties to match Homeowner type
  balance?: number;
  avatarUrl?: string;
  aclStartDate?: string;
  unitNumber?: string;
  property?: string;
  unit?: string;
  tags?: string[];
  violations?: string[];
  lastContact?: {
    called: string;
    visit: string;
    email: string;
  };
  notes?: {
    type: 'system' | 'manual';
    author: string;
    content: string;
    date: string;
  }[];
  propertyImage?: string;
}

export interface AssociationData {
  id: string;
  name: string;
}

export interface PropertyLookup {
  [propertyId: string]: DatabaseProperty;
}

export interface AssociationLookup {
  [associationId: string]: string;
}
