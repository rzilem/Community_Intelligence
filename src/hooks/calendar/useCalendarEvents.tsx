
import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { CalendarEvent } from '@/types/calendar-types';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarEventUI, NewCalendarEvent } from './types';
import { mapDbEventsToUiEvents, filterEventsForDate, getDefaultColorForType } from './calendarUtils';
import { useCalendarEventMutations } from './useCalendarEventMutations';

interface UseCalendarEventsProps {
  date: Date;
}

export const useCalendarEvents = ({ date }: UseCalendarEventsProps) => {
  const { currentAssociation } = useAuth();
  const [events, setEvents] = useState<CalendarEventUI[]>([]);
  const [newEvent, setNewEvent] = useState<NewCalendarEvent>({
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

  // Get mutations from the separate hook
  const { 
    isCreating, 
    isDeleting, 
    handleCreateEvent, 
    handleDeleteEvent,
    hasAssociation 
  } = useCalendarEventMutations();

  // Convert Supabase events to component events when data changes
  useEffect(() => {
    const mappedEvents = mapDbEventsToUiEvents(calendarEvents || []);
    setEvents(mappedEvents);
  }, [calendarEvents]);

  // Reset form helper function
  const resetForm = () => {
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
  };

  // Handler to create event, using the mutation hook
  const createEventHandler = (): boolean => {
    return handleCreateEvent(newEvent, resetForm, refetch);
  };

  // Handler to delete event, using the mutation hook
  const deleteEventHandler = (eventId: string) => {
    handleDeleteEvent(eventId, refetch);
  };

  // Filter events for the selected date
  const eventsForSelectedDate = filterEventsForDate(events, date);

  return {
    events: eventsForSelectedDate,
    newEvent,
    setNewEvent,
    eventsLoading,
    isCreating,
    isDeleting,
    handleCreateEvent: createEventHandler,
    handleDeleteEvent: deleteEventHandler,
    hasAssociation,
    getDefaultColorForType
  };
};
