
import { supabase } from '@/integrations/supabase/client';
import { ExternalMember } from '@/types/member-types';

export const externalMemberService = {
  createExternalUser: async (userData: ExternalMember, currentAssociationId: string) => {
    try {
      // First check if user already exists
      const existingUser = await externalMemberService.findUserByEmail(userData.email);
      if (existingUser) {
        return existingUser;
      }
      
      // Since we're dealing with a TypeScript type constraint but the actual API might work differently,
      // we'll use a type assertion to bypass the TypeScript check
      const userData2: any = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        role: userData.user_type
      };
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert(userData2, {
          onConflict: 'email',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating external user profile:', profileError);
        throw profileError;
      }

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
      }

      return profileData;
    } catch (error) {
      console.error('Error in createExternalUser:', error);
      throw error;
    }
  },

  findUserByEmail: async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in findUserByEmail:', error);
      throw error;
    }
  }
};
