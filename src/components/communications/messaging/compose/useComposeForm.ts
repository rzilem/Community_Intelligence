import { useState } from 'react';
import { toast } from 'sonner';
import { communicationService } from '@/services/communication-service';
import { replaceMergeTags } from '@/utils/mergeTags';
import { ResidentType } from '@/types/resident-types';
import { MessageCategory } from '@/types/communication-types';

// Add new: categories consistent with enum in DB
const MESSAGE_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'events', label: 'Events' },
  { value: 'financial', label: 'Financial' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'community', label: 'Community News' },
];

export interface ComposeFormState {
  messageType: 'email' | 'sms';
  subject: string;
  messageContent: string;
  selectedGroups: string[];
  selectedAssociationId: string;
  isLoading: boolean;
  previewMode: boolean;
  scheduleMessage: boolean;
  scheduledDate: Date | null;
  previewData: {
    resident: {
      name: string;
      email: string;
      phone: string;
      move_in_date: string;
      resident_type: ResidentType;
    };
    property: {
      address: string;
      unit_number: string;
      city: string;
      state: string;
      zip: string;
      property_type: string;
      square_feet: number;
    };
    association: {
      name: string;
      contact_email: string;
      phone: string;
      website: string;
      address: string;
      city: string;
      state: string;
      zip: string;
    };
    payment: {
      amount: number;
      dueDate: Date;
      lateFee: number;
      pastDue: number;
    };
    compliance: {
      violation: string;
      fine: number;
      deadline: Date;
    };
  };
  // New: category
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
  const [previewMode, setPreviewMode] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [category, setCategory] = useState<MessageCategory>('general'); // Fix here - explicit type
  const [previewData] = useState({
    resident: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '(512) 555-1234',
      move_in_date: '2022-06-15',
      resident_type: 'Owner' as ResidentType
    },
    property: {
      address: '123 Oak Lane',
      unit_number: '4B',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      property_type: 'Condo',
      square_feet: 1250
    },
    association: {
      name: 'Oakridge Estates',
      contact_email: 'info@oakridgeestates.org',
      phone: '(512) 555-9000',
      website: 'www.oakridgeestates.org',
      address: '500 Main Street, Suite 300',
      city: 'Austin',
      state: 'TX',
      zip: '78701'
    },
    payment: {
      amount: 350,
      dueDate: new Date('2025-05-01'),
      lateFee: 25,
      pastDue: 725
    },
    compliance: {
      violation: 'Landscaping',
      fine: 100,
      deadline: new Date('2025-05-15')
    }
  });

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
    setSelectedGroups([]); // Clear selected groups when association changes
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
      // Process merge tags in content before sending
      const processedContent = replaceMergeTags(messageContent, previewData);
      const processedSubject = replaceMergeTags(subject, previewData);

      await communicationService.sendMessage({
        subject: processedSubject,
        content: processedContent,
        association_id: selectedAssociationId,
        recipient_groups: selectedGroups,
        type: messageType,
        scheduled_date: scheduleMessage ? scheduledDate?.toISOString() : undefined,
        category // Pass along selected category which is now of type MessageCategory
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

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const toggleSchedule = () => {
    setScheduleMessage(!scheduleMessage);
    if (!scheduleMessage) {
      // When turning on scheduling, default to tomorrow at current time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledDate(tomorrow);
    }
  };

  const previewContent = previewMode
    ? replaceMergeTags(messageContent, previewData)
    : messageContent;

  const previewSubject = previewMode
    ? replaceMergeTags(subject, previewData)
    : subject;

  // Expose setCategory and categories for the form
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
    categories: MESSAGE_CATEGORIES
  };
}
