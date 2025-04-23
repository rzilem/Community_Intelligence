
import { MessageCategory } from './communication-types';

export interface MessageFormFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export interface MessageTypeButtonProps {
  type: 'email' | 'sms';
  isSelected: boolean;
  onSelect: () => void;
  icon: React.ComponentType;
  label: string;
  className?: string;
}

export interface MessagePreviewProps {
  subject: string;
  content: string;
  type: 'email' | 'sms';
  category: MessageCategory;
}

export interface MessageRecipientsProps {
  selectedGroups: string[];
  selectedAssociationId: string;
  onGroupsChange: (groups: string[]) => void;
  onAssociationChange: (id: string) => void;
}

export interface MessageFormActionsProps {
  isSubmitting: boolean;
  canSubmit: boolean;
  isScheduled: boolean;
  onSubmit: () => void;
  onReset: () => void;
  onPreviewToggle: () => void;
}

export interface MessageContextState {
  messageType: 'email' | 'sms';
  subject: string;
  content: string;
  selectedGroups: string[];
  selectedAssociationId: string;
  category: MessageCategory;
  isScheduled: boolean;
  scheduledDate: Date | null;
  previewMode: boolean;
}

export interface MessageContextValue extends MessageContextState {
  setMessageType: (type: 'email' | 'sms') => void;
  setSubject: (subject: string) => void;
  setContent: (content: string) => void;
  setSelectedGroups: (groups: string[]) => void;
  setSelectedAssociationId: (id: string) => void;
  setCategory: (category: MessageCategory) => void;
  toggleSchedule: () => void;
  setScheduledDate: (date: Date | null) => void;
  togglePreview: () => void;
  reset: () => void;
}
