
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExternalMember } from '@/types/member-types';

export const externalMemberService = {
  createExternalUser: async (userData: ExternalMember, currentAssociationId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          role: userData.user_type
        }])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating external user profile:', profileError);
        throw profileError;
      }

      const { data: associationUserData, error: assocUserError } = await supabase
        .from('association_users')
        .insert([{
          user_id: profileData.id,
          association_id: currentAssociationId,
          role: userData.user_type
        }])
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
