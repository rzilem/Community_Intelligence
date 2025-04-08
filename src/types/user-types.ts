
import { User } from '@supabase/supabase-js';
import { Profile } from './app-types';

export interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
    email: string | null;
    profile_image_url: string | null;
  };
}
