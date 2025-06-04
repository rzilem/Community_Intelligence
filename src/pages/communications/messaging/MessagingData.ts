import { MessageHistory } from '@/services/communications/message-service';

// We'll keep templates as they might be stored locally or in a different table
export interface MessageTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'email' | 'sms';
  lastUpdated: string;
  category: string;
}

// Mock templates for now - these could come from a templates table later
export const mockTemplates: MessageTemplate[] = [
  {
    id: '1',
    title: 'Welcome to the Community',
    description: 'A warm welcome message for new residents',
    content: 'Dear {{resident.name}},\n\nWelcome to {{association.name}}! We\'re excited to have you as part of our community.',
    type: 'email',
    lastUpdated: '2024-01-15',
    category: 'welcome'
  },
  {
    id: '2',
    title: 'HOA Fee Reminder',
    description: 'Monthly reminder for HOA fee payments',
    content: 'Dear {{resident.name}},\n\nThis is a friendly reminder that your HOA fee of ${{payment.amount}} is due on {{payment.dueDate}}.',
    type: 'email',
    lastUpdated: '2024-01-10',
    category: 'payments'
  },
  {
    id: '3',
    title: 'Maintenance Notice',
    description: 'General maintenance notification',
    content: 'Dear Residents,\n\nPlease be advised that maintenance work will be performed in the community on [DATE]. We appreciate your patience.',
    type: 'email',
    lastUpdated: '2024-01-08',
    category: 'maintenance'
  },
  {
    id: '4',
    title: 'Emergency Alert',
    description: 'Quick SMS alert for emergencies',
    content: 'ALERT: {{compliance.violation}} reported at {{property.address}}. Please contact management immediately.',
    type: 'sms',
    lastUpdated: '2024-01-05',
    category: 'emergency'
  }
];

// Export an empty array for history - this will be populated from the database
export const mockHistoryData: MessageHistory[] = [];
