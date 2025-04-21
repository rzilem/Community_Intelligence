
import { ResidentType } from './resident-types';

export type MemberRole = 'board' | 'committee';
export type MemberType = 'homeowner' | 'developer' | 'builder';

export interface AssociationMemberRole {
  id: string;
  user_id: string;
  association_id: string;
  role_type: MemberRole;
  role_name: string;
  member_type: MemberType;
  created_at: string;
  updated_at: string;
}

export interface AssociationMember extends AssociationMemberRole {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface ExternalMember {
  first_name: string;
  last_name: string;
  email: string;
  user_type: 'developer' | 'builder';
}

export interface MemberFormData {
  user_id: string;
  association_id: string; // Added association_id as it's required by the database
  role_type: MemberRole;
  role_name: string;
  member_type: MemberType;
}
