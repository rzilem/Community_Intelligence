
import { Profile } from './profile-types';

// Property related types
export type Property = {
  id: string;
  association_id: string;
  property_type: string;
  address: string;
  unit_number?: string;
  square_feet?: number;
  city?: string;
  state?: string;
  zip?: string;
  bedrooms?: number;
  bathrooms?: number;
  created_at?: string;
  updated_at?: string;
};

// Client-side Property type (to be used in the UI)
export interface PropertyUI {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: 'single-family' | 'townhouse' | 'condo' | 'apartment';
  bedrooms: number;
  bathrooms: number;
  sqFt: number;
  association: string;
  associationId: string;
  status: 'occupied' | 'vacant' | 'pending' | 'delinquent';
  ownerName?: string;
}

export type Resident = {
  id: string;
  user_id?: string;
  property_id?: string;
  resident_type: string;
  is_primary?: boolean;
  move_in_date?: string;
  move_out_date?: string;
  name?: string;
  email?: string;
  phone?: string;
  emergency_contact?: string;
  created_at?: string;
  updated_at?: string;
};

export type ResidentWithProfile = Resident & {
  user?: {
    profile?: Profile;
  };
};
