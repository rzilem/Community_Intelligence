
import { toast } from 'sonner';
import { useSupabaseCreate, useSupabaseDelete } from '@/hooks/supabase';
import { NewCalendarEvent } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultColorForType } from './calendarUtils';

export const useCalendarEventMutations = () => {
  const { currentAssociation, user } = useAuth();

  // Create event mutation
  const { mutate: createEvent, isPending: isCreating } = useSupabaseCreate('calendar_events', {
    showSuccessToast: true,
    invalidateQueries: [['calendar_events']]
  });

  // Delete event mutation
  const { mutate: deleteEvent, isPending: isDeleting } = useSupabaseDelete('calendar_events', {
    showSuccessToast: true,
    invalidateQueries: [['calendar_events']]
  });

  const handleCreateEvent = (newEvent: NewCalendarEvent, resetForm: () => void, refetch: () => void): boolean => {
    if (!currentAssociation) {
      toast.error("Please select an association first");
      return false;
    }

    if (!newEvent.title) {
      toast.error("Please enter a title for the event");
      return false;
    }

    // Create start and end time Date objects
    const startDate = new Date(newEvent.date);
    const [startHours, startMinutes] = newEvent.startTime.split(':');
    startDate.setHours(parseInt(startHours), parseInt(startMinutes));

    const endDate = new Date(newEvent.date);
    const [endHours, endMinutes] = newEvent.endTime.split(':');
    endDate.setHours(parseInt(endHours), parseInt(endMinutes));

    if (endDate <= startDate) {
      toast.error("End time must be after start time");
      return false;
    }

    // Create the event object to save to Supabase
    const eventToSave = {
      association_id: currentAssociation.id,
      title: newEvent.title,
      description: newEvent.description || null,
      location: newEvent.location || null,
      event_type: newEvent.type,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      amenity_id: newEvent.amenityId || null,
      booked_by: user?.id || null,
      visibility: 'private', // Default visibility
      color: newEvent.color || getDefaultColorForType(newEvent.type)
    };

    // Save to Supabase
    createEvent(eventToSave, {
      onSuccess: () => {
        toast.success("Event booked successfully!");
        resetForm();
        refetch();
        return true;
      },
      onError: (error) => {
        console.error("Event creation error:", error);
        toast.error(`Failed to create event: ${error.message}`);
        return false;
      }
    });
    
    return true; // Default return for optimistic UI updates
  };

  const handleDeleteEvent = (eventId: string, refetch: () => void) => {
    if (isDeleting) return;

    // Confirm before deleting
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEvent(eventId, {
        onSuccess: () => {
          toast.success("Event deleted successfully");
          refetch();
        },
        onError: (error) => {
          console.error("Event deletion error:", error);
          toast.error(`Failed to delete event: ${error.message}`);
        }
      });
    }
  };

  return {
    isCreating,
    isDeleting,
    handleCreateEvent,
    handleDeleteEvent,
    hasAssociation: !!currentAssociation
  };
};
