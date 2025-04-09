import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Association } from '@/types/association-types';

/**
 * Fetches all available associations with improved error handling
 */
export const fetchAllAssociations = async () => {
  console.log('Fetching all associations...');
  try {
    // Use the security definer function to avoid RLS recursion
    const { data, error } = await supabase
      .rpc('get_associations');

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
    
    // Use the security definer function that handles both association creation
    // and user assignment in one atomic operation
    const { data: associationId, error } = await supabase.rpc(
      'create_association_with_admin',
      {
        p_name: associationData.name,
        p_address: associationData.address,
        p_contact_email: associationData.contact_email,
        p_city: associationData.city,
        p_state: associationData.state,
        p_zip: associationData.zip,
        p_phone: associationData.phone,
        p_property_type: associationData.property_type,
        p_total_units: associationData.total_units
      }
    );

    if (error) {
      console.error('Error creating association:', error);
      throw error;
    }

    if (!associationId) {
      throw new Error('Association was created but no ID was returned');
    }

    console.log('Association created successfully with ID:', associationId);
    
    // Fetch the newly created association to return complete data
    const { data: newAssociation, error: fetchError } = await supabase
      .from('associations')
      .select('*')
      .eq('id', associationId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching new association:', fetchError);
      // We don't throw here since the association was created successfully
      toast.warning('Association created but failed to retrieve details');
      
      // Return partial data with at least the ID and name
      return { 
        id: associationId,
        name: associationData.name,
        ...associationData 
      };
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
