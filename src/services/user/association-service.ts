
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches associations for the current user based on their role
 */
export const fetchUserAssociations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('association_users')
      .select(`
        id,
        role,
        associations:association_id (
          id,
          name,
          address,
          contact_email
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user associations:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchUserAssociations:', error);
    return [];
  }
};

/**
 * Assigns a user to an association with a specified role
 */
export const assignUserToAssociation = async (
  userId: string, 
  associationId: string, 
  role: 'admin' | 'manager' | 'member' = 'member'
) => {
  try {
    const { data, error } = await supabase
      .from('association_users')
      .insert({
        user_id: userId,
        association_id: associationId,
        role
      })
      .select()
      .single();

    if (error) {
      console.error('Error assigning user to association:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in assignUserToAssociation:', error);
    return null;
  }
};

/**
 * Updates a user's role in an association
 */
export const updateUserRole = async (
  userId: string,
  associationId: string,
  role: 'admin' | 'manager' | 'member'
) => {
  try {
    const { data, error } = await supabase
      .from('association_users')
      .update({ role })
      .match({ user_id: userId, association_id: associationId })
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return null;
  }
};
