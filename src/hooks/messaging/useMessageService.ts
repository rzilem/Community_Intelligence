
import { useState } from 'react';
import { toast } from 'sonner';
import { messageService } from '@/services/communications/message-service';
import { MessageCategory } from '@/types/communication-types';

interface SendMessageParams {
  subject: string;
  content: string;
  type: 'email' | 'sms';
  association_id: string;
  recipient_groups: string[];
  scheduled_date?: string;
  category: MessageCategory;
}

export function useMessageService() {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (params: SendMessageParams) => {
    setIsLoading(true);
    try {
      await messageService.sendMessage(params);
      toast.success(params.scheduled_date ? 'Message scheduled successfully' : 'Message sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading
  };
}
