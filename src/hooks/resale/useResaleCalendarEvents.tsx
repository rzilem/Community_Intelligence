
import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { CalendarEvent } from '@/types/calendar-types';
import { useAuth } from '@/contexts/AuthContext';
import { ResaleEvent, NewResaleEvent, ResaleEventFilters } from '@/types/resale-event-types';
import { getMockResaleEvents } from './mock/resaleEventsMock';
import { getDefaultNewEvent } from './utils/resaleEventUtils';
import { useResaleEventsFilter } from './useResaleEventsFilter';
import { useResaleEventMutations } from './useResaleEventMutations';

interface UseResaleCalendarEventsProps {
  date: Date;
  filters: ResaleEventFilters;
}

export const useResaleCalendarEvents = ({ date, filters }: UseResaleCalendarEventsProps) => {
  const { currentAssociation, user } = useAuth();
  const [allEvents, setAllEvents] = useState<ResaleEvent[]>([]);
  const [newEvent, setNewEvent] = useState<NewResaleEvent>(getDefaultNewEvent(date));
  
  // Query for calendar events (for future implementation)
  const { data: calendarEvents, isLoading: eventsLoading, refetch } = useSupabaseQuery<CalendarEvent[]>(
    'calendar_events',
    {
      select: '*',
      filter: currentAssociation ? [{ column: 'hoa_id', value: currentAssociation.id }] : [],
    },
    !!currentAssociation
  );

  // Load mock data
  useEffect(() => {
    const mockEvents = getMockResaleEvents(date);
    setAllEvents(mockEvents);
  }, [date]);

  // Update newEvent date when date prop changes
  useEffect(() => {
    setNewEvent(prev => ({
      ...prev,
      date: date
    }));
  }, [date]);

  // Filter events based on the filters
  const events = useResaleEventsFilter(allEvents, filters);

  // Get mutations (create, delete)
  const { 
    isCreating, 
    isDeleting, 
    handleCreateEvent: createEvent,
    handleDeleteEvent 
  } = useResaleEventMutations(allEvents, setAllEvents, !!currentAssociation);

  // Reset form helper function
  const resetForm = () => {
    setNewEvent(getDefaultNewEvent(date));
  };

  // Wrapper for create event to handle resetting the form
  const handleCreateEvent = (): boolean => {
    const success = createEvent(newEvent);
    if (success) {
      resetForm();
    }
    return success;
  };

  return {
    events,
    newEvent,
    setNewEvent,
    eventsLoading: false, // Mock loading state
    isCreating,
    isDeleting,
    handleCreateEvent,
    handleDeleteEvent,
    hasAssociation: !!currentAssociation
  };
};
