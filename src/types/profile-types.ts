
export interface Profile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: "maintenance" | "admin" | "manager" | "resident" | "accountant" | "user";
  profile_image_url?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Allow for additional properties
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'system' | 'light' | 'dark';
  notifications_enabled: boolean;
  email_notifications_enabled?: boolean;
  column_preferences?: Record<string, string[]> | null;
  date_format?: string;
  time_format?: string;
  created_at?: string;
  updated_at?: string;
}
