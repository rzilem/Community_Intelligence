
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

/**
 * Fetches associations for the current user based on their role
 * Uses the security definer function to avoid RLS issues
 */
export const fetchUserAssociations = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_user_associations');

    if (error) {
      devLog.error('Error fetching user associations:', error);
      throw error;
    }

    // Format the data to match the expected structure
    const formattedData = data.map((association: any) => ({
      id: Math.random().toString(), // Random ID for the join
      role: 'member', // Default role
      associations: association
    }));

    return formattedData;
  } catch (error) {
    devLog.error('Error in fetchUserAssociations:', error);
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
    // Use the security definer function
    const { data, error } = await supabase.rpc('assign_user_to_association', {
      p_association_id: associationId,
      p_user_id: userId,
      p_role: role
    });

    if (error) {
      devLog.error('Error assigning user to association:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    devLog.error('Error in assignUserToAssociation:', error);
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
      devLog.error('Error updating user role:', error);
      throw error;
    }

    return data;
  } catch (error) {
    devLog.error('Error in updateUserRole:', error);
    return null;
  }
};
