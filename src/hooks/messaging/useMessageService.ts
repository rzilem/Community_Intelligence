
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
      const result = await messageService.sendMessage(params);
      toast.success(params.scheduled_date ? 'Message scheduled successfully' : 'Message sent successfully');
      return true;
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      // Check for specific error types
      if (error.status === 401 || (error.error && error.error.includes('authorization'))) {
        errorMessage = 'Authentication error. Please log in again and retry.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast.error(errorMessage);
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
