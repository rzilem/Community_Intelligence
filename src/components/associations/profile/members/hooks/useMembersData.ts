
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AssociationMember, associationMemberService } from '@/services/association-member-service';
import { User } from '../utils/member-types';

export const useMembersData = (associationId: string) => {
  const [members, setMembers] = useState<AssociationMember[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchUsers = async () => {
    try {
      const data = await associationMemberService.getAssociationUsers(associationId);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load association users');
    }
  };

  useEffect(() => {
    if (associationId) {
      fetchMembers();
      fetchUsers();
    }
  }, [associationId]);

  const addMember = async (memberData: {
    user_id: string;
    association_id: string;
    role_type: 'board' | 'committee';
    role_name: string;
  }) => {
    try {
      setIsLoading(true);
      await associationMemberService.addAssociationMember(memberData);
      toast.success('Member added successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMember = async (memberId: string, memberData: {
    role_type: 'board' | 'committee';
    role_name: string;
  }) => {
    try {
      setIsLoading(true);
      await associationMemberService.updateAssociationMember(memberId, memberData);
      toast.success('Member updated successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      setIsLoading(true);
      await associationMemberService.removeAssociationMember(memberId);
      toast.success('Member removed successfully');
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
    users,
    isLoading,
    addMember,
    updateMember,
    deleteMember,
    refetchMembers: fetchMembers
  };
};
