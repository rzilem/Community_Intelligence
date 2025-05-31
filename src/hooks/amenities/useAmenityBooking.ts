
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AmenityBooking, BookingConflict } from '@/types/amenity-types';

export const useAmenityBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<AmenityBooking[]>([]);

  const checkBookingConflicts = useCallback(async (
    amenityId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<BookingConflict[]> => {
    try {
      console.log('Checking booking conflicts for:', { amenityId, date, startTime, endTime });
      
      // Check for overlapping bookings
      const { data: overlappingBookings, error } = await supabase
        .from('amenity_bookings')
        .select('*')
        .eq('amenity_id', amenityId)
        .eq('booking_date', date)
        .in('status', ['confirmed', 'pending'])
        .not('id', 'eq', excludeBookingId || '');

      if (error) {
        console.error('Error checking conflicts:', error);
        return [];
      }

      const conflicts: BookingConflict[] = [];
      
      overlappingBookings?.forEach(booking => {
        const bookingStart = new Date(`${date}T${booking.start_time}`);
        const bookingEnd = new Date(`${date}T${booking.end_time}`);
        const requestStart = new Date(`${date}T${startTime}`);
        const requestEnd = new Date(`${date}T${endTime}`);

        if (
          (requestStart < bookingEnd && requestEnd > bookingStart) ||
          (bookingStart < requestEnd && bookingEnd > requestStart)
        ) {
          conflicts.push({
            conflict_type: 'overlap',
            conflicting_booking_id: booking.id,
            message: `Overlaps with existing booking from ${booking.start_time} to ${booking.end_time}`,
            suggested_times: []
          });
        }
      });

      return conflicts;
    } catch (error) {
      console.error('Error in checkBookingConflicts:', error);
      return [];
    }
  }, []);

  const createBooking = useCallback(async (bookingData: Partial<AmenityBooking>) => {
    setIsLoading(true);
    try {
      // Check for conflicts first
      if (bookingData.amenity_id && bookingData.booking_date && bookingData.start_time && bookingData.end_time) {
        const conflicts = await checkBookingConflicts(
          bookingData.amenity_id,
          bookingData.booking_date,
          bookingData.start_time,
          bookingData.end_time
        );

        if (conflicts.length > 0) {
          toast.error('Booking conflict detected: ' + conflicts[0].message);
          return { success: false, conflicts };
        }
      }

      // Generate check-in code
      const checkInCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from('amenity_bookings')
        .insert([{
          ...bookingData,
          check_in_code: checkInCode,
          status: 'confirmed'
        }])
        .select('*')
        .single();

      if (error) throw error;

      toast.success('Booking created successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [checkBookingConflicts]);

  const fetchBookings = useCallback(async (amenityId?: string, date?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('amenity_bookings')
        .select(`
          *,
          amenity:amenities(*)
        `)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (amenityId) {
        query = query.eq('amenity_id', amenityId);
      }

      if (date) {
        query = query.eq('booking_date', date);
      }

      const { data, error } = await query;

      if (error) throw error;

      setBookings(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBooking = useCallback(async (id: string, updates: Partial<AmenityBooking>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('amenity_bookings')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      toast.success('Booking updated successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: string, reason?: string) => {
    return updateBooking(id, { 
      status: 'cancelled',
      special_requests: reason ? `Cancelled: ${reason}` : 'Cancelled by user'
    });
  }, [updateBooking]);

  return {
    isLoading,
    bookings,
    checkBookingConflicts,
    createBooking,
    fetchBookings,
    updateBooking,
    cancelBooking
  };
};
