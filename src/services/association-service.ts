import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Association } from '@/types/association-types';

/**
 * Fetches all available associations with improved error handling
 */
export const fetchAllAssociations = async () => {
  console.log('Fetching all associations...');
  try {
    let data;
    
    // Attempt to fetch with primary method
    try {
      const { data: associations, error } = await supabase
        .from('associations')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error in primary fetch method:', error);
        throw error;
      }
      
      console.log(`Primary fetch successful, got ${associations?.length || 0} associations`);
      data = associations;
    } catch (primaryError) {
      console.error('Primary fetch method failed:', primaryError);
      
      // Fallback method - try fetching with simpler query
      try {
        console.log('Attempting fallback fetch method...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('associations')
          .select('id, name, address, contact_email, city, state, property_type, is_archived')
          .order('name');
        
        if (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
          throw fallbackError;
        }
        
        data = fallbackData;
        console.log('Fallback fetch succeeded with', data?.length || 0, 'records');
      } catch (fallbackFetchError) {
        console.error('All fetch methods failed:', fallbackFetchError);
        throw new Error('Unable to fetch associations after multiple attempts');
      }
    }

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
      .select(`
        *,
        properties:properties(count),
        residents:residents(count)
      `)
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
 * Creates a new association
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
    // First, get the current user's ID
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('Error getting current user:', userError);
      throw userError || new Error('No authenticated user found');
    }
    
    const userId = userData.user.id;
    
    // Create the association
    const { data, error } = await supabase
      .from('associations')
      .insert(associationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating association:', error);
      toast.error(`Failed to create association: ${error.message}`);
      throw error;
    }

    // If creation was successful, also add the current user as an admin
    try {
      const { error: roleError } = await supabase
        .from('association_users')
        .insert({
          association_id: data.id,
          user_id: userId,
          role: 'admin'
        });

      if (roleError) {
        console.error('Error setting user as association admin:', roleError);
        toast.warning('Created association but failed to set you as admin');
      } else {
        toast.success('Association created successfully and you were set as admin');
      }
    } catch (roleAssignError) {
      console.error('Exception assigning role:', roleAssignError);
      toast.warning('Created association but encountered an error setting permissions');
    }

    return data;
  } catch (error) {
    console.error('Error in createAssociation:', error);
    return null;
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
