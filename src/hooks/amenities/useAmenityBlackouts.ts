
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAmenityBlackouts = (amenityId: string) => {
  const queryClient = useQueryClient();

  const { data: blackouts = [], isLoading: loading } = useQuery({
    queryKey: ['amenity_blackouts', amenityId],
    queryFn: async () => {
      if (!amenityId) return [];
      const { data, error } = await supabase
        .from('amenity_blackouts')
        .select('*')
        .eq('amenity_id', amenityId)
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!amenityId,
  });

  const createBlackout = useMutation({
    mutationFn: async (payload: { amenity_id: string; start_time: string; end_time: string; reason?: string | null }) => {
      const { data, error } = await supabase
        .from('amenity_blackouts')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
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
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('amenity_blackouts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Blackout removed.');
      queryClient.invalidateQueries({ queryKey: ['amenity_blackouts', amenityId] });
    },
    onError: () => toast.error('Failed to remove blackout'),
  });

  return { blackouts, loading, createBlackout, deleteBlackout };
};
