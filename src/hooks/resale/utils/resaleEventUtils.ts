
import { toast } from 'sonner';
import { ResaleEvent, NewResaleEvent } from '@/types/resale-event-types';

/**
 * Resets form to default values
 */
export const getDefaultNewEvent = (date: Date): NewResaleEvent => {
  return {
    title: '',
    date: date,
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    type: 'normal_order',
    color: '#3b6aff' // Default blue color
  };
};

/**
 * Validates a new event before creation
 */
export const validateNewEvent = (newEvent: NewResaleEvent, hasAssociation: boolean): string | null => {
  if (!hasAssociation) {
    return "Please select an association first";
  }

  if (!newEvent.title) {
    return "Please enter a title for the event";
  }

  // Create start and end time Date objects
  const startDate = new Date(newEvent.date);
  const [startHours, startMinutes] = newEvent.startTime.split(':');
  startDate.setHours(parseInt(startHours), parseInt(startMinutes));

  const endDate = new Date(newEvent.date);
  const [endHours, endMinutes] = newEvent.endTime.split(':');
  endDate.setHours(parseInt(endHours), parseInt(endMinutes));

  if (endDate <= startDate) {
    return "End time must be after start time";
  }

  return null;
};

/**
 * Prepares a new event for adding to the database
 */
export const prepareEventForCreate = (
  newEvent: NewResaleEvent, 
  nextId: string
): ResaleEvent => {
  return {
    id: nextId,
    title: newEvent.title,
    description: newEvent.description,
    property: newEvent.property,
    type: newEvent.type as any,
    startTime: newEvent.startTime,
    endTime: newEvent.endTime,
    date: newEvent.date,
    color: newEvent.color,
    status: 'pending'
  };
};
