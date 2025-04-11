
import { Dispatch, SetStateAction, useCallback } from 'react';
import { ResaleEvent } from '@/types/resale-event-types';
import { toast } from 'sonner';

/**
 * Hook for resale event operations (delete, update status, etc.)
 * @param setEvents State setter for events array
 * @returns Object containing event operation handlers
 */
export const useResaleEventOperations = (
  setEvents: Dispatch<SetStateAction<ResaleEvent[]>>
) => {
  /**
   * Handles the deletion of a resale event
   * @param eventId ID of the event to delete
   */
  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents(prev => {
      const updatedEvents = prev.filter(event => event.id !== eventId);
      
      // In a real implementation, we would call an API to delete the event
      // For now, show a success toast for better UX
      toast.success('Event deleted successfully');
      
      return updatedEvents;
    });
  }, [setEvents]);

  // Additional event operations can be added here in the future
  // such as updating event status, rescheduling, etc.

  return {
    handleDeleteEvent
  };
};
