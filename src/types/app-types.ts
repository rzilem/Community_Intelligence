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
  phone_number?: string;
  profile_image_url?: string;
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
  association_id: string;
  property_type: string;
  address: string;
  unit_number?: string;
  square_feet?: number;
  city?: string;
  state?: string;
  zip?: string;
  bedrooms?: number;
  bathrooms?: number;
  created_at?: string;
  updated_at?: string;
};

export type Resident = {
  id: string;
  user_id?: string;
  property_id?: string;
  resident_type: string;
  is_primary?: boolean;
  move_in_date?: string;
  move_out_date?: string;
  name?: string;
  email?: string;
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
  color?: string;
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

export type Assessment = {
  id: string;
  property_id: string;
  amount: number;
  due_date: string;
  paid: boolean;
  payment_date?: string;
  late_fee?: number;
  assessment_type_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type AssessmentType = {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  is_recurring?: boolean;
  recurrence_period?: string;
  created_at?: string;
  updated_at?: string;
};

export type MaintenanceRequest = {
  id: string;
  property_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high';
  resolved_date?: string;
  created_at?: string;
  updated_at?: string;
};

export type Compliance = {
  id: string;
  association_id: string;
  property_id: string;
  resident_id?: string;
  violation_type: string;
  description?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'escalated';
  fine_amount?: number;
  due_date?: string;
  resolved_date?: string;
  created_at?: string;
  updated_at?: string;
};

export type Amenity = {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  capacity?: number;
  booking_fee?: number;
  requires_approval?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Announcement = {
  id: string;
  association_id: string;
  title: string;
  content: string;
  author_id?: string;
  is_published?: boolean;
  publish_date?: string;
  expiry_date?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  created_at?: string;
  updated_at?: string;
};

export type AssociationUser = {
  id: string;
  association_id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'member';
  created_at?: string;
  updated_at?: string;
};

export type Comment = {
  id: string;
  parent_type: string;
  parent_id: string;
  user_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
};

export interface UserWithProfile {
  id: string;
  email: string;
  profile: Profile | null;
}

export type ResidentWithProfile = Resident & {
  user?: {
    profile?: Profile;
  };
};
