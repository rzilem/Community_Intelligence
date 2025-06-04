
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
  association_id?: string;
  unit_number?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseResident {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  resident_type: string;
  move_in_date?: string;
  move_out_date?: string;
  property_id?: string;
}

export interface FormattedResident {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyAddress: string;
  propertyId: string;
  type: 'owner' | 'tenant' | 'family-member'; // Fixed to match Homeowner type
  status: string;
  moveInDate: string;
  moveOutDate?: string;
  association: string;
  associationName: string;
  lastPayment: null;
  closingDate: null;
  hasValidAssociation: boolean;
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
