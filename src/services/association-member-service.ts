
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AssociationMemberRole, ExternalMember } from '@/types/member-types';

// Using the imported types from member-types.ts
export interface AssociationMember {
  id: string;
  user_id: string;
  association_id: string;
  role_type: 'board' | 'committee';
  role_name: string;
  member_type?: 'homeowner' | 'developer' | 'builder';
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export const associationMemberService = {
  // Fetch board and committee members for an association
  getAssociationMembers: async (associationId: string) => {
    try {
      const { data, error } = await supabase
        .from('association_member_roles')
        .select('*')
        .eq('association_id', associationId)
        .order('role_type')
        .order('role_name');

      if (error) {
        console.error('Error fetching association members:', error);
        throw error;
      }

      // For each member, fetch their profile information
      const membersWithProfiles = await Promise.all(
        data.map(async (member: AssociationMemberRole) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', member.user_id)
            .single();

          if (profileError) {
            console.warn(`Could not fetch profile for user ${member.user_id}:`, profileError);
          }

          return {
            id: member.id,
            user_id: member.user_id,
            association_id: member.association_id,
            role_type: member.role_type,
            role_name: member.role_name,
            member_type: member.member_type || 'homeowner', // Added proper handling for member_type
            first_name: profileData?.first_name || '',
            last_name: profileData?.last_name || '',
            email: profileData?.email || '',
            created_at: member.created_at,
            updated_at: member.updated_at
          };
        })
      );

      return membersWithProfiles as AssociationMember[];
    } catch (error) {
      console.error('Error in getAssociationMembers:', error);
      throw error;
    }
  },

  // Add a new board or committee member
  addAssociationMember: async (memberData: {
    user_id: string;
    association_id: string;
    role_type: 'board' | 'committee';
    role_name: string;
    member_type?: 'homeowner' | 'developer' | 'builder';
  }) => {
    try {
      // First, insert the member role
      const { data, error } = await supabase
        .from('association_member_roles')
        .insert(memberData)
        .select()
        .single();

      if (error) {
        console.error('Error adding association member:', error);
        throw error;
      }

      // Then fetch the profile data for the user
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
        id: data.id,
        user_id: data.user_id,
        association_id: data.association_id,
        role_type: data.role_type,
        role_name: data.role_name,
        member_type: data.member_type || 'homeowner', // Handling optional field
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        email: profileData?.email || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      } as AssociationMember;
    } catch (error) {
      console.error('Error in addAssociationMember:', error);
      throw error;
    }
  },

  // Update an existing board or committee member
  updateAssociationMember: async (id: string, memberData: {
    role_type: 'board' | 'committee';
    role_name: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('association_member_roles')
        .update(memberData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating association member:', error);
        throw error;
      }

      // Fetch the profile data for the user
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
        id: data.id,
        user_id: data.user_id,
        association_id: data.association_id,
        role_type: data.role_type,
        role_name: data.role_name,
        member_type: data.member_type || 'homeowner', // Handling optional field
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        email: profileData?.email || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      } as AssociationMember;
    } catch (error) {
      console.error('Error in updateAssociationMember:', error);
      throw error;
    }
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
  },

  // Find user by email (for external users)
  findUserByEmail: async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found, return null
          return null;
        }
        console.error('Error finding user by email:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in findUserByEmail:', error);
      throw error;
    }
  },

  // Create an external user (developer/builder)
  createExternalUser: async (userData: ExternalMember, currentAssociationId: string) => {
    try {
      // First, create a new profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          role: userData.user_type // Use role field instead of user_type
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating external user profile:', profileError);
        throw profileError;
      }

      // Now add the user to the association
      const { data: associationUserData, error: assocUserError } = await supabase
        .from('association_users')
        .insert({
          user_id: profileData.id,
          association_id: currentAssociationId,
          role: userData.user_type
        })
        .select()
        .single();

      if (assocUserError) {
        console.error('Error adding user to association:', assocUserError);
        // Don't throw here, we'll still return the profile
      }

      return profileData;
    } catch (error) {
      console.error('Error in createExternalUser:', error);
      throw error;
    }
  }
};
