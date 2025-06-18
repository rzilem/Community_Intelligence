
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Association } from '@/types/association-types';
import { devLog } from '@/utils/dev-logger';

/**
 * Fetches all available associations with improved error handling
 * Uses security definer function to avoid RLS issues
 */
export const fetchAllAssociations = async () => {
  devLog.info('Fetching all associations...');
  try {
    // Use the security definer function to get associations
    const { data, error } = await supabase
      .rpc('get_user_associations');

    if (error) {
      devLog.error('Error fetching associations:', error);
      throw error;
    }
    
    devLog.info(`Successfully fetched ${data?.length || 0} associations`);
    return data || [];
  } catch (error) {
    devLog.error('Error in fetchAllAssociations:', error);
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
      devLog.error(`Error fetching association with ID ${id}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    devLog.error(`Error in fetchAssociationById for ID ${id}:`, error);
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
    devLog.info('Creating association with data:', associationData);
    
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
      devLog.error('Error creating association:', error);
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
      devLog.error('Error fetching newly created association:', fetchError);
      throw fetchError;
    }

    toast.success(`Association "${newAssociation.name}" created successfully`);
    return newAssociation;
  } catch (error) {
    devLog.error('Error in createAssociation:', error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
};

/**
 * Updates an association's details
 */
export const updateAssociation = async (id: string, updates: Record<string, any>) => {
  try {
    const { data, error } = await supabase
      .from('associations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      devLog.error(`Error updating association with ID ${id}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    devLog.error(`Error in updateAssociation for ID ${id}:`, error);
    return null;
  }
};

/**
 * Simple dependency check with explicit types
 */
const checkDependencies = async (associationId: string) => {
  devLog.info('Checking dependencies for association:', associationId);
  
  // Initialize with explicit boolean types
  let hasProperties: boolean = false;
  let hasResidents: boolean = false;
  let hasAssessments: boolean = false;
  let hasInvoices: boolean = false;

  try {
    // Check properties
    const { data: properties } = await (supabase as any)
      .from('properties')
      .select('id')
      .eq('association_id', associationId)
      .limit(1);
    hasProperties = Array.isArray(properties) && properties.length > 0;

    // Check residents
    const { data: residents } = await (supabase as any)
      .from('residents')
      .select('id')
      .eq('association_id', associationId)
      .limit(1);
    hasResidents = Array.isArray(residents) && residents.length > 0;

    // Check assessments by getting properties first, then checking assessments
    const { data: propertyIds } = await (supabase as any)
      .from('properties')
      .select('id')
      .eq('association_id', associationId);
    
    if (propertyIds && propertyIds.length > 0) {
      // Extract property IDs into a separate variable with explicit typing
      const propertyIdList: string[] = propertyIds.map(p => p.id);
      
      const { data: assessments } = await (supabase as any)
        .from('assessments')
        .select('id')
        .in('property_id', propertyIdList)
        .limit(1);
      hasAssessments = Array.isArray(assessments) && assessments.length > 0;
    }

    // Check invoices
    const { data: invoices } = await (supabase as any)
      .from('invoices')
      .select('id')
      .eq('association_id', associationId)
      .limit(1);
    hasInvoices = Array.isArray(invoices) && invoices.length > 0;

    devLog.debug('Dependency check results:', {
      hasProperties,
      hasResidents,
      hasAssessments,
      hasInvoices
    });

    return { hasProperties, hasResidents, hasAssessments, hasInvoices };
  } catch (error) {
    devLog.error('Error in checkDependencies:', error);
    return { 
      hasProperties: false, 
      hasResidents: false, 
      hasAssessments: false, 
      hasInvoices: false 
    };
  }
};

/**
 * Deletes an association with proper dependency checking and error handling
 */
export const deleteAssociation = async (id: string) => {
  try {
    devLog.info('Starting association deletion process for ID:', id);
    
    // Check for dependent records that would prevent deletion
    const { hasProperties, hasResidents, hasAssessments, hasInvoices } = await checkDependencies(id);

    if (hasProperties || hasResidents || hasAssessments || hasInvoices) {
      const dependencyTypes = [];
      if (hasProperties) dependencyTypes.push('properties');
      if (hasResidents) dependencyTypes.push('residents');
      if (hasAssessments) dependencyTypes.push('assessments');
      if (hasInvoices) dependencyTypes.push('invoices');
      
      const errorMessage = `Cannot delete association with existing ${dependencyTypes.join(', ')}. Please remove these records first.`;
      devLog.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Delete association user relationships first
    const { error: userError } = await (supabase as any)
      .from('association_users')
      .delete()
      .eq('association_id', id);

    if (userError) {
      devLog.warn('Error deleting association user relationships:', userError);
      // Continue with deletion even if this fails
    }

    // Now delete the association
    const { error } = await (supabase as any)
      .from('associations')
      .delete()
      .eq('id', id);

    if (error) {
      devLog.error(`Error deleting association with ID ${id}:`, error);
      throw error;
    }

    devLog.info('Association deleted successfully:', id);
    toast.success('Association deleted successfully');
    return true;
  } catch (error) {
    devLog.error(`Error in deleteAssociation for ID ${id}:`, error);
    throw error; // Re-throw to let the caller handle it
  }
};
