
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AmenityBooking, BookingConflict } from '@/types/amenity-types';

// Mock data for demonstration until amenity_bookings table is created
const mockBookings: AmenityBooking[] = [
  {
    id: '1',
    amenity_id: 'pool-1',
    property_id: 'prop-1',
    resident_id: 'res-1',
    booking_date: '2024-01-15',
    start_time: '10:00',
    end_time: '12:00',
    status: 'confirmed',
    guests_count: 4,
    special_requests: 'Pool party setup',
    total_fee: 50,
    payment_status: 'paid',
    check_in_code: 'ABC123',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z'
  }
];

export const useAmenityBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<AmenityBooking[]>(mockBookings);

  const checkBookingConflicts = useCallback(async (
    amenityId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<BookingConflict[]> => {
    try {
      console.log('Checking booking conflicts for:', { amenityId, date, startTime, endTime });
      
      // Check for overlapping bookings in mock data
      const conflicts: BookingConflict[] = [];
      
      const overlappingBookings = mockBookings.filter(booking => 
        booking.amenity_id === amenityId &&
        booking.booking_date === date &&
        booking.status !== 'cancelled' &&
        booking.id !== excludeBookingId
      );

      overlappingBookings.forEach(booking => {
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

      const newBooking: AmenityBooking = {
        id: Date.now().toString(),
        amenity_id: bookingData.amenity_id || '',
        property_id: bookingData.property_id || '',
        resident_id: bookingData.resident_id,
        booking_date: bookingData.booking_date || '',
        start_time: bookingData.start_time || '',
        end_time: bookingData.end_time || '',
        status: 'confirmed',
        guests_count: bookingData.guests_count,
        special_requests: bookingData.special_requests,
        total_fee: bookingData.total_fee,
        payment_status: 'pending',
        check_in_code: checkInCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to mock data
      setBookings(prev => [...prev, newBooking]);

      toast.success('Booking created successfully!');
      return { success: true, data: newBooking };
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
      let filteredBookings = mockBookings;

      if (amenityId) {
        filteredBookings = filteredBookings.filter(b => b.amenity_id === amenityId);
      }

      if (date) {
        filteredBookings = filteredBookings.filter(b => b.booking_date === date);
      }

      setBookings(filteredBookings);
      return filteredBookings;
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
      const updatedBooking = mockBookings.find(b => b.id === id);
      if (updatedBooking) {
        Object.assign(updatedBooking, updates);
        setBookings([...mockBookings]);
      }

      toast.success('Booking updated successfully!');
      return { success: true, data: updatedBooking };
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
