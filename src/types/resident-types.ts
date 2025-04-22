
export type ResidentType = 'owner' | 'tenant' | 'family' | 'other';

export interface Resident {
  id: string;
  user_id?: string;
  property_id?: string;
  resident_type: ResidentType;
  is_primary?: boolean;
  move_in_date?: string;
  move_out_date?: string;
  name?: string;
  email?: string;
  phone?: string;
  emergency_contact?: string;
  created_at?: string;
  updated_at?: string;
  property?: {
    address?: string;
    unit_number?: string;
  };
}

export interface ResidentWithProfile extends Resident {
  user?: {
    profile?: {
      id: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      role?: string;
      phone_number?: string;
      profile_image_url?: string;
    };
  };
}
