import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { CalendarEvent } from '@/types/app-types';

interface UseCalendarEventMutationsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCalendarEventMutations = ({ onSuccess, onError }: UseCalendarEventMutationsProps = {}) => {
  const queryClient = useQueryClient();
  const { currentAssociation } = useAuth();

  // Mutation for creating a new calendar event
  const createEventMutation = useMutation(
    async (newEvent: Omit<CalendarEvent, 'id'>) => {
      if (!currentAssociation) {
        throw new Error('No association selected');
      }
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{ ...newEvent, association_id: currentAssociation.id }]);
      if (error) {
        throw error;
      }
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['calendarEvents']);
        toast.success('Event created successfully!');
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error: any) => {
        toast.error(`Failed to create event: ${error.message}`);
        if (onError) {
          onError(error);
        }
      },
    }
  );

  // Mutation for updating an existing calendar event
  const updateEventMutation = useMutation(
    async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id);
      if (error) {
        throw error;
      }
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['calendarEvents']);
        toast.success('Event updated successfully!');
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error: any) => {
        toast.error(`Failed to update event: ${error.message}`);
        if (onError) {
          onError(error);
        }
      },
    }
  );

  // Mutation for deleting a calendar event
  const deleteEventMutation = useMutation(
    async (id: string) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      if (error) {
        throw error;
      }
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['calendarEvents']);
        toast.success('Event deleted successfully!');
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error: any) => {
        toast.error(`Failed to delete event: ${error.message}`);
        if (onError) {
          onError(error);
        }
      },
    }
  );

  return {
    createEvent: createEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
    isCreating: createEventMutation.isLoading,
    isUpdating: updateEventMutation.isLoading,
    isDeleting: deleteEventMutation.isLoading,
  };
};
