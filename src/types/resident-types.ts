
export interface ResidentPreferences {
  notifications?: {
    email?: boolean;
    sms?: boolean;
    inAppNotifications?: boolean;
  };
  contactPreferences?: {
    preferredContactMethod?: 'email' | 'phone' | 'mail';
    shareContactInfo?: boolean;
  };
  portalAccess?: {
    canViewDocuments?: boolean;
    canViewFinancials?: boolean;
    canPostInForum?: boolean;
  };
}

export type ResidentType = 'owner' | 'tenant' | 'family' | 'other';

export interface Resident {
  id: string;
  property_id?: string;
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  resident_type: string;
  emergency_contact?: string;
  is_primary?: boolean;
  move_in_date?: string;
  move_out_date?: string;
  created_at: string;
  updated_at: string;
  preferences?: ResidentPreferences;
}

export interface ResidentWithProfile {
  id: string;
  property_id: string;
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  resident_type: string;
  emergency_contact?: string;
  is_primary?: boolean;
  move_in_date?: string;
  move_out_date?: string;
  created_at: string;
  updated_at: string;
  preferences?: ResidentPreferences;
  user?: {
    profile?: {
      id: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      role?: string;
      phone_number?: string;
      profile_image_url?: string;
    }
  };
}
