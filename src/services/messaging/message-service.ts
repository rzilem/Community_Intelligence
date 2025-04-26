
import { supabase } from '@/integrations/supabase/client';
import { MessageCategory } from '@/types/communication-types';
import { MessageSendParams, MessageSendResponse } from '@/types/messaging-types';
import { scheduledMessageService } from './scheduled-message-service';

/**
 * Service for sending messages via email or SMS
 */
export const messageService = {
  /**
   * Send a message, optionally schedule it for later delivery
   * @param messageData The message data to send
   * @returns Response indicating success or failure
   */
  sendMessage: async (messageData: MessageSendParams): Promise<MessageSendResponse> => {
    try {
      // For email messages, call the Supabase edge function
      if (messageData.type === 'email') {
        const emailResponse = await supabase.functions.invoke('send-email', {
          body: {
            to: messageData.recipient_groups, // Array of recipient emails
            subject: messageData.subject,
            html: messageData.content
          }
        });

        if (emailResponse.error) {
          console.error("Edge function error:", emailResponse.error);
          throw new Error(emailResponse.error.message || 'Failed to send email');
        }
      }

      // For SMS messages, would call a different edge function
      if (messageData.type === 'sms') {
        // Note: Not implemented yet
        console.log('SMS sending not yet implemented');
      }

      // For scheduled messages, store in the database
      if (messageData.scheduled_date) {
        await scheduledMessageService.scheduleMessage({
          association_id: messageData.association_id,
          subject: messageData.subject,
          content: messageData.content,
          recipient_groups: messageData.recipient_groups,
          type: messageData.type,
          scheduled_date: messageData.scheduled_date,
          category: messageData.category || 'general'
        });
        
        return { 
          success: true,
          message: `Message scheduled for ${new Date(messageData.scheduled_date).toLocaleString()}`
        };
      } else {
        // For immediate delivery
        console.log('Sending message immediately:', messageData);
        
        // In a production environment, we would make actual API calls here
        return { 
          success: true,
          message: 'Message sent successfully'
        };
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error,
        message: 'Failed to send or schedule message'
      };
    }
  },
  
  /**
   * Get message history for an association
   * @param associationId The ID of the association
   * @returns Array of message history items
   */
  getMessageHistory: async (associationId: string) => {
    try {
      const { data, error } = await supabase
        .from('message_history')
        .select('*')
        .eq('association_id', associationId)
        .order('sent_at', { ascending: false });
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching message history:', error);
      return { data: null, error };
    }
  }
};
