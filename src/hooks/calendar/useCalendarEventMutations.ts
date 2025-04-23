import { toast } from 'sonner';
import { useSupabaseCreate, useSupabaseDelete } from '@/hooks/supabase';
import { NewCalendarEvent } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultColorForType } from './calendarUtils';
import { checkAmenityBookingConflict } from './checkAmenityBookingConflict';
import { useSupabaseQuery } from '@/hooks/supabase';

export const useCalendarEventMutations = () => {
  const { currentAssociation, user } = useAuth();

  // Fetch all events for the selected amenity and date
  const fetchEventsForAmenityDay = async (amenityId: string, date: Date) => {
    if (!currentAssociation || !amenityId) return [];
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const { data, error } = await (window as any).supabase
      .from('calendar_events')
      .select('*')
      .eq('hoa_id', currentAssociation.id)
      .eq('amenity_id', amenityId)
      .gte('start_time', dayStart.toISOString())
      .lte('end_time', dayEnd.toISOString());

    return data || [];
  };

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

  const handleCreateEvent = async (newEvent: NewCalendarEvent, resetForm: () => void, refetch: () => void): Promise<boolean> => {
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

    // Only check for conflict for amenity_booking types
    if (newEvent.type === 'amenity_booking' && newEvent.amenityId) {
      const eventsForDay = await fetchEventsForAmenityDay(newEvent.amenityId, newEvent.date);
      if (checkAmenityBookingConflict(eventsForDay, startDate, endDate)) {
        toast.error("This amenity is already booked for the selected time slot. Please choose a different time.");
        return false;
      }
    }

    // Create the event object to save to Supabase
    const eventToSave = {
      hoa_id: currentAssociation.id,
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

    return true;
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
