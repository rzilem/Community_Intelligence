
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { getDefaultColorForType } from '@/hooks/calendar/calendarUtils';

interface CalendarEventDetails {
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  type: 'amenity_booking' | 'hoa_meeting' | 'maintenance' | 'community_event';
  amenityId?: string;
}

export const useFormCalendarIntegration = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { currentAssociation, user } = useAuth();

  const createCalendarEvent = async (eventDetails: CalendarEventDetails): Promise<boolean> => {
    if (!currentAssociation) {
      toast.error("Please select an association first");
      return false;
    }

    if (!eventDetails.title) {
      toast.error("Event title is required");
      return false;
    }

    setIsCreating(true);
    try {
      // Create start and end time Date objects
      const startDate = new Date(eventDetails.date);
      const [startHours, startMinutes] = eventDetails.startTime.split(':');
      startDate.setHours(parseInt(startHours), parseInt(startMinutes));

      const endDate = new Date(eventDetails.date);
      const [endHours, endMinutes] = eventDetails.endTime.split(':');
      endDate.setHours(parseInt(endHours), parseInt(endMinutes));

      // Create the event object to save to Supabase
      const eventToSave = {
        hoa_id: currentAssociation.id,
        title: eventDetails.title,
        description: eventDetails.description || null,
        location: eventDetails.location || null,
        event_type: eventDetails.type,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        amenity_id: eventDetails.amenityId || null,
        booked_by: user?.id || null,
        visibility: 'private', // Default visibility
        color: getDefaultColorForType(eventDetails.type)
      };

      // Save to Supabase
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(eventToSave)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Event added to the calendar successfully!");
      return true;
    } catch (error) {
      console.error("Event creation error:", error);
      toast.error(`Failed to create calendar event: ${error.message}`);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createCalendarEvent,
    isCreating
  };
};
