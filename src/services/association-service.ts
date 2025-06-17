
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Association } from '@/types/association-types';

/**
 * Fetches all available associations with improved error handling
 * Uses security definer function to avoid RLS issues
 */
export const fetchAllAssociations = async () => {
  console.log('Fetching all associations...');
  try {
    // Use the security definer function to get associations
    const { data, error } = await supabase
      .rpc('get_user_associations');

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
    
    // Call the updated security definer function that handles both creating the association
    // and assigning the current user as admin in one operation
    const { data, error } = await supabase
      .rpc('create_association_with_admin', {
        p_name: associationData.name,
        p_address: associationData.address,
        p_contact_email: associationData.contact_email,
        p_city: associationData.city,
        p_state: associationData.state,
        p_zip: associationData.zip,
        p_phone: associationData.phone,
        p_property_type: associationData.property_type,
        p_total_units: associationData.total_units
      });
    
    if (error) {
      console.error('Error creating association:', error);
      toast.error(`Failed to create association: ${error.message}`);
      throw error;
    }

    // Get the newly created association
    const { data: newAssociation, error: fetchError } = await supabase
      .from('associations')
      .select('*')
      .eq('id', data)
      .single();

    if (fetchError) {
      console.error('Error fetching newly created association:', fetchError);
      throw fetchError;
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
 * Deletes an association with proper dependency checking and error handling
 */
export const deleteAssociation = async (id: string) => {
  try {
    console.log('Starting association deletion process for ID:', id);
    
    // Check for dependent records that would prevent deletion
    const dependencies = await Promise.all([
      supabase.from('properties').select('id').eq('association_id', id).limit(1),
      supabase.from('residents').select('id').eq('association_id', id).limit(1),
      supabase.from('assessments').select('id').eq('association_id', id).limit(1),
      supabase.from('invoices').select('id').eq('association_id', id).limit(1)
    ]);

    const hasProperties = dependencies[0].data && dependencies[0].data.length > 0;
    const hasResidents = dependencies[1].data && dependencies[1].data.length > 0;
    const hasAssessments = dependencies[2].data && dependencies[2].data.length > 0;
    const hasInvoices = dependencies[3].data && dependencies[3].data.length > 0;

    if (hasProperties || hasResidents || hasAssessments || hasInvoices) {
      const dependencyTypes = [];
      if (hasProperties) dependencyTypes.push('properties');
      if (hasResidents) dependencyTypes.push('residents');
      if (hasAssessments) dependencyTypes.push('assessments');
      if (hasInvoices) dependencyTypes.push('invoices');
      
      throw new Error(`Cannot delete association with existing ${dependencyTypes.join(', ')}. Please remove these records first.`);
    }

    // Delete association user relationships first
    const { error: userError } = await supabase
      .from('association_users')
      .delete()
      .eq('association_id', id);

    if (userError) {
      console.warn('Error deleting association user relationships:', userError);
      // Continue with deletion even if this fails
    }

    // Now delete the association
    const { error } = await supabase
      .from('associations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting association with ID ${id}:`, error);
      throw error;
    }

    console.log('Association deleted successfully:', id);
    return true;
  } catch (error) {
    console.error(`Error in deleteAssociation for ID ${id}:`, error);
    throw error; // Re-throw to let the caller handle it
  }
};
