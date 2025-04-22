
import { MessageHistoryItem } from '@/components/communications/MessageHistoryTable';

export interface MessageTemplate {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'email' | 'sms';
}

// Mock templates for the templates tab
export const mockTemplates: MessageTemplate[] = [
  {
    id: '1',
    title: 'Welcome New Resident',
    description: 'Introduction email for new residents with community guidelines and important contacts.',
    date: '2025-03-15',
    type: 'email' 
  },
  {
    id: '2',
    title: 'Maintenance Notice',
    description: 'Template for upcoming maintenance work in the community.',
    date: '2025-02-28',
    type: 'email'
  },
  {
    id: '3',
    title: 'Emergency Alert',
    description: 'Short text message for urgent community notifications.',
    date: '2025-03-01',
    type: 'sms'
  },
  {
    id: '4',
    title: 'Payment Reminder',
    description: 'Friendly reminder about upcoming HOA dues.',
    date: '2025-03-10',
    type: 'email'
  }
];

// Mock data for the message history table
export const mockHistoryData: MessageHistoryItem[] = [
  {
    id: '1',
    subject: 'Community Meeting Reminder',
    type: 'email',
    recipients: 145,
    sentDate: '2025-04-01',
    status: 'sent',
    openRate: 72
  },
  {
    id: '2',
    subject: 'Upcoming Pool Closure',
    type: 'email',
    recipients: 145,
    sentDate: '2025-03-25',
    status: 'sent',
    openRate: 68
  },
  {
    id: '3',
    subject: 'Maintenance Update',
    type: 'sms',
    recipients: 132,
    sentDate: '2025-04-05',
    status: 'scheduled'
  },
  {
    id: '4',
    subject: 'Emergency Water Shutdown',
    type: 'sms',
    recipients: 145,
    sentDate: '2025-03-15',
    status: 'sent',
    openRate: 91
  },
  {
    id: '5',
    subject: 'Failed Newsletter',
    type: 'email',
    recipients: 145,
    sentDate: '2025-03-10',
    status: 'failed'
  }
];
