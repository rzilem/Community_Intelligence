
import { useState } from 'react';
import { MessageCategory } from '@/types/communication-types';
import { MessageSendResponse } from '@/types/messaging-types';
import { messageService } from '@/services/messaging';
import { toast } from 'sonner';

export interface UseMessageOptions {
  initialType?: 'email' | 'sms';
  initialCategory?: MessageCategory;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export interface UseMessageReturn {
  // Form state
  messageType: 'email' | 'sms';
  subject: string;
  content: string;
  selectedGroups: string[];
  associationId: string;
  category: MessageCategory;
  
  // Loading state
  isLoading: boolean;
  
  // Schedule state
  isScheduled: boolean;
  scheduledDate: Date | null;
  
  // Actions
  setMessageType: (type: 'email' | 'sms') => void;
  setSubject: (subject: string) => void;
  setContent: (content: string) => void;
  setSelectedGroups: (groups: string[]) => void;
  setAssociationId: (id: string) => void;
  setCategory: (category: MessageCategory) => void;
  toggleSchedule: () => void;
  setScheduledDate: (date: Date | null) => void;
  sendMessage: () => Promise<MessageSendResponse>;
  reset: () => void;
  
  // Validation
  canSend: boolean;
  validationErrors: string[];
}

/**
 * Hook for managing message state and actions
 */
export function useMessage({
  initialType = 'email',
  initialCategory = 'general',
  onSuccess,
  onError
}: UseMessageOptions = {}): UseMessageReturn {
  // Core message state
  const [messageType, setMessageType] = useState<'email' | 'sms'>(initialType);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [associationId, setAssociationId] = useState('');
  const [category, setCategory] = useState<MessageCategory>(initialCategory);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Schedule state
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  
  // Validation
  const validationErrors: string[] = [];
  if (!subject) validationErrors.push('Subject is required');
  if (!content) validationErrors.push('Message content is required');
  if (selectedGroups.length === 0) validationErrors.push('At least one recipient group must be selected');
  if (isScheduled && !scheduledDate) validationErrors.push('Scheduled date is required when scheduling a message');
  if (!associationId) validationErrors.push('Association must be selected');
  
  const canSend = validationErrors.length === 0;
  
  const toggleSchedule = () => {
    setIsScheduled(prevScheduled => {
      const newScheduled = !prevScheduled;
      // When enabling scheduling, set a default date if none is set
      if (newScheduled && !scheduledDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setScheduledDate(tomorrow);
      }
      return newScheduled;
    });
  };
  
  const sendMessage = async (): Promise<MessageSendResponse> => {
    if (!canSend) {
      const errorMessage = validationErrors.join('. ');
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
    
    setIsLoading(true);
    
    try {
      const response = await messageService.sendMessage({
        subject,
        content,
        type: messageType,
        association_id: associationId,
        recipient_groups: selectedGroups,
        scheduled_date: isScheduled && scheduledDate ? scheduledDate.toISOString() : undefined,
        category
      });
      
      if (response.success) {
        toast.success(isScheduled ? 'Message scheduled successfully' : 'Message sent successfully');
        onSuccess?.();
      } else {
        toast.error(response.message || 'Failed to send message');
        onError?.(response.error);
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Error sending message: ${errorMessage}`);
      onError?.(error);
      return { 
        success: false, 
        message: errorMessage,
        error
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  const reset = () => {
    setSubject('');
    setContent('');
    setSelectedGroups([]);
    setIsScheduled(false);
    setScheduledDate(null);
    setCategory(initialCategory);
  };
  
  return {
    // Form state
    messageType,
    subject,
    content,
    selectedGroups,
    associationId,
    category,
    
    // Loading state
    isLoading,
    
    // Schedule state
    isScheduled,
    scheduledDate,
    
    // Actions
    setMessageType,
    setSubject,
    setContent,
    setSelectedGroups,
    setAssociationId,
    setCategory,
    toggleSchedule,
    setScheduledDate,
    sendMessage,
    reset,
    
    // Validation
    canSend,
    validationErrors
  };
}
