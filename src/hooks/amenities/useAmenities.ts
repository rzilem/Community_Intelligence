import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Amenity {
  id: string;
  association_id: string;
  name: string;
  description?: string;
  capacity?: number;
  booking_fee?: number;
  requires_approval?: boolean;
  created_at: string;
  updated_at: string;
}

export const useAmenities = () => {
  const { toast } = useToast();
  const { currentAssociation } = useAuth();
  const queryClient = useQueryClient();

  const { data: amenities = [], isLoading } = useQuery({
    queryKey: ['amenities', currentAssociation?.id],
    queryFn: async () => {
      if (!currentAssociation?.id) return [];
      
      const { data, error } = await supabase
        .from('amenities')
        .select('*')
        .eq('association_id', currentAssociation.id)
        .order('name');
      
      if (error) throw error;
      return data as Amenity[];
    },
    enabled: !!currentAssociation?.id,
  });

  const createAmenity = useMutation({
    mutationFn: async (amenity: Omit<Amenity, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('amenities')
        .insert([amenity])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      toast({
        title: "Success",
        description: "Amenity created successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create amenity.",
        variant: "destructive"
      });
    }
  });

  const updateAmenity = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Amenity> & { id: string }) => {
      const { data, error } = await supabase
        .from('amenities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      toast({
        title: "Success",
        description: "Amenity updated successfully."
      });
    }
  });

  const deleteAmenity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('amenities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      toast({
        title: "Success",
        description: "Amenity deleted successfully."
      });
    }
  });

  return {
    amenities,
    isLoading,
    createAmenity,
    updateAmenity,
    deleteAmenity
  };
};