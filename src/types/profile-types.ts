
export interface Profile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  profile_image_url?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Allow for additional properties
}
