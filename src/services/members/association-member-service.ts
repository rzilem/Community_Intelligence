
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AssociationMember, MemberFormData } from '@/types/member-types';

export const associationMemberService = {
  getAssociationMembers: async (associationId: string): Promise<AssociationMember[]> => {
    try {
      const { data, error } = await supabase
        .from('association_member_roles')
        .select('*, member_type')
        .eq('association_id', associationId)
        .order('role_type')
        .order('role_name');

      if (error) {
        console.error('Error fetching association members:', error);
        throw error;
      }

      const membersWithProfiles = await Promise.all(
        data.map(async (member) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', member.user_id)
            .single();

          if (profileError) {
            console.warn(`Could not fetch profile for user ${member.user_id}:`, profileError);
          }

          return {
            ...member,
            first_name: profileData?.first_name || '',
            last_name: profileData?.last_name || '',
            email: profileData?.email || '',
            member_type: member.member_type || 'homeowner' // Default to homeowner if not specified
          } as AssociationMember;
        })
      );

      return membersWithProfiles;
    } catch (error) {
      console.error('Error in getAssociationMembers:', error);
      throw error;
    }
  },

  addAssociationMember: async (memberData: MemberFormData): Promise<AssociationMember> => {
    try {
      const { data, error } = await supabase
        .from('association_member_roles')
        .insert({
          user_id: memberData.user_id,
          association_id: memberData.association_id,
          role_type: memberData.role_type,
          role_name: memberData.role_name,
          member_type: memberData.member_type
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding association member:', error);
        throw error;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', memberData.user_id)
        .single();

      if (profileError) {
        console.warn(`Could not fetch profile for user ${memberData.user_id}:`, profileError);
      }

      toast.success(`Member added as ${memberData.role_name} successfully`);

      return {
        ...data,
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        email: profileData?.email || '',
        member_type: memberData.member_type
      } as AssociationMember;
    } catch (error) {
      console.error('Error in addAssociationMember:', error);
      throw error;
    }
  },

  updateAssociationMember: async (id: string, memberData: Partial<MemberFormData>): Promise<AssociationMember> => {
    try {
      const { data, error } = await supabase
        .from('association_member_roles')
        .update({ 
          role_type: memberData.role_type,
          role_name: memberData.role_name,
          member_type: memberData.member_type,
          user_id: memberData.user_id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating association member:', error);
        throw error;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', data.user_id)
        .single();

      if (profileError) {
        console.warn(`Could not fetch profile for user ${data.user_id}:`, profileError);
      }

      toast.success(`Member updated successfully`);

      return {
        ...data,
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        email: profileData?.email || '',
        member_type: memberData.member_type || 'homeowner'
      } as AssociationMember;
    } catch (error) {
      console.error('Error in updateAssociationMember:', error);
      throw error;
    }
  },

  removeAssociationMember: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('association_member_roles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing association member:', error);
      throw error;
    }

    toast.success('Member removed successfully');
  }
};
