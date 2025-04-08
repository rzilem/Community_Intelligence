
import type { Database } from '@/integrations/supabase/types';

// Get strongly typed references to tables
export type Tables = Database['public']['Tables'];

// Define types for specific tables
export type Profile = Tables['profiles']['Row'];
export type Association = Tables['associations']['Row'];
export type Property = Tables['properties']['Row'];
export type CalendarEvent = Tables['calendar_events']['Row'];
export type Document = Tables['documents']['Row'];

// Define application-specific types that extend or use Supabase types
export interface UserWithProfile {
  id: string;
  email: string;
  profile: Profile | null;
}

// Add other application-specific types below
