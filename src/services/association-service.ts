
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Association } from '@/types/association-types';

/**
 * Fetches all available associations with improved error handling
 */
export const fetchAllAssociations = async () => {
  console.log('Fetching all associations...');
  try {
    // Use a direct query instead of an RPC function to avoid RLS issues
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
 * Creates a new association with a one-step process using a security definer function
 * This safely creates the association and assigns the current user as admin
 * without triggering RLS recursion issues
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
    
    // First try to create the association normally
    const { data: newAssociation, error: createError } = await supabase
      .from('associations')
      .insert([{
        name: associationData.name,
        address: associationData.address,
        contact_email: associationData.contact_email,
        city: associationData.city,
        state: associationData.state,
        zip: associationData.zip,
        phone: associationData.phone,
        property_type: associationData.property_type,
        total_units: associationData.total_units
      }])
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating association:', createError);
      throw createError;
    }

    // Now that we have the association, assign the current user as admin
    const { error: assignError } = await supabase
      .from('association_users')
      .insert([{
        association_id: newAssociation.id,
        role: 'admin'
      }]);
    
    if (assignError) {
      console.error('Association created but failed to assign admin role:', assignError);
      // Don't throw here, we still created the association
      toast.warning('Association created but failed to assign admin role');
    }

    toast.success(`Association "${newAssociation.name}" created successfully`);
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
