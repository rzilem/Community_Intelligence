
import { AssociationMember } from '@/services/association-member-service';

export type MemberType = 'board' | 'committee';

export interface MemberDialogState {
  isOpen: boolean;
  editingMember: AssociationMember | null;
  selectedUserId: string;
  roleType: MemberType;
  roleName: string;
}

export interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
}
