
import { supabase } from '@/integrations/supabase/client';
import { MessageCategory } from '@/types/communication-types';

export const scheduledMessageService = {
  scheduleMessage: async (messageData: {
    association_id: string;
    subject: string;
    content: string;
    recipient_groups: string[];
    type: string;
    scheduled_date: string;
    category?: MessageCategory;
  }) => {
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
      });

    if (error) {
      throw error;
    }

    return data;
  },

  getScheduledMessages: async (associationId: string) => {
    const { data, error } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('association_id', associationId)
      .eq('sent', false)
      .order('scheduled_date', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }
};
