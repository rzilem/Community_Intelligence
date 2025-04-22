
export interface AssociationMember {
  id: string;
  association_id: string;
  user_id: string;
  role_name: string;
  role_type: 'board' | 'committee';
  created_at: string;
  updated_at: string;
}
