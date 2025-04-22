
import { useState } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { Amenity } from '@/types/amenity-types';
import { toast } from 'sonner';

export function useAmenities(associationId?: string) {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: amenities = [],
    isLoading,
    refetch
  } = useSupabaseQuery<Amenity[]>({
    tableName: 'amenities',
    select: '*',
    filters: associationId ? [{ column: 'association_id', value: associationId }] : [],
    orderBy: { column: 'name', ascending: true }
  },
  !!associationId
  );

  const createAmenity = async (amenity: Omit<Amenity, 'id' | 'created_at' | 'updated_at'>) => {
    if (!associationId) {
      toast.error('No association selected');
      return null;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('amenities')
        .insert({
          name: amenity.name,
          description: amenity.description,
          capacity: amenity.capacity,
          booking_fee: amenity.booking_fee,
          requires_approval: amenity.requires_approval,
          association_id: associationId
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Amenity created successfully');
      refetch();
      return data;
    } catch (error) {
      console.error('Error creating amenity:', error);
      toast.error('Failed to create amenity');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const updateAmenity = async (id: string, updates: Partial<Amenity>) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('amenities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Amenity updated successfully');
      refetch();
      return data;
    } catch (error) {
      console.error('Error updating amenity:', error);
      toast.error('Failed to update amenity');
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteAmenity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('amenities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Amenity deleted successfully');
      refetch();
      return true;
    } catch (error) {
      console.error('Error deleting amenity:', error);
      toast.error('Failed to delete amenity');
      return false;
    }
  };

  return {
    amenities,
    isLoading,
    isCreating,
    isUpdating,
    createAmenity,
    updateAmenity,
    deleteAmenity,
    refetchAmenities: refetch
  };
}
