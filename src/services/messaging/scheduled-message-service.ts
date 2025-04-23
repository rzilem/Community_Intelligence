
import { supabase } from '@/integrations/supabase/client';
import { MessageCategory } from '@/types/communication-types';

/**
 * Service for managing scheduled messages
 */
export const scheduledMessageService = {
  /**
   * Schedule a message for future delivery
   * @param messageData The message data to schedule
   * @returns The created scheduled message
   */
  scheduleMessage: async (messageData: {
    association_id: string;
    subject: string;
    content: string;
    recipient_groups: string[];
    type: string;
    scheduled_date: string;
    category?: MessageCategory;
  }) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_messages')
        .insert({
          association_id: messageData.association_id,
          subject: messageData.subject,
          content: messageData.content,
          recipient_groups: messageData.recipient_groups,
          type: messageData.type,
          scheduled_date: messageData.scheduled_date,
          category: messageData.category || 'general'
        })
        .select();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error scheduling message:', error);
      return { data: null, error };
    }
  },

  /**
   * Get scheduled messages for an association
   * @param associationId The ID of the association
   * @returns Array of scheduled messages
   */
  getScheduledMessages: async (associationId: string) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_messages')
        .select('*')
        .eq('association_id', associationId)
        .eq('sent', false)
        .order('scheduled_date', { ascending: true });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching scheduled messages:', error);
      return { data: null, error };
    }
  },
  
  /**
   * Cancel a scheduled message
   * @param messageId ID of the scheduled message to cancel
   * @returns Success indicator
   */
  cancelScheduledMessage: async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_messages')
        .delete()
        .eq('id', messageId);
        
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error canceling scheduled message:', error);
      return { success: false, error };
    }
  }
};
