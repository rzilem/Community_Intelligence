
import { ResidentType } from './resident-types';

export type MemberType = 'Board Member' | 'Resident' | 'Property Manager' | 'Committee Member' | 'Other';

export interface AssociationMember {
  id: string;
  user_id: string;
  association_id: string;
  role_name: string;
  role_type: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MemberFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role_name: string;
  role_type: string;
}
