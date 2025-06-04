
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Association {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contact_email?: string;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
}

export const useAssociations = () => {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAssociations = async () => {
    try {
      setIsLoading(true);
      
      // Using the provided function to get user's associations
      const { data, error } = await supabase
        .rpc('get_user_associations');

      if (error) throw error;
      
      setAssociations(data || []);
    } catch (error: any) {
      console.error('Error fetching associations:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

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
      
      toast.success('Association created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating association:', error);
      toast.error(`Failed to create association: ${error.message}`);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateAssociation = async (id: string, updates: Partial<Association>) => {
    try {
      setIsUpdating(true);
      
      const { data, error } = await supabase
        .from('associations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setAssociations(prev => 
        prev.map(assoc => assoc.id === id ? { ...assoc, ...data } : assoc)
      );
      
      toast.success('Association updated successfully');
      return data;
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

      const { error } = await supabase
        .from('associations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAssociations(prev => prev.filter(assoc => assoc.id !== id));

      toast.success('Association deleted successfully');
    } catch (error: any) {
      console.error('Error deleting association:', error);
      toast.error(`Failed to delete association: ${error.message}`);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const manuallyRefresh = () => {
    fetchAssociations();
  };

  useEffect(() => {
    fetchAssociations();
  }, []);

  return { 
    associations, 
    isLoading, 
    error, 
    fetchAssociations,
    createAssociation,
    updateAssociation,
    deleteAssociation,
    isCreating,
    isUpdating,
    isDeleting,
    manuallyRefresh
  };
};
