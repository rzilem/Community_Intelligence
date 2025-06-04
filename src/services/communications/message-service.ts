
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getNextTrackingNumber, registerCommunication } from '@/services/tracking-service';

export interface MessageData {
  subject: string;
  content: string;
  association_id: string;
  recipient_groups: string[];
  type: 'email' | 'sms';
  scheduled_date?: string;
}

export interface MessageHistory {
  id: string;
  subject: string;
  content: string;
  type: 'email' | 'sms';
  recipients: number;
  sent_date: string;
  status: 'sent' | 'scheduled' | 'failed';
  association_id: string;
  tracking_number?: string;
}

interface MessageMetadata {
  [key: string]: any;
  subject?: string;
  content?: string;
  type?: string;
  association_id?: string;
  recipient_groups?: string[];
  scheduled_date?: string;
}

export const messageService = {
  // Send a message
  sendMessage: async (messageData: MessageData): Promise<{ success: boolean; trackingNumber?: string }> => {
    try {
      console.log('Sending message:', messageData);
      
      // Generate tracking number
      const trackingNumber = await getNextTrackingNumber();
      
      // Insert message into communications_log table
      const { data: logEntry, error: logError } = await supabase
        .from('communications_log')
        .insert({
          tracking_number: trackingNumber,
          communication_type: 'message',
          status: 'received',
          metadata: {
            subject: messageData.subject,
            content: messageData.content,
            type: messageData.type,
            association_id: messageData.association_id,
            recipient_groups: messageData.recipient_groups,
            scheduled_date: messageData.scheduled_date
          } as MessageMetadata
        })
        .select()
        .single();

      if (logError) {
        console.error('Error logging message:', logError);
        throw new Error(`Failed to log message: ${logError.message}`);
      }

      // For now, we'll mark it as sent immediately
      // In a real implementation, this would be handled by a background job
      await supabase
        .from('communications_log')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', logEntry.id);

      console.log('Message sent successfully with tracking number:', trackingNumber);
      return { success: true, trackingNumber };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get message history
  getMessageHistory: async (associationId?: string): Promise<MessageHistory[]> => {
    try {
      let query = supabase
        .from('communications_log')
        .select('*')
        .eq('communication_type', 'message')
        .order('created_at', { ascending: false });

      if (associationId) {
        query = query.eq('metadata->>association_id', associationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching message history:', error);
        throw new Error(`Failed to fetch message history: ${error.message}`);
      }

      return (data || []).map(log => {
        const metadata = (log.metadata as MessageMetadata) || {};
        return {
          id: log.id,
          subject: metadata.subject || 'No Subject',
          content: metadata.content || '',
          type: (metadata.type as 'email' | 'sms') || 'email',
          recipients: metadata.recipient_groups?.length || 0,
          sent_date: log.processed_at || log.created_at,
          status: log.status === 'completed' ? 'sent' : 
                  log.status === 'failed' ? 'failed' : 'scheduled',
          association_id: metadata.association_id || '',
          tracking_number: log.tracking_number
        };
      });
    } catch (error) {
      console.error('Error in getMessageHistory:', error);
      return [];
    }
  },

  // Resend a failed message
  resendMessage: async (messageId: string): Promise<{ success: boolean }> => {
    try {
      // Get the original message data
      const { data: originalMessage, error: fetchError } = await supabase
        .from('communications_log')
        .select('*')
        .eq('id', messageId)
        .single();

      if (fetchError || !originalMessage) {
        throw new Error('Message not found');
      }

      const metadata = (originalMessage.metadata as MessageMetadata) || {};

      // Create a new message with the same data
      const messageData: MessageData = {
        subject: metadata.subject || '',
        content: metadata.content || '',
        association_id: metadata.association_id || '',
        recipient_groups: metadata.recipient_groups || [],
        type: (metadata.type as 'email' | 'sms') || 'email'
      };

      const result = await messageService.sendMessage(messageData);
      
      if (result.success) {
        toast.success('Message resent successfully');
      }
      
      return result;
    } catch (error) {
      console.error('Error resending message:', error);
      toast.error('Failed to resend message');
      throw error;
    }
  }
};
