
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { scheduledMessageService } from './scheduled-message-service';

export const messageService = {
  // Send a message, optionally schedule to the new table
  sendMessage: async (messageData: {
    subject: string;
    content: string;
    association_id: string;
    recipient_groups: string[];
    type: 'email' | 'sms';
    scheduled_date?: string;
  }): Promise<{ success: boolean }> => {
    try {
      if (messageData.type === 'email') {
        // Call Supabase edge function to send email
        const emailResponse = await supabase.functions.invoke('send-email', {
          body: JSON.stringify({
            to: messageData.recipient_groups, // Assuming this is an email list
            subject: messageData.subject,
            html: messageData.content
          })
        });

        if (emailResponse.error) {
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
        });
        toast.success(`Message scheduled for ${new Date(messageData.scheduled_date).toLocaleString()}`);
        return { success: true };
      } else {
        // For immediate send
        console.log('Sending message immediately:', messageData);
        toast.success('Message sent successfully');
        return { success: true };
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send or schedule message');
      throw error;
    }
  }
};
