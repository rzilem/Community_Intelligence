
import { useState } from 'react';
import { AssociationMember } from '@/services/association-member-service';
import { MemberDialogState, MemberType } from '../utils/member-types';

export const useMemberDialog = () => {
  const [dialogState, setDialogState] = useState<MemberDialogState>({
    isOpen: false,
    editingMember: null,
    selectedUserId: '',
    roleType: 'board',
    roleName: ''
  });

  const openAddDialog = (roleType: MemberType = 'board') => {
    setDialogState({
      isOpen: true,
      editingMember: null,
      selectedUserId: '',
      roleType,
      roleName: ''
    });
  };

  const openEditDialog = (member: AssociationMember) => {
    setDialogState({
      isOpen: true,
      editingMember: member,
      selectedUserId: member.user_id,
      roleType: member.role_type,
      roleName: member.role_name
    });
  };

  const closeDialog = () => {
    setDialogState({
      isOpen: false,
      editingMember: null,
      selectedUserId: '',
      roleType: 'board',
      roleName: ''
    });
  };

  const updateDialogField = (field: keyof Omit<MemberDialogState, 'isOpen' | 'editingMember'>, value: any) => {
    setDialogState(prev => ({ ...prev, [field]: value }));
  };

  return {
    dialogState,
    openAddDialog,
    openEditDialog,
    closeDialog,
    updateDialogField
  };
};
