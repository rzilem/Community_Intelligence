
import { useState } from 'react';
import { toast } from 'sonner';
import { communicationService } from '@/services/communication-service';
import { ResidentType } from '@/types/resident-types';
import { MessageCategory } from '@/types/communication-types';
import { useCategory } from './useCategory';
import { usePreview } from './usePreview';

// -----------------------------------------------------------
// Compose form central state & core handlers (excluding category and preview)

interface ComposeFormState {
  messageType: 'email' | 'sms';
  subject: string;
  messageContent: string;
  selectedGroups: string[];
  selectedAssociationId: string;
  isLoading: boolean;
  previewMode: boolean;
  scheduleMessage: boolean;
  scheduledDate: Date | null;
  previewData: any;
  category: MessageCategory;
}

interface UseComposeFormProps {
  onMessageSent: () => void;
}

export function useComposeForm({ onMessageSent }: UseComposeFormProps) {
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email');
  const [subject, setSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);

  // Category hook (split logic)
  const { category, setCategory, categories } = useCategory();
  // Preview hook (split logic)
  const {
    previewMode,
    setPreviewMode,
    togglePreview,
    previewContent,
    previewSubject,
    previewData
  } = usePreview(subject, messageContent);

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
    setSelectedGroups([]);
  };

  const handleSendMessage = async () => {
    if (!subject || !messageContent || selectedGroups.length === 0) {
      toast.error('Please fill out all required fields and select at least one recipient group');
      return;
    }
    if (scheduleMessage && !scheduledDate) {
      toast.error('Please select a date and time to schedule your message');
      return;
    }
    setIsLoading(true);
    try {
      await communicationService.sendMessage({
        subject: previewSubject,
        content: previewContent,
        association_id: selectedAssociationId,
        recipient_groups: selectedGroups,
        type: messageType,
        scheduled_date: scheduleMessage ? scheduledDate?.toISOString() : undefined,
        category
      });

      // Reset form
      setSubject('');
      setMessageContent('');
      setSelectedGroups([]);
      setPreviewMode(false);
      setScheduleMessage(false);
      setScheduledDate(null);
      setCategory('general');
      onMessageSent();
      toast.success(scheduleMessage ? 'Message scheduled successfully' : 'Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSubject('');
    setMessageContent('');
    setSelectedGroups([]);
    setPreviewMode(false);
    setScheduleMessage(false);
    setScheduledDate(null);
    setCategory('general');
  };

  const toggleSchedule = () => {
    setScheduleMessage((current) => {
      const next = !current;
      if (!current) {
        // When turning on scheduling, default to tomorrow at current time
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setScheduledDate(tomorrow);
      }
      return next;
    });
  };

  return {
    state: {
      messageType,
      subject,
      messageContent,
      selectedGroups,
      selectedAssociationId,
      isLoading,
      previewMode,
      scheduleMessage,
      scheduledDate,
      previewData,
      category
    },
    previewContent,
    previewSubject,
    setMessageType,
    setSubject,
    setMessageContent,
    setSelectedGroups,
    setScheduledDate,
    handleAssociationChange,
    handleSendMessage,
    handleReset,
    togglePreview,
    toggleSchedule,
    setCategory,
    categories
  };
}
