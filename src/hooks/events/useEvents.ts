import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Event {
  id: string;
  association_id: string;
  title: string;
  description?: string;
  event_type: string;
  start_date: string;
  end_date?: string;
  location?: string;
  max_attendees?: number;
  current_attendees: number;
  requires_rsvp?: boolean;
  rsvp_deadline?: string;
  event_status: string;
  created_by?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export const useEvents = (associationId?: string) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch events from Supabase
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('events').select('*');
      
      if (associationId) {
        query = query.eq('association_id', associationId);
      }
      
      const { data, error } = await query.order('start_date', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setEvents(data.map(event => ({
          ...event,
          current_attendees: event.current_attendees || 0
        })));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [associationId]);

  const createEvent = {
    mutateAsync: async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'current_attendees'>) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .insert([{
            ...eventData,
            current_attendees: 0,
          }])
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const newEvent: Event = {
            ...data,
            current_attendees: 0
          };
          setEvents(prev => [newEvent, ...prev]);
          toast({
            title: "Success",
            description: "Event created successfully."
          });
          return newEvent;
        }
      } catch (error) {
        console.error('Error creating event:', error);
        toast({
          title: "Error",
          description: "Failed to create event",
          variant: "destructive"
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateEvent = {
    mutateAsync: async ({ id, ...updates }: Partial<Event> & { id: string }) => {
      setIsLoading(true);
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
            event.id === id ? { ...event, ...data } : event
          ));
          toast({
            title: "Success",
            description: "Event updated successfully."
          });
          return data;
        }
      } catch (error) {
        console.error('Error updating event:', error);
        toast({
          title: "Error",
          description: "Failed to update event",
          variant: "destructive"
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const deleteEvent = {
    mutateAsync: async (id: string) => {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setEvents(prev => prev.filter(event => event.id !== id));
        toast({
          title: "Success",
          description: "Event deleted successfully."
        });
      } catch (error) {
        console.error('Error deleting event:', error);
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive"
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents
  };
};