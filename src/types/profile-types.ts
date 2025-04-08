
import type { Database } from '@/integrations/supabase/types';

// User profile related types
export type Profile = {
  id: string;
  role: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  profile_image_url?: string;
  job_title?: string; // Added missing field
  phone?: string; // Added missing field
  created_at?: string;
  updated_at?: string;
};

export type UserSettings = {
  id: string;
  user_id: string;
  theme?: string;
  notifications_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
};

export interface UserWithProfile {
  id: string;
  email: string;
  profile: Profile | null;
}
