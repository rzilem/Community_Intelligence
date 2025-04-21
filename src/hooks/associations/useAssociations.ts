
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
  description?: string;
  phone?: string;
  property_type?: string;
  total_units?: number;
  website?: string;
  founded_date?: string;
  insurance_expiration?: string;
  fire_inspection_due?: string;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  status?: 'active' | 'inactive' | 'pending';
  [key: string]: any;
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

      const { data, error } = await supabase
        .rpc('get_user_associations');

      if (error) throw error;

      // Map data to Association shape and include all relevant properties
      setAssociations(
        (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          address: row.address,
          city: row.city,
          state: row.state,
          zip: row.zip,
          contact_email: row.contact_email,
          created_at: row.created_at,
          updated_at: row.updated_at,
          is_archived: row.is_archived,
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
          status: row.status,
          // include any other fields for stability/future safety
          ...row
        }))
      );
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

      // Instead of actually deleting, we'll set is_archived to true
      const { error } = await supabase
        .from('associations')
        .update({ is_archived: true })
        .eq('id', id);

      if (error) throw error;

      setAssociations(prev =>
        prev.map(assoc => assoc.id === id ? { ...assoc, is_archived: true } : assoc)
      );

      toast.success('Association archived successfully');
    } catch (error: any) {
      console.error('Error archiving association:', error);
      toast.error(`Failed to archive association: ${error.message}`);
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
