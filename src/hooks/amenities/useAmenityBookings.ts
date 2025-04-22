
import { useState } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar-types';
import { toast } from 'sonner';

export function useAmenityBookings(hoaId?: string, amenityId?: string) {
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const {
    data: bookings = [],
    isLoading,
    refetch
  } = useSupabaseQuery<CalendarEvent[]>({
    tableName: 'calendar_events',
    select: '*',
    filters: [
      { column: 'event_type', value: 'amenity_booking' },
      ...(hoaId ? [{ column: 'hoa_id', value: hoaId }] : []),
      ...(amenityId ? [{ column: 'amenity_id', value: amenityId }] : [])
    ],
    orderBy: { column: 'start_time', ascending: true }
  },
  !!hoaId
  );

  const createBooking = async (booking: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'event_type'>) => {
    if (!hoaId) {
      toast.error('No association selected');
      return null;
    }

    if (!booking.amenity_id) {
      toast.error('Amenity is required');
      return null;
    }

    setIsBooking(true);
    try {
      // Check for booking conflicts
      const { data: conflicts, error: conflictError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('amenity_id', booking.amenity_id)
        .eq('event_type', 'amenity_booking')
        .or(`start_time.lte.${booking.end_time},end_time.gte.${booking.start_time}`);
      
      if (conflictError) throw conflictError;
      
      if (conflicts && conflicts.length > 0) {
        toast.error('This time slot conflicts with an existing booking');
        return null;
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: booking.title,
          description: booking.description,
          start_time: booking.start_time,
          end_time: booking.end_time,
          amenity_id: booking.amenity_id,
          location: booking.location,
          visibility: booking.visibility || 'private',
          hoa_id: hoaId,
          booked_by: (await supabase.auth.getUser()).data.user?.id,
          event_type: 'amenity_booking'
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Booking created successfully');
      refetch();
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
      return null;
    } finally {
      setIsBooking(false);
    }
  };

  const cancelBooking = async (id: string) => {
    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Booking cancelled successfully');
      refetch();
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
      return false;
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    bookings,
    isLoading,
    isBooking,
    isCancelling,
    createBooking,
    cancelBooking,
    refetchBookings: refetch
  };
}
