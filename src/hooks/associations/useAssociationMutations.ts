
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Association } from '@/types/association-types';

export const useAssociationMutations = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createAssociation = async (association: Omit<Association, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsCreating(true);
      
      const { data, error } = await supabase
        .rpc('create_association_with_admin', {
          p_name: association.name,
          p_address: association.address,
          p_contact_email: association.contact_email,
          p_city: association.city,
          p_state: association.state,
          p_zip: association.zip
        });

      if (error) throw error;
      
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
      
      // Instead of actually deleting, we'll set is_archived to true
      const { error } = await supabase
        .from('associations')
        .update({ is_archived: true })
        .eq('id', id);

      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error archiving association:', error);
      toast.error(`Failed to archive association: ${error.message}`);
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
      
      // We'll update each association to is_archived=true one by one
      const promises = ids.map(id => 
        supabase
          .from('associations')
          .update({ is_archived: true })
          .eq('id', id)
      );
      
      const results = await Promise.all(promises);
      
      // Check if any errors occurred
      const errors = results.filter(result => result.error).map(result => result.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to archive ${errors.length} associations`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error archiving associations:', error);
      toast.error(`Failed to archive associations: ${error.message}`);
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
