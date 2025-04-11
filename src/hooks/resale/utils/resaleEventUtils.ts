
import { ResaleEvent, ResaleEventFilters, NewResaleEvent } from '@/types/resale-event-types';

/**
 * Filters resale events based on the provided filter criteria
 * @param allEvents All available events
 * @param filters Filter criteria to apply
 * @returns Filtered events
 */
export const filterResaleEvents = (
  allEvents: ResaleEvent[],
  filters: ResaleEventFilters
): ResaleEvent[] => {
  if (!allEvents.length) return [];
  
  return allEvents.filter(event => {
    // Filter by resale orders
    if (!filters.resaleOrders && (event.type === 'rush_order' || event.type === 'normal_order')) {
      return false;
    }
    
    // Filter by property inspections
    if (!filters.propertyInspections && event.type === 'inspection') {
      return false;
    }
    
    // Filter by document expirations
    if (!filters.documentExpirations && event.type === 'document_expiration') {
      return false;
    }
    
    // Filter by document updates
    if (!filters.documentUpdates && event.type === 'document_update') {
      return false;
    }
    
    return true;
  });
};

/**
 * Validates a new resale event
 * @param newEvent The event to validate
 * @param hasAssociation Whether a current association is selected
 * @returns Error message or null if valid
 */
export const validateNewEvent = (newEvent: NewResaleEvent, hasAssociation: boolean): string | null => {
  if (!hasAssociation) {
    return "Please select an association before creating an event";
  }
  
  if (!newEvent.title) {
    return "Event title is required";
  }
  
  if (!newEvent.type) {
    return "Event type is required";
  }
  
  if (!newEvent.date) {
    return "Event date is required";
  }
  
  if (!newEvent.startTime || !newEvent.endTime) {
    return "Start and end times are required";
  }
  
  // Validate that end time is after start time
  if (newEvent.startTime >= newEvent.endTime) {
    return "End time must be after start time";
  }
  
  return null;
};

/**
 * Prepares a new event for creation
 * @param newEvent The new event data
 * @param newId The ID to assign to the event
 * @returns Prepared ResaleEvent object
 */
export const prepareEventForCreate = (newEvent: NewResaleEvent, newId: string): ResaleEvent => {
  return {
    id: newId,
    title: newEvent.title,
    description: newEvent.description || '',
    property: newEvent.property || '',
    type: newEvent.type as any, // Cast to ResaleEventType
    startTime: newEvent.startTime,
    endTime: newEvent.endTime,
    date: newEvent.date,
    color: newEvent.color,
    status: 'pending' // Default status for new events
  };
};
