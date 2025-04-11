
import { ResaleEvent, ResaleEventFilters } from '@/types/resale-event-types';

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
