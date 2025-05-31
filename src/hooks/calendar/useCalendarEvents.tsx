
import { useState, useMemo } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '@/contexts/auth';
import { CalendarEvent, NewCalendarEvent } from '@/types/calendar-types';
import { useCalendarEventMutations } from './useCalendarEventMutations';

interface UseCalendarEventsProps {
  date: Date;
}

export const useCalendarEvents = ({ date }: UseCalendarEventsProps) => {
  const { currentAssociation } = useAuth();
  const [selectedView, setSelectedView] = useState<'month' | 'week' | 'day'>('month');
  const [newEvent, setNewEvent] = useState<Partial<NewCalendarEvent> | null>(null);

  const { data: events, isLoading: eventsLoading } = useSupabaseQuery<any[]>(
    'calendar_events',
    {
      select: '*',
      filter: currentAssociation ? [{ column: 'hoa_id', value: currentAssociation.id }] : [],
    },
    !!currentAssociation
  );

  const { createEvent, deleteEvent, isCreating } = useCalendarEventMutations();

  const formattedEvents = useMemo(() => {
    if (!events) return [];

    return events.map(event => ({
      ...event,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      startTime: format(new Date(event.start_time), 'HH:mm'),
      endTime: format(new Date(event.end_time), 'HH:mm'),
      allDay: false,
    }));
  }, [events]);

  const eventsForSelectedDate = useMemo(() => {
    if (!formattedEvents) return [];
    
    const selectedDateString = format(date, 'yyyy-MM-dd');
    return formattedEvents.filter(event => 
      format(event.start, 'yyyy-MM-dd') === selectedDateString
    );
  }, [formattedEvents, date]);

  const handleCreateEvent = async () => {
    if (!newEvent || !currentAssociation) return false;
    
    try {
      const eventData = {
        ...newEvent,
        start: date,
        end: date,
        hoa_id: currentAssociation.id,
        association_id: currentAssociation.id,
        event_type: newEvent.event_type || 'amenity_booking',
        visibility: 'public' as const,
        allDay: false,
      } as Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>;
      
      await createEvent(eventData);
      setNewEvent(null);
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      return false;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return { 
    events: formattedEvents,
    eventsForSelectedDate,
    eventsLoading, 
    selectedView, 
    setSelectedView,
    newEvent,
    setNewEvent,
    isCreating,
    handleCreateEvent,
    handleDeleteEvent,
    hasAssociation: !!currentAssociation
  };
};
