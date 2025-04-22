
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const messageService = {
  // Send a message
  sendMessage: async (messageData: {
    subject: string;
    content: string;
    association_id: string;
    recipient_groups: string[];
    type: 'email' | 'sms';
    scheduled_for?: string;
  }): Promise<{ success: boolean }> => {
    try {
      // Log message data
      console.log('Sending message:', messageData);
      
      // Check if the message is scheduled
      if (messageData.scheduled_for) {
        console.log(`Message scheduled for: ${messageData.scheduled_for}`);
        
        // Create a calendar event for the scheduled message (internal visibility)
        const { error: calendarError } = await supabase.from('calendar_events').insert({
          hoa_id: messageData.association_id,
          title: `Scheduled Message: ${messageData.subject}`,
          description: `Scheduled ${messageData.type.toUpperCase()} to be sent to ${messageData.recipient_groups.length} recipient groups.`,
          event_type: 'scheduled_message',
          start_time: messageData.scheduled_for,
          end_time: new Date(new Date(messageData.scheduled_for).getTime() + 30 * 60000).toISOString(), // Add 30 minutes
          visibility: 'private',
          color: '#6366F1' // Indigo color
        });
        
        if (calendarError) {
          console.error('Error creating calendar event:', calendarError);
        }
      }
      
      // In a real implementation, this would call an API or edge function
      // that would either send the message immediately or schedule it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};
