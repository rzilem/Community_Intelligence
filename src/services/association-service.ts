
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Fetches all available associations
 */
export const fetchAllAssociations = async () => {
  try {
    const { data, error } = await supabase
      .from('associations')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching associations:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchAllAssociations:', error);
    return [];
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
      throw error;
    }

    // If creation was successful, also add the current user as an admin
    const { error: roleError } = await supabase
      .from('association_users')
      .insert({
        association_id: data.id,
        user_id: userId,
        role: 'admin'
      });

    if (roleError) {
      console.error('Error setting user as association admin:', roleError);
      // We don't throw here to avoid blocking the association creation
      toast.error('Created association but failed to set you as admin');
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
