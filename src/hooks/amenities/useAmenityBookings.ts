
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAmenityBookings = (amenityId: string) => {
  const { data: upcoming = [], isLoading: loading } = useQuery({
    queryKey: ['amenity_bookings', amenityId],
    queryFn: async () => {
      if (!amenityId) return [];
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('calendar_events' as any)
        .select('id, title, start_time, end_time, location')
        .eq('amenity_id', amenityId)
        .gte('start_time', nowIso)
        .order('start_time', { ascending: true })
        .limit(5);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!amenityId,
  });

  return { upcoming, loading };
};
