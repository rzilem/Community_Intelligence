
import { useState } from 'react';
import { toast } from 'sonner';
import { MessageCategory } from '@/types/communication-types';
import { MessageFormState, MessageFormActions } from '@/types/messaging-types';
import { useMessageCategory } from './useMessageCategory';
import { useMessagePreview } from './useMessagePreview';
import { useMessageScheduling } from './useMessageScheduling';
import { messageService } from '@/services/messaging/message-service';

export interface MessageComposeOptions {
  onMessageSent: () => void;
  initialAssociationId?: string;
  initialMessageType?: 'email' | 'sms';
}

export interface MessageComposeHook {
  state: MessageFormState;
  actions: MessageFormActions;
  // Additional properties from the sub-hooks
  previewContent: string;
  previewSubject: string;
  categories: { value: MessageCategory; label: string }[];
  // Computed helpers
  canSend: boolean;
}

export function useMessageCompose({
  onMessageSent,
  initialAssociationId = '',
  initialMessageType = 'email'
}: MessageComposeOptions): MessageComposeHook {
  // Form state
  const [messageType, setMessageType] = useState<'email' | 'sms'>(initialMessageType);
  const [subject, setSubject] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>(initialAssociationId);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sub-hooks for specialized functionality
  const { category, setCategory, categories } = useMessageCategory();
  
  const preview = useMessagePreview({
    subject,
    messageContent
  });
  
  const scheduling = useMessageScheduling();

  // Association change handler
  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
    // Reset groups when association changes
    setSelectedGroups([]);
  };

  // Send message handler
  const handleSendMessage = async () => {
    // Validate form
    if (!subject || !messageContent || selectedGroups.length === 0) {
      toast.error('Please fill out all required fields and select at least one recipient group');
      return;
    }
    
    if (scheduling.scheduleMessage && !scheduling.scheduledDate) {
      toast.error('Please select a date and time to schedule your message');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send the message using the service
      await messageService.sendMessage({
        subject: preview.previewSubject,
        content: preview.previewContent,
        association_id: selectedAssociationId,
        recipient_groups: selectedGroups,
        type: messageType,
        scheduled_date: scheduling.scheduleMessage ? scheduling.scheduledDate?.toISOString() : undefined,
        category: category
      });

      // Reset form after successful send
      setSubject('');
      setMessageContent('');
      setSelectedGroups([]);
      preview.setPreviewMode(false);
      scheduling.toggleSchedule(); // Reset scheduling
      scheduling.setScheduledDate(null);
      setCategory('general');
      
      // Notify parent
      onMessageSent();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form handler
  const handleReset = () => {
    setSubject('');
    setMessageContent('');
    setSelectedGroups([]);
    preview.setPreviewMode(false);
    scheduling.toggleSchedule(); // Reset scheduling
    scheduling.setScheduledDate(null); 
    setCategory('general');
  };

  // Calculate if the form can be submitted
  const canSend = Boolean(
    subject && 
    messageContent && 
    selectedGroups.length > 0 && 
    (!scheduling.scheduleMessage || scheduling.scheduledDate)
  );

  // Combine all state into a single object
  const state: MessageFormState = {
    messageType,
    subject,
    messageContent,
    selectedGroups,
    selectedAssociationId,
    isLoading,
    previewMode: preview.previewMode,
    scheduleMessage: scheduling.scheduleMessage,
    scheduledDate: scheduling.scheduledDate,
    category
  };

  // Combine all actions into a single object
  const actions: MessageFormActions = {
    setMessageType,
    setSubject,
    setMessageContent,
    setSelectedGroups,
    handleAssociationChange,
    setScheduledDate: scheduling.setScheduledDate,
    setCategory,
    togglePreview: preview.togglePreview,
    toggleSchedule: scheduling.toggleSchedule,
    handleSendMessage,
    handleReset
  };

  return {
    state,
    actions,
    previewContent: preview.previewContent,
    previewSubject: preview.previewSubject,
    categories,
    canSend
  };
}
