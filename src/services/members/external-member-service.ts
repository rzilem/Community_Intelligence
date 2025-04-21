
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
      
      // The TypeScript error indicates that the profiles table expects an id
      // Let's use upsert instead of insert, which allows for server-side generation
      // of the id when it doesn't exist
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          role: userData.user_type
        }, { 
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
