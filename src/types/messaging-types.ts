
import { MessageCategory } from './communication-types';

export interface MessageFormState {
  messageType: 'email' | 'sms';
  subject: string;
  messageContent: string;
  selectedGroups: string[];
  selectedAssociationId: string;
  isLoading: boolean;
  previewMode: boolean;
  scheduleMessage: boolean;
  scheduledDate: Date | null;
  category: MessageCategory;
}

export interface MessageFormActions {
  setMessageType: (type: 'email' | 'sms') => void;
  setSubject: (subject: string) => void;
  setMessageContent: (content: string) => void;
  setSelectedGroups: (groups: string[]) => void;
  handleAssociationChange: (associationId: string) => void;
  setScheduledDate: (date: Date | null) => void;
  setCategory: (category: MessageCategory) => void;
  togglePreview: () => void;
  toggleSchedule: () => void;
  handleSendMessage: () => Promise<void>;
  handleReset: () => void;
}

export interface MessagePreviewData {
  resident: {
    name: string;
    email: string;
    phone: string;
    move_in_date: string;
    resident_type: string;
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
}

export interface MessageTemplateData {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'email' | 'sms';
  category: MessageCategory;
  createdAt: string;
  updatedAt: string;
}

export interface MessageSendParams {
  subject: string;
  content: string;
  association_id: string;
  recipient_groups: string[];
  type: 'email' | 'sms';
  scheduled_date?: string;
  category: MessageCategory;
}
