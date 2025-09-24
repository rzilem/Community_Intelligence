import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
    queryFn: async (): Promise<Amenity[]> => {
      if (!currentAssociation?.id) return [];
      
      // Use mock data for now since amenities table structure doesn't match calendar_events
      return [
        {
          id: '1',
          association_id: currentAssociation.id,
          name: 'Swimming Pool',
          description: 'Olympic size swimming pool',
          capacity: 50,
          booking_fee: 0,
          requires_approval: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          association_id: currentAssociation.id,
          name: 'Tennis Court',
          description: 'Professional tennis court',
          capacity: 4,
          booking_fee: 25,
          requires_approval: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    },
    enabled: !!currentAssociation?.id,
  });

  const createAmenity = useMutation({
    mutationFn: async (amenity: Omit<Amenity, 'id' | 'created_at' | 'updated_at'>): Promise<Amenity> => {
      // Mock create - in real implementation, would use proper amenities table
      const newAmenity: Amenity = {
        ...amenity,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newAmenity;
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
    mutationFn: async ({ id, ...updates }: Partial<Amenity> & { id: string }): Promise<Amenity> => {
      // Mock update
      const updatedAmenity: Amenity = {
        id,
        association_id: currentAssociation?.id || '',
        name: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates
      };
      return updatedAmenity;
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
    mutationFn: async (id: string): Promise<void> => {
      // Mock delete
      console.log('Deleting amenity:', id);
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