
import { ResidentType } from './resident-types';

export type MemberType = 'Board Member' | 'Resident' | 'Property Manager' | 'Committee Member' | 'Other' | 'homeowner' | 'developer' | 'builder';

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
  member_type?: MemberType;
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
  user_id: string;
  association_id: string;
  member_type?: MemberType;
}

export interface ExternalMember {
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
}
