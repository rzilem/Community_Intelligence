
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Association } from '@/types/association-types';

export const useAssociations = () => {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchAssociations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching associations...');
      const { data, error } = await supabase
        .rpc('get_user_associations');

      if (error) {
        console.error('Error fetching associations:', error);
        setError(error as Error);
        setAssociations([]); // Set empty array to prevent undefined errors
        return;
      }

      console.log('Raw associations data:', data);

      // Prevent setting state to undefined/null data
      if (!data) {
        console.warn('No associations data returned');
        setAssociations([]);
        return;
      }

      // Map data to Association shape and normalize is_archived to a boolean value
      const normalizedAssociations: Association[] = (data || []).map((row: any) => {
        // Explicitly convert is_archived to boolean
        const isArchived = row.is_archived === true || row.is_archived === 'true';
        
        return {
          id: row.id,
          name: row.name || 'Unnamed Association',
          address: row.address,
          city: row.city,
          state: row.state,
          zip: row.zip,
          contact_email: row.contact_email,
          created_at: row.created_at,
          updated_at: row.updated_at,
          is_archived: isArchived, // Normalized boolean value
          description: row.description,
          phone: row.phone,
          property_type: row.property_type,
          total_units: row.total_units,
          website: row.website,
          founded_date: row.founded_date,
          insurance_expiration: row.insurance_expiration,
          fire_inspection_due: row.fire_inspection_due,
          logo_url: row.logo_url,
          primary_color: row.primary_color,
          secondary_color: row.secondary_color,
          status: row.status || 'active',
          // include any other fields for stability/future safety
          ...row
        };
      });

      console.log('Normalized associations data:', normalizedAssociations);
      setAssociations(normalizedAssociations);
    } catch (error: any) {
      console.error('Error fetching associations:', error);
      setError(error);
      setAssociations([]); // Set empty array to prevent undefined errors
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      
      // Trigger a refresh rather than immediately calling fetchAssociations
      setRefreshTrigger(prev => prev + 1);
      
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
      console.log('Updating association with ID:', id);
      console.log('Update data:', updates);

      const { data, error } = await supabase
        .from('associations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('Updated association data:', data);
      
      // Update the local state directly without triggering a full refetch
      setAssociations(prev =>
        prev.map(assoc => assoc.id === id ? { ...assoc, ...data } : assoc)
      );
      
      return data;
    } catch (error: any) {
      console.error('Error updating association:', error);
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

      // Update the local state
      setAssociations(prev =>
        prev.map(assoc => assoc.id === id ? { ...assoc, is_archived: true } : assoc)
      );
      
      return true;
    } catch (error: any) {
      console.error('Error archiving association:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const manuallyRefresh = useCallback(() => {
    console.log('Manually refreshing associations...');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Initial load and refresh when triggered
  useEffect(() => {
    fetchAssociations();
  }, [fetchAssociations, refreshTrigger]);

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
