
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
}

export interface MessagePreviewProps {
  subject: string;
  content: string;
  messageType: 'email' | 'sms';
  category: MessageCategory;
}

export interface RecipientSectionProps {
  selectedGroups: string[];
  associationId: string;
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
