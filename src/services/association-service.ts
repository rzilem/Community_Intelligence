
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Association } from '@/types/association-types';

/**
 * Fetches all available associations with improved error handling
 */
export const fetchAllAssociations = async () => {
  console.log('Fetching all associations...');
  try {
    // Don't use any joins that might trigger RLS recursion
    const { data, error } = await supabase
      .from('associations')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching associations:', error);
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length || 0} associations`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchAllAssociations:', error);
    throw error;
  }
};

/**
 * Fetches details for a specific association by ID
 */
export const fetchAssociationById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('associations')
      .select(`*`)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching association with ID ${id}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error in fetchAssociationById for ID ${id}:`, error);
    return null;
  }
};

/**
 * Creates a new association with safer transaction handling and better error handling
 */
export const createAssociation = async (associationData: { 
  name: string, 
  address?: string, 
  contact_email?: string,
  city?: string,
  state?: string,
  zip?: string,
  phone?: string,
  property_type?: string,
  total_units?: number
}) => {
  try {
    console.log('Creating association with data:', associationData);
    
    // First, insert the new association
    const { data: newAssociation, error } = await supabase
      .from('associations')
      .insert(associationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating association:', error);
      throw error;
    }

    if (!newAssociation) {
      throw new Error('Association was created but no data was returned');
    }

    console.log('Association created successfully:', newAssociation);

    // Then, in a separate transaction using plain SQL to bypass RLS
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    console.log('Assigning user as admin for association:', newAssociation.id);
    
    // Use the security definer function we created earlier
    const { data: checkResult, error: checkError } = await supabase.rpc(
      'check_user_association',
      { association_uuid: newAssociation.id }
    );
    
    if (checkError) {
      console.error('Error checking user association:', checkError);
    }
    
    // Only insert if the user is not already associated
    if (!checkResult) {
      // Insert directly into association_users table
      const { error: roleError } = await supabase
        .from('association_users')
        .insert({
          association_id: newAssociation.id,
          user_id: user.id,
          role: 'admin'
        });

      if (roleError) {
        console.error('Error setting user as association admin:', roleError);
        // We don't throw here, we just warn the user
        toast.warning('Created association but failed to set you as admin');
      } else {
        console.log('User successfully assigned as admin');
      }
    } else {
      console.log('User is already associated with this association');
    }

    return newAssociation;
  } catch (error) {
    console.error('Error in createAssociation:', error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
};

/**
 * Updates an association's details
 */
export const updateAssociation = async (id: string, associationData: {
  name?: string,
  address?: string,
  contact_email?: string,
  city?: string,
  state?: string,
  zip?: string,
  phone?: string,
  website?: string,
  property_type?: string,
  total_units?: number,
  description?: string,
  is_archived?: boolean
}) => {
  try {
    const { data, error } = await supabase
      .from('associations')
      .update(associationData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating association with ID ${id}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error in updateAssociation for ID ${id}:`, error);
    return null;
  }
};

/**
 * Deletes an association
 */
export const deleteAssociation = async (id: string) => {
  try {
    const { error } = await supabase
      .from('associations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting association with ID ${id}:`, error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error in deleteAssociation for ID ${id}:`, error);
    return false;
  }
};
