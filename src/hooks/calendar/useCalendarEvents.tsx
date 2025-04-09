
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSupabaseQuery, useSupabaseCreate, useSupabaseDelete } from '@/hooks/supabase';
import { CalendarEvent } from '@/types/calendar-types';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event';
  amenityId?: string;
  color?: string;
}

interface UseCalendarEventsProps {
  date: Date;
}

export const useCalendarEvents = ({ date }: UseCalendarEventsProps) => {
  const { currentAssociation, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event';
    amenityId: string;
    color: string;
  }>({
    title: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    type: 'amenity_booking',
    amenityId: '1',
    color: '#3b6aff' // Default blue color
  });

  // Query for calendar events
  const { data: calendarEvents, isLoading: eventsLoading, refetch } = useSupabaseQuery<CalendarEvent[]>(
    'calendar_events',
    {
      select: '*',
      filter: currentAssociation ? [{ column: 'hoa_id', value: currentAssociation.id }] : [],
    },
    !!currentAssociation
  );

  // Create event mutation
  const { mutate: createEvent, isPending: isCreating } = useSupabaseCreate('calendar_events', {
    showSuccessToast: true,
    invalidateQueries: [['calendar_events']]
  });

  // Delete event mutation
  const { mutate: deleteEvent, isPending: isDeleting } = useSupabaseDelete('calendar_events', {
    showSuccessToast: true,
    invalidateQueries: [['calendar_events']]
  });

  // Convert Supabase events to component events when data changes
  useEffect(() => {
    if (calendarEvents && calendarEvents.length > 0) {
      const formattedEvents: Event[] = calendarEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        date: new Date(event.start_time),
        startTime: format(new Date(event.start_time), 'HH:mm'),
        endTime: format(new Date(event.end_time), 'HH:mm'),
        type: event.event_type as any,
        amenityId: event.amenity_id || undefined,
        color: event.color || getDefaultColorForType(event.event_type)
      }));
      setEvents(formattedEvents);
    } else {
      setEvents([]);
    }
  }, [calendarEvents]);

  // Get default color based on event type
  const getDefaultColorForType = (eventType: string): string => {
    switch (eventType) {
      case 'amenity_booking':
        return '#3b6aff'; // blue
      case 'hoa_meeting':
        return '#0d766d'; // teal
      case 'maintenance':
        return '#f97316'; // orange
      case 'community_event':
        return '#8B5CF6'; // purple
      default:
        return '#3b6aff'; // default blue
    }
  };

  const handleCreateEvent = (): boolean => {
    if (!currentAssociation) {
      toast.error("Please select an association first");
      return false;
    }

    if (!newEvent.title) {
      toast.error("Please enter a title for the event");
      return false;
    }

    // Create start and end time Date objects
    const startDate = new Date(newEvent.date);
    const [startHours, startMinutes] = newEvent.startTime.split(':');
    startDate.setHours(parseInt(startHours), parseInt(startMinutes));

    const endDate = new Date(newEvent.date);
    const [endHours, endMinutes] = newEvent.endTime.split(':');
    endDate.setHours(parseInt(endHours), parseInt(endMinutes));

    if (endDate <= startDate) {
      toast.error("End time must be after start time");
      return false;
    }

    // Create the event object to save to Supabase
    const eventToSave = {
      hoa_id: currentAssociation.id,
      title: newEvent.title,
      description: newEvent.description || null,
      location: newEvent.location || null,
      event_type: newEvent.type,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      amenity_id: newEvent.amenityId || null,
      booked_by: user?.id || null,
      visibility: 'private', // Default visibility
      color: newEvent.color || getDefaultColorForType(newEvent.type)
    };

    console.log("Creating event:", eventToSave);

    // Save to Supabase
    createEvent(eventToSave, {
      onSuccess: () => {
        toast.success("Event booked successfully!");
        
        // Reset form
        setNewEvent({
          title: '',
          date: new Date(),
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          type: 'amenity_booking',
          amenityId: '1',
          color: '#3b6aff' // Reset to default blue color
        });
        
        // Refetch events to update the UI
        refetch();
        return true;
      },
      onError: (error) => {
        console.error("Event creation error:", error);
        toast.error(`Failed to create event: ${error.message}`);
        return false;
      }
    });
    
    return true; // Default return for optimistic UI updates
  };

  const handleDeleteEvent = (eventId: string) => {
    if (isDeleting) return;

    // Confirm before deleting
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEvent(eventId, {
        onSuccess: () => {
          toast.success("Event deleted successfully");
          refetch();
        },
        onError: (error) => {
          console.error("Event deletion error:", error);
          toast.error(`Failed to delete event: ${error.message}`);
        }
      });
    }
  };

  // Filter events for the selected date
  const eventsForSelectedDate = events.filter(
    event => event.date.toDateString() === date.toDateString()
  );

  return {
    events: eventsForSelectedDate,
    newEvent,
    setNewEvent,
    eventsLoading,
    isCreating,
    isDeleting,
    handleCreateEvent,
    handleDeleteEvent,
    hasAssociation: !!currentAssociation,
    getDefaultColorForType
  };
};
