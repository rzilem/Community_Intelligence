
import type { Database } from '@/integrations/supabase/types';

// Get strongly typed references to tables
export type Tables = Database['public']['Tables'];

// Define types for specific tables
export type Profile = {
  id: string;
  role: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  resident_id?: string;
  hoa_id?: string;
  resident?: Resident;
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

export type HOA = {
  id: string;
  name: string;
  address?: string;
  contact_email?: string;
  created_at?: string;
  updated_at?: string;
};

export type Property = {
  id: string;
  hoa_id: string;
  type: string;
  address: string;
  unit_number?: string;
  square_footage?: number;
  owner_name?: string;
  created_at?: string;
  updated_at?: string;
};

export type Resident = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emergency_contact?: string;
  created_at?: string;
  updated_at?: string;
};

export type Association = {
  id: string;
  name: string;
};

export type CalendarEvent = {
  id: string;
  hoa_id: string;
  amenity_id?: string;
  event_type: string;
  title: string;
  start_time: string;
  end_time: string;
  booked_by?: string;
  visibility: string;
  created_at?: string;
  updated_at?: string;
};

export type Document = {
  id: string;
  association_id: string;
  name: string;
  url: string;
  file_type: string;
  file_size: number;
  description?: string;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  is_archived?: boolean;
  uploaded_by?: string;
  uploaded_date?: string;
};

// Add other application-specific types below
export type Assessment = {
  id: string;
  property_id: string;
  amount: number;
  due_date: string;
  paid: boolean;
  payment_date?: string;
  late_fee?: number;
  created_at?: string;
  updated_at?: string;
};

export type MaintenanceRequest = {
  id: string;
  property_id: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
};

export type Compliance = {
  id: string;
  hoa_id: string;
  property_id: string;
  resident_id?: string;
  violation_type: string;
  description?: string;
  status: 'open' | 'resolved' | 'escalated';
  fine_amount?: number;
  created_at?: string;
  updated_at?: string;
};

// Define application-specific types that extend or use Supabase types
export interface UserWithProfile {
  id: string;
  email: string;
  profile: Profile | null;
}
