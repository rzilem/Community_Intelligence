
import { useState, useEffect } from 'react';
import { ResaleEvent, ResaleEventFilters } from '@/types/resale-event-types';

/**
 * Hook to filter resale events based on the provided filters
 */
export const useResaleEventsFilter = (
  allEvents: ResaleEvent[],
  filters: ResaleEventFilters
) => {
  const [filteredEvents, setFilteredEvents] = useState<ResaleEvent[]>([]);

  useEffect(() => {
    let events = [...allEvents];
    
    if (!filters.resaleOrders) {
      events = events.filter(event => 
        event.type !== 'rush_order' && event.type !== 'normal_order');
    }
    
    if (!filters.propertyInspections) {
      events = events.filter(event => 
        event.type !== 'inspection');
    }
    
    if (!filters.documentExpirations) {
      events = events.filter(event => 
        event.type !== 'document_expiration');
    }
    
    if (!filters.documentUpdates) {
      events = events.filter(event => 
        event.type !== 'document_update');
    }
    
    setFilteredEvents(events);
  }, [allEvents, filters]);

  return filteredEvents;
};
