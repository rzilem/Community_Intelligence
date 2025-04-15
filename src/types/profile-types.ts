
export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  profile_image_url?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  notifications_enabled: boolean;
  column_preferences?: Record<string, string[]>;
  created_at?: string;
  updated_at?: string;
}
