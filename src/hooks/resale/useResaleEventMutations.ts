
import { useState } from 'react';
import { toast } from 'sonner';
import { ResaleEvent, NewResaleEvent } from '@/types/resale-event-types';
import { validateNewEvent, prepareEventForCreate } from './utils/resaleEventUtils';

/**
 * Hook to handle mutations for resale events (create, update, delete)
 */
export const useResaleEventMutations = (
  events: ResaleEvent[], 
  setEvents: React.Dispatch<React.SetStateAction<ResaleEvent[]>>,
  hasAssociation: boolean
) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handler to create event
  const handleCreateEvent = (newEvent: NewResaleEvent): boolean => {
    setIsCreating(true);
    
    // Validate the new event
    const validationError = validateNewEvent(newEvent, hasAssociation);
    if (validationError) {
      toast.error(validationError);
      setIsCreating(false);
      return false;
    }

    try {
      // In a real implementation, we would save to the database here
      // For now, just simulate adding to our local state
      const newId = (events.length + 1).toString();
      const eventToAdd = prepareEventForCreate(newEvent, newId);
      
      setEvents(prev => [...prev, eventToAdd]);
      toast.success("Event created successfully!");
      setIsCreating(false);
      return true;
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
      setIsCreating(false);
      return false;
    }
  };

  // Handler to delete event
  const handleDeleteEvent = (eventId: string) => {
    if (isDeleting) return;

    setIsDeleting(true);
    
    // Confirm before deleting
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        // In a real implementation, we would delete from the database here
        // For now, just simulate removing from our local state
        setEvents(prev => prev.filter(event => event.id !== eventId));
        toast.success("Event deleted successfully");
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error("Failed to delete event");
      }
    }
    
    setIsDeleting(false);
  };

  return {
    isCreating,
    isDeleting,
    handleCreateEvent,
    handleDeleteEvent,
  };
};
