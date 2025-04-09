
import { format } from 'date-fns';
import { CalendarEvent } from '@/types/calendar-types';
import { CalendarEventUI } from './types';

// Convert database events to UI events
export const mapDbEventsToUiEvents = (calendarEvents: CalendarEvent[]): CalendarEventUI[] => {
  if (!calendarEvents || calendarEvents.length === 0) {
    return [];
  }

  return calendarEvents.map(event => ({
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
};

// Get default color based on event type
export const getDefaultColorForType = (eventType: string): string => {
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

// Filter events for a specific date
export const filterEventsForDate = (events: CalendarEventUI[], date: Date): CalendarEventUI[] => {
  return events.filter(
    event => event.date.toDateString() === date.toDateString()
  );
};
