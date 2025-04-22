
export type ResidentType = 'Owner' | 'Tenant' | 'Occupant' | 'Board Member' | 'Property Manager' | 'Other';

export interface Resident {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  resident_type: ResidentType;
  property_id?: string;
  user_id?: string;
  move_in_date?: string;
  move_out_date?: string;
  emergency_contact?: string;
  is_primary?: boolean;
  client_portal_link?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ResidentWithProfile extends Resident {
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  user?: {
    profile?: {
      id?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone_number?: string;
    }
  };
}
