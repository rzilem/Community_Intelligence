
import { useState } from 'react';
import { AssociationMember, MemberType } from '@/types/member-types';
import { associationMemberService } from '@/services/members/association-member-service';
import { externalMemberService } from '@/services/members/external-member-service';
import { toast } from 'sonner';

export const useMemberOperations = (associationId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<AssociationMember[]>([]);
  const [editingMember, setEditingMember] = useState<AssociationMember | null>(null);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const data = await associationMemberService.getAssociationMembers(associationId);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load association members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMember = async ({
    selectedUserId,
    roleType,
    roleName,
    memberType,
    manualFirstName,
    manualLastName,
    manualEmail
  }: {
    selectedUserId: string;
    roleType: 'board' | 'committee';
    roleName: string;
    memberType: MemberType;
    manualFirstName: string;
    manualLastName: string;
    manualEmail: string;
  }) => {
    try {
      setIsLoading(true);
      
      let userId = selectedUserId;
      
      if (memberType !== 'homeowner') {
        const existingUserData = await externalMemberService.findUserByEmail(manualEmail);
        
        if (existingUserData) {
          userId = existingUserData.id;
        } else {
          const newUserData = await externalMemberService.createExternalUser({
            first_name: manualFirstName,
            last_name: manualLastName,
            email: manualEmail,
            user_type: memberType
          }, associationId);
          
          if (newUserData) {
            userId = newUserData.id;
          } else {
            throw new Error('Failed to create user');
          }
        }
      }
      
      if (editingMember) {
        await associationMemberService.updateAssociationMember(editingMember.id, {
          role_type: roleType,
          role_name: roleName,
          user_id: userId,
          association_id: associationId,
          first_name: '',
          last_name: '',
          email: '',
          member_type: memberType
        });
      } else {
        await associationMemberService.addAssociationMember({
          user_id: userId,
          association_id: associationId,
          role_type: roleType,
          role_name: roleName,
          first_name: '',
          last_name: '',
          email: '',
          member_type: memberType
        });
      }

      fetchMembers();
      return true;
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('Failed to save member');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      setIsLoading(true);
      await associationMemberService.removeAssociationMember(memberId);
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    members,
    isLoading,
    editingMember,
    setEditingMember,
    fetchMembers,
    handleSaveMember,
    handleDeleteMember
  };
};
