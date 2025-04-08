
import type { Database } from '@/integrations/supabase/types';

// Association related types
export type Association = {
  id: string;
  name: string;
  address?: string;
  contact_email?: string;
  created_at?: string;
  updated_at?: string;
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
