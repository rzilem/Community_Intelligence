
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { OwnerFormValues } from '../schemas/ownerFormSchema';

export const usePropertyAssociations = (form: UseFormReturn<OwnerFormValues>) => {
  const [associations, setAssociations] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Get the selected association ID
  const selectedAssociationId = form.watch('association_id');

  // Fetch associations
  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        // Get associations the current user has access to
        const { data, error } = await supabase
          .rpc('get_user_associations');

        if (error) throw error;
        setAssociations(data || []);
        
        // If there's only one association, preselect it
        if (data && data.length === 1) {
          form.setValue('association_id', data[0].id);
        }
      } catch (error) {
        console.error('Error fetching associations:', error);
        toast.error('Failed to load associations');
      }
    };

    fetchAssociations();
  }, [form]);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*');

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter properties based on selected association
  useEffect(() => {
    if (selectedAssociationId && properties.length > 0) {
      const filtered = properties.filter(
        property => property.association_id === selectedAssociationId
      );
      setFilteredProperties(filtered);
      
      // Reset property selection if it's not in the filtered list
      const currentPropertyId = form.getValues('property_id');
      if (currentPropertyId && !filtered.some(p => p.id === currentPropertyId)) {
        form.setValue('property_id', '');
      }
    } else {
      setFilteredProperties([]);
      form.setValue('property_id', '');
    }
  }, [selectedAssociationId, properties, form]);

  return {
    associations,
    properties,
    filteredProperties,
    loading
  };
};
