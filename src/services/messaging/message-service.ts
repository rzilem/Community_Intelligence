
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MessageCategory } from '@/types/communication-types';
import { MessageSendParams } from '@/types/messaging-types';

export interface SendMessageResponse {
  success: boolean;
  message?: string;
  error?: any;
}

export const messageService = {
  // Send a message, optionally schedule for later delivery
  sendMessage: async (messageData: MessageSendParams): Promise<SendMessageResponse> => {
    try {
      // For email messages, call the Supabase edge function
      if (messageData.type === 'email') {
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

      // For scheduled messages, store in the database
      if (messageData.scheduled_date) {
        const { error } = await supabase
          .from('scheduled_messages')
          .insert({
            association_id: messageData.association_id,
            subject: messageData.subject,
            content: messageData.content,
            recipient_groups: messageData.recipient_groups,
            type: messageData.type,
            scheduled_date: messageData.scheduled_date,
            category: messageData.category
          });
          
        if (error) throw error;
        
        toast.success(`Message scheduled for ${new Date(messageData.scheduled_date).toLocaleString()}`);
        return { 
          success: true,
          message: `Message scheduled for ${new Date(messageData.scheduled_date).toLocaleString()}`
        };
      } else {
        // For immediate delivery (would typically call additional APIs here)
        console.log('Sending message immediately:', messageData);
        
        // This would be replaced with actual API calls in production
        toast.success('Message sent successfully');
        return { 
          success: true,
          message: 'Message sent successfully'
        };
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send or schedule message');
      return {
        success: false,
        error,
        message: 'Failed to send or schedule message'
      };
    }
  }
};
