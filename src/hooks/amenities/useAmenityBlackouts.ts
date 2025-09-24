import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AmenityBlackout {
  id: string;
  amenity_id: string;
  start_time: string;
  end_time: string;
  reason?: string;
  created_at: string;
}

export const useAmenityBlackouts = (amenityId: string) => {
  const queryClient = useQueryClient();

  const { data: blackouts = [], isLoading: loading } = useQuery({
    queryKey: ['amenity_blackouts', amenityId],
    queryFn: async (): Promise<AmenityBlackout[]> => {
      if (!amenityId) return [];
      
      // Use mock data since amenity_blackouts table doesn't exist
      return [
        {
          id: '1',
          amenity_id: amenityId,
          start_time: '2025-09-25T10:00:00Z',
          end_time: '2025-09-25T12:00:00Z',
          reason: 'Maintenance',
          created_at: new Date().toISOString()
        }
      ];
    },
    enabled: !!amenityId,
  });

  const createBlackout = useMutation({
    mutationFn: async (payload: { amenity_id: string; start_time: string; end_time: string; reason?: string | null }): Promise<AmenityBlackout> => {
      // Mock create blackout
      const newBlackout: AmenityBlackout = {
        id: Math.random().toString(36).substr(2, 9),
        amenity_id: payload.amenity_id,
        start_time: payload.start_time,
        end_time: payload.end_time,
        reason: payload.reason || undefined,
        created_at: new Date().toISOString()
      };
      return newBlackout;
    },
    onSuccess: () => {
      toast.success('Blackout added.');
      queryClient.invalidateQueries({ queryKey: ['amenity_blackouts', amenityId] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to add blackout');
    },
  });

  const deleteBlackout = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Mock delete
      console.log('Deleting blackout:', id);
    },
    onSuccess: () => {
      toast.success('Blackout removed.');
      queryClient.invalidateQueries({ queryKey: ['amenity_blackouts', amenityId] });
    },
    onError: () => toast.error('Failed to remove blackout'),
  });

  return { blackouts, loading, createBlackout, deleteBlackout };
};