
import { supabase } from "@/integrations/supabase/client";

export const scheduledMessageService = {
  // Schedule a new message
  async scheduleMessage(data: {
    association_id: string;
    subject: string;
    content: string;
    recipient_groups: string[];
    type: 'email' | 'sms';
    scheduled_date: string;
  }) {
    const { error } = await supabase
      .from('scheduled_messages')
      .insert({
        association_id: data.association_id,
        subject: data.subject,
        content: data.content,
        recipient_groups: data.recipient_groups,
        type: data.type,
        scheduled_date: data.scheduled_date,
      });
    if (error) {
      throw error;
    }
    return { success: true };
  },

  // List not-yet-sent scheduled messages for an association
  async getScheduledMessages(associationId: string) {
    const { data, error } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('association_id', associationId)
      .eq('sent', false)
      .order('scheduled_date', { ascending: true });
    if (error) {
      throw error;
    }
    return data || [];
  }
};
