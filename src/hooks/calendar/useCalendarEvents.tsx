import { useState, useMemo } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '@/contexts/auth';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  resourceId?: string;
  [key: string]: any;
}

export const useCalendarEvents = (selectedDate: Date) => {
  const { currentAssociation } = useAuth();
  const [selectedView, setSelectedView] = useState<'month' | 'week' | 'day'>('month');

  const { data: events, isLoading: eventsLoading } = useSupabaseQuery<CalendarEvent[]>(
    'calendar_events',
    {
      select: '*',
      filter: currentAssociation ? [{ column: 'association_id', value: currentAssociation.id }] : [],
      // Add date range filter based on the selected view
      dateRange: {
        start: format(startOfMonth(selectedDate), 'yyyy-MM-dd'),
        end: format(endOfMonth(selectedDate), 'yyyy-MM-dd'),
      },
    },
    !!currentAssociation
  );

  const formattedEvents = useMemo(() => {
    if (!events) return [];

    return events.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  }, [events]);

  return { events: formattedEvents, eventsLoading, selectedView, setSelectedView };
};
