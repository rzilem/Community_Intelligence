import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

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

// Mock data for demonstration
const mockEvents: Event[] = [
  {
    id: '1',
    association_id: '1',
    title: 'Annual HOA Meeting',
    description: 'Annual meeting to discuss community matters and vote on important issues.',
    event_type: 'meeting',
    start_date: '2024-03-15T19:00:00',
    end_date: '2024-03-15T21:00:00',
    location: 'Community Center',
    max_attendees: 50,
    current_attendees: 0,
    requires_rsvp: true,
    rsvp_deadline: '2024-03-13T23:59:59',
    event_status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    association_id: '1',
    title: 'Pool Opening Celebration',
    description: 'Join us for the official pool opening with refreshments and activities.',
    event_type: 'community',
    start_date: '2024-05-01T14:00:00',
    end_date: '2024-05-01T18:00:00',
    location: 'Community Pool',
    max_attendees: 100,
    current_attendees: 0,
    requires_rsvp: false,
    event_status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useEvents = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [isLoading, setIsLoading] = useState(false);

  const createEvent = {
    mutateAsync: async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'current_attendees'>) => {
      setIsLoading(true);
      try {
        const newEvent: Event = {
          ...eventData,
          id: Date.now().toString(),
          current_attendees: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setEvents(prev => [newEvent, ...prev]);
        toast({
          title: "Success",
          description: "Event created successfully."
        });
        return newEvent;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateEvent = {
    mutateAsync: async ({ id, ...updates }: Partial<Event> & { id: string }) => {
      setIsLoading(true);
      try {
        setEvents(prev => prev.map(event => 
          event.id === id 
            ? { ...event, ...updates, updated_at: new Date().toISOString() }
            : event
        ));
        toast({
          title: "Success",
          description: "Event updated successfully."
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const deleteEvent = {
    mutateAsync: async (id: string) => {
      setIsLoading(true);
      try {
        setEvents(prev => prev.filter(event => event.id !== id));
        toast({
          title: "Success",
          description: "Event deleted successfully."
        });
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
    deleteEvent
  };
};