
import type { Database } from '@/integrations/supabase/types';

// Association related types
export type Association = {
  id: string;
  name: string;
  address?: string;
  contact_email?: string;
  created_at?: string;
  updated_at?: string;
  
  // Extended fields for association profile
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  website?: string;
  founded_date?: string;
  total_units?: number;
  description?: string;
  property_type?: string;
  insurance_expiration?: string;
  fire_inspection_due?: string;
};

export type HOA = Association;

export type AssociationUser = {
  id: string;
  association_id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'member';
  created_at?: string;
  updated_at?: string;
};

export interface AssociationAIIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  daysRemaining?: number;
}
