
import { useState, useEffect } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ResaleEvent, ResaleEventFilters } from '@/types/resale-event-types';
import { getMockResaleEvents } from './mock/resaleEventsMock';
import { filterResaleEvents } from './utils/resaleEventUtils';
import { useResaleEventOperations } from './useResaleEventOperations';
import { toast } from 'sonner';

interface UseResaleCalendarEventsProps {
  date: Date;
  filters: ResaleEventFilters;
}

export const useResaleCalendarEvents = ({ date, filters }: UseResaleCalendarEventsProps) => {
  const { currentAssociation } = useAuth();
  const [allEvents, setAllEvents] = useState<ResaleEvent[]>([]);
  const { handleDeleteEvent } = useResaleEventOperations(setAllEvents);
  
  // Query for calendar events with error handling
  const { data: calendarEvents, isLoading: eventsLoading, error } = useSupabaseQuery(
    'resale_events',
    {
      select: '*',
      filter: currentAssociation ? [{ column: 'association_id', value: currentAssociation.id }] : [],
      onError: (err) => {
        console.error('Error fetching resale events:', err);
        // Only show toast once to avoid spamming the user
        if (!localStorage.getItem('resale_events_error_shown')) {
          toast.error('Unable to load resale events', {
            description: 'Using mock data instead.',
            duration: 3000,
          });
          localStorage.setItem('resale_events_error_shown', 'true');
          
          // Reset after 1 hour
          setTimeout(() => {
            localStorage.removeItem('resale_events_error_shown');
          }, 60 * 60 * 1000);
        }
      }
    },
    !!currentAssociation
  );

  // Load mock data when there's an error or we're in development
  useEffect(() => {
    // Always have some events for the UI
    const mockEvents = getMockResaleEvents(date);
    
    if (error || process.env.NODE_ENV === 'development') {
      setAllEvents(mockEvents);
    } else if (calendarEvents && Array.isArray(calendarEvents)) {
      // If we have real events, use those, or fall back to mock data if empty
      const events = calendarEvents.length > 0 
        ? calendarEvents as ResaleEvent[] 
        : mockEvents;
      
      setAllEvents(events);
    }
  }, [date, calendarEvents, error]);

  // Filter events based on the filters
  const events = filterResaleEvents(allEvents, filters);

  return {
    events,
    eventsLoading: eventsLoading && !error, // Only show loading if there's no error
    handleDeleteEvent,
    hasAssociation: !!currentAssociation,
    error
  };
};
