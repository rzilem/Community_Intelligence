
export interface ResidentWithProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  resident_type: string;
  property_id?: string;
  move_in_date?: string;
  move_out_date?: string;
  emergency_contact?: string;
  is_primary?: boolean;
  user?: {
    profile?: {
      id: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone_number?: string;
    };
  };
}
