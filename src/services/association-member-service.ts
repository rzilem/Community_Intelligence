
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AssociationMemberRole } from '@/types/communication-types';

export interface AssociationMember {
  id: string;
  user_id: string;
  association_id: string;
  role_type: 'board' | 'committee';
  role_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export const associationMemberService = {
  // Fetch board and committee members for an association
  getAssociationMembers: async (associationId: string) => {
    const { data, error } = await supabase
      .from('association_member_roles')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('association_id', associationId)
      .order('role_type')
      .order('role_name');

    if (error) {
      console.error('Error fetching association members:', error);
      throw error;
    }

    // Transform the data to flatten the profiles information
    return data.map(member => ({
      id: member.id,
      user_id: member.user_id,
      association_id: member.association_id,
      role_type: member.role_type,
      role_name: member.role_name,
      first_name: member.profiles?.first_name || '',
      last_name: member.profiles?.last_name || '',
      email: member.profiles?.email || '',
      created_at: member.created_at,
      updated_at: member.updated_at
    })) as AssociationMember[];
  },

  // Add a new board or committee member
  addAssociationMember: async (memberData: {
    user_id: string;
    association_id: string;
    role_type: 'board' | 'committee';
    role_name: string;
  }) => {
    const { data, error } = await supabase
      .from('association_member_roles')
      .insert(memberData)
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error adding association member:', error);
      throw error;
    }

    toast.success(`Member added as ${memberData.role_name} successfully`);

    return {
      id: data.id,
      user_id: data.user_id,
      association_id: data.association_id,
      role_type: data.role_type,
      role_name: data.role_name,
      first_name: data.profiles?.first_name || '',
      last_name: data.profiles?.last_name || '',
      email: data.profiles?.email || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    } as AssociationMember;
  },

  // Update an existing board or committee member
  updateAssociationMember: async (id: string, memberData: {
    role_type: 'board' | 'committee';
    role_name: string;
  }) => {
    const { data, error } = await supabase
      .from('association_member_roles')
      .update(memberData)
      .eq('id', id)
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error updating association member:', error);
      throw error;
    }

    toast.success(`Member updated successfully`);

    return {
      id: data.id,
      user_id: data.user_id,
      association_id: data.association_id,
      role_type: data.role_type,
      role_name: data.role_name,
      first_name: data.profiles?.first_name || '',
      last_name: data.profiles?.last_name || '',
      email: data.profiles?.email || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    } as AssociationMember;
  },

  // Remove a board or committee member
  removeAssociationMember: async (id: string) => {
    const { error } = await supabase
      .from('association_member_roles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing association member:', error);
      throw error;
    }

    toast.success('Member removed successfully');
  },

  // Get all association users for selection
  getAssociationUsers: async (associationId: string) => {
    const { data, error } = await supabase
      .from('association_users')
      .select(`
        *,
        profiles:user_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('association_id', associationId);

    if (error) {
      console.error('Error fetching association users:', error);
      throw error;
    }

    return data.map(user => ({
      id: user.user_id,
      first_name: user.profiles?.first_name,
      last_name: user.profiles?.last_name,
      email: user.profiles?.email,
      role: user.role
    }));
  }
};
