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

      // Use calendar_events table instead of non-existent events table
      let eventsQuery = supabase
        .from('calendar_events')
        .select('*');

      if (associationId) {
        eventsQuery = eventsQuery.eq('association_id', associationId);
      }

      const { data: eventsData, error: eventsError } = await eventsQuery
        .order('start_time', { ascending: true });

      if (eventsError && eventsError.code !== 'PGRST116') {
        console.error('Events error:', eventsError);
      }

      // Transform calendar_events data to match CalendarEvent interface
      const transformedEvents: CalendarEvent[] = (eventsData || []).map(event => ({
        id: event.id,
        title: event.title || '',
        description: event.description,
        start_date: event.start_time || new Date().toISOString(),
        end_date: event.end_time,
        location: event.location,
        event_type: event.event_type || 'general',
        association_id: event.association_id || '',
        created_by: event.created_by,
        max_attendees: 0,
        current_attendees: 0,
        requires_rsvp: false,
        event_status: 'active',
        tags: []
      }));

      setEvents(transformedEvents);

      // Use mock data for bookings since amenity_bookings table doesn't exist
      const mockBookings: AmenityBooking[] = associationId ? [
        {
          id: '1',
          amenity_id: '1',
          user_id: 'user1',
          booking_date: new Date().toISOString().split('T')[0],
          start_time: '10:00',
          end_time: '12:00',
          status: 'confirmed',
          notes: 'Pool booking',
          guests_count: 2,
          amenities: {
            name: 'Swimming Pool',
            association_id: associationId
          }
        }
      ] : [];

      setBookings(mockBookings);

    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError('Failed to load calendar data');
      // Set empty data on error
      setEvents([]);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'current_attendees'>) => {
    try {
      // Transform to calendar_events format
      const calendarEventData = {
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.start_date,
        end_time: eventData.end_date,
        location: eventData.location,
        event_type: eventData.event_type,
        association_id: eventData.association_id,
        created_by: eventData.created_by,
        access_level: 'public',
        all_day: false
      };

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([calendarEventData])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newEvent: CalendarEvent = {
          id: data.id,
          title: data.title || '',
          description: data.description,
          start_date: data.start_time || new Date().toISOString(),
          end_date: data.end_time,
          location: data.location,
          event_type: data.event_type || 'general',
          association_id: data.association_id || '',
          created_by: data.created_by,
          max_attendees: 0,
          current_attendees: 0,
          requires_rsvp: false,
          event_status: 'active',
          tags: []
        };
        setEvents(prev => [...prev, newEvent]);
        return newEvent;
      }
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      // Transform updates to calendar_events format
      const calendarUpdates: any = {};
      if (updates.title) calendarUpdates.title = updates.title;
      if (updates.description) calendarUpdates.description = updates.description;
      if (updates.start_date) calendarUpdates.start_time = updates.start_date;
      if (updates.end_date) calendarUpdates.end_time = updates.end_date;
      if (updates.location) calendarUpdates.location = updates.location;
      if (updates.event_type) calendarUpdates.event_type = updates.event_type;

      const { data, error } = await supabase
        .from('calendar_events')
        .update(calendarUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedEvent: CalendarEvent = {
          id: data.id,
          title: data.title || '',
          description: data.description,
          start_date: data.start_time || new Date().toISOString(),
          end_date: data.end_time,
          location: data.location,
          event_type: data.event_type || 'general',
          association_id: data.association_id || '',
          created_by: data.created_by,
          max_attendees: 0,
          current_attendees: 0,
          requires_rsvp: false,
          event_status: 'active',
          tags: []
        };
        setEvents(prev => prev.map(event => 
          event.id === id ? updatedEvent : event
        ));
        return updatedEvent;
      }
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
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
      // Mock booking creation since table doesn't exist
      const newBooking: AmenityBooking = {
        ...bookingData,
        id: Math.random().toString(36).substr(2, 9)
      };
      
      setBookings(prev => [...prev, newBooking]);
      return newBooking;
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