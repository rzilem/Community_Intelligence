
import { useState, useMemo } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '@/contexts/auth';
import { ResaleEvent } from '@/types/resale-event-types';

interface UseResaleCalendarEventsProps {
  date: Date;
  filters: {
    resaleOrders: boolean;
    propertyInspections: boolean;
    documentExpirations: boolean;
    documentUpdates: boolean;
  };
}

export const useResaleCalendarEvents = ({ date, filters }: UseResaleCalendarEventsProps) => {
  const { currentAssociation } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);

  const { data: resaleEvents, isLoading: resaleEventsLoading } = useSupabaseQuery<any[]>(
    'resale_calendar_events',
    {
      select: '*',
      filter: currentAssociation ? [
        { column: 'association_id', value: currentAssociation.id },
        { column: 'date', operator: 'gte', value: format(monthStart, 'yyyy-MM-dd') },
        { column: 'date', operator: 'lte', value: format(monthEnd, 'yyyy-MM-dd') }
      ] : [],
    },
    !!currentAssociation
  );

  const events = useMemo(() => {
    if (!resaleEvents) return [];
    
    // Apply filters
    return resaleEvents.filter(event => {
      if (!filters.resaleOrders && event.type === 'rush_order') return false;
      if (!filters.propertyInspections && event.type === 'inspection') return false;
      if (!filters.documentExpirations && event.type === 'document_expiration') return false;
      if (!filters.documentUpdates && event.type === 'document_update') return false;
      return true;
    }).map(event => ({
      ...event,
      date: new Date(event.date),
    }));
  }, [resaleEvents, filters]);

  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Implement delete functionality
      console.log('Delete event:', eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return { 
    resaleEvents, 
    resaleEventsLoading, 
    currentMonth, 
    setCurrentMonth,
    events,
    eventsLoading: resaleEventsLoading,
    handleDeleteEvent
  };
};
