import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  event_type: string;
  association_id: string;
  created_by?: string;
  max_attendees?: number;
  current_attendees: number;
  requires_rsvp?: boolean;
  rsvp_deadline?: string;
  event_status: string;
  tags?: string[];
}

export interface AmenityBooking {
  id: string;
  amenity_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  guests_count?: number;
  amenities?: {
    name: string;
    association_id: string;
  };
}

export const useCalendarData = (associationId?: string) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [bookings, setBookings] = useState<AmenityBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, [associationId]);

  const fetchCalendarData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch events
      let eventsQuery = supabase
        .from('events')
        .select('*');

      if (associationId) {
        eventsQuery = eventsQuery.eq('association_id', associationId);
      }

      const { data: eventsData, error: eventsError } = await eventsQuery
        .order('start_date', { ascending: true });

      if (eventsError) throw eventsError;

      setEvents(eventsData || []);

      // Fetch amenity bookings
      let bookingsQuery = supabase
        .from('amenity_bookings')
        .select(`
          *,
          amenities!inner(
            name,
            association_id
          )
        `);

      if (associationId) {
        bookingsQuery = bookingsQuery.eq('amenities.association_id', associationId);
      }

      const { data: bookingsData, error: bookingsError } = await bookingsQuery
        .order('booking_date', { ascending: true });

      if (bookingsError) throw bookingsError;

      setBookings(bookingsData || []);

    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError('Failed to load calendar data');
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'current_attendees'>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          current_attendees: 0
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEvents(prev => [...prev, data]);
        return data;
      }
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEvents(prev => prev.map(event => 
          event.id === id ? data : event
        ));
        return data;
      }
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
  };

  const createBooking = async (bookingData: Omit<AmenityBooking, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('amenity_bookings')
        .insert([bookingData])
        .select(`
          *,
          amenities!inner(
            name,
            association_id
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        setBookings(prev => [...prev, data]);
        return data;
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      throw err;
    }
  };

  return {
    events,
    bookings,
    isLoading,
    error,
    refetch: fetchCalendarData,
    createEvent,
    updateEvent,
    deleteEvent,
    createBooking
  };
};