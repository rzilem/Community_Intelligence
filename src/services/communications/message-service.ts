
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
        // For immediate send, just simulate delivery (placeholder)
        console.log('Sending message immediately:', messageData);
        // You may wish to add real backend/edge function for real send here
        await new Promise(resolve => setTimeout(resolve, 1000));
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
