import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Association } from '@/types/association-types';
import { mockRPCCall } from '../supabase/supabase-utils';

export const useAssociationMutations = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createAssociation = async (association: Omit<Association, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsCreating(true);
      
      // Use mock RPC call since function doesn't exist
      const data = await mockRPCCall('create_association_with_admin', {
        p_name: association.name,
        p_address: association.address,
        p_contact_email: association.contact_email,
        p_city: association.city,
        p_state: association.state,
        p_zip: association.zip
      });

      return data;
    } catch (error: any) {
      console.error('Error creating association:', error);
      toast.error(`Failed to create association: ${error.message}`);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateAssociation = async ({ id, data }: { id: string, data: Partial<Association> }) => {
    try {
      setIsUpdating(true);
      
      const { data: updatedData, error } = await supabase
        .from('associations')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return updatedData;
    } catch (error: any) {
      console.error('Error updating association:', error);
      toast.error(`Failed to update association: ${error.message}`);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteAssociation = async (id: string) => {
    try {
      setIsDeleting(true);
      console.log('Starting deletion process for association:', id);

      // First check if the association has any dependent records
      const { data: dependentChecks } = await supabase
        .from('properties')
        .select('id')
        .eq('association_id', id)
        .limit(1);

      if (dependentChecks && dependentChecks.length > 0) {
        throw new Error('Cannot delete association with existing properties. Please remove all properties first.');
      }

      // Skip association_users check since table doesn't exist
      
      // Proceed with deletion
      const { error } = await supabase
        .from('associations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete operation failed:', error);
        throw error;
      }

      console.log('Association deleted successfully:', id);
      toast.success('Association deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting association:', error);
      toast.error(`Failed to delete association: ${error.message}`);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const bulkUpdateAssociations = async (ids: string[], updates: Partial<Association>) => {
    try {
      setIsUpdating(true);
      
      // We'll update each association one by one
      const promises = ids.map(id => 
        supabase
          .from('associations')
          .update(updates)
          .eq('id', id)
      );
      
      const results = await Promise.all(promises);
      
      // Check if any errors occurred
      const errors = results.filter(result => result.error).map(result => result.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} associations`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating associations:', error);
      toast.error(`Failed to update associations: ${error.message}`);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const bulkDeleteAssociations = async (ids: string[]) => {
    try {
      setIsDeleting(true);

      const promises = ids.map(id =>
        supabase
          .from('associations')
          .delete()
          .eq('id', id)
      );
      
      const results = await Promise.all(promises);
      
      // Check if any errors occurred
      const errors = results.filter(result => result.error).map(result => result.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to delete ${errors.length} associations`);
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting associations:', error);
      toast.error(`Failed to delete associations: ${error.message}`);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    createAssociation,
    isCreating,
    updateAssociation,
    isUpdating,
    deleteAssociation,
    isDeleting,
    bulkUpdateAssociations,
    bulkDeleteAssociations
  };
};