
export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  role: string;
  avatar_url?: string;
  profile_image_url?: string; // For backward compatibility
  job_title?: string;
  created_at: string;
  updated_at: string;
  phone?: string; // For backward compatibility
  activeAssociationId?: string; // For association-related pages
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}
