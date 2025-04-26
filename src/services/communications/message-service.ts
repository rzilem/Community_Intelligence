
import { supabase } from '@/integrations/supabase/client';
import { scheduledMessageService } from './scheduled-message-service';
import { MessageCategory } from '@/types/communication-types';

export const messageService = {
  // Send a message, optionally schedule to the new table
  sendMessage: async (messageData: {
    subject: string;
    content: string;
    association_id: string;
    recipient_groups: string[];
    type: 'email' | 'sms';
    scheduled_date?: string;
    category?: MessageCategory;
  }): Promise<{ success: boolean }> => {
    try {
      if (messageData.type === 'email') {
        // Call Supabase edge function to send email - Fix: using object instead of JSON string
        const emailResponse = await supabase.functions.invoke('send-email', {
          body: {
            to: messageData.recipient_groups, // Array of recipient emails
            subject: messageData.subject,
            html: messageData.content
          }
        });

        if (emailResponse.error) {
          console.error("Edge function error:", emailResponse.error);
          throw emailResponse.error;
        }
      }

      if (messageData.scheduled_date) {
        // Store scheduled message in the scheduled_messages table
        await scheduledMessageService.scheduleMessage({
          association_id: messageData.association_id,
          subject: messageData.subject,
          content: messageData.content,
          recipient_groups: messageData.recipient_groups,
          type: messageData.type,
          scheduled_date: messageData.scheduled_date,
          category: messageData.category || 'general'
        });
        
        return { success: true };
      } else {
        // For immediate send
        console.log('Sending message immediately:', messageData);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};
