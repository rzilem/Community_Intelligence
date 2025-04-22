
// Mock data for message history and templates

export const mockHistoryData = [
  {
    id: '1',
    subject: 'Community Pool Closure Notice',
    type: 'email',
    recipients: 87,
    sentDate: 'Today, 10:30 AM',
    status: 'sent',
    openRate: 62
  },
  {
    id: '2',
    subject: 'Monthly HOA Payment Reminder',
    type: 'email',
    recipients: 145,
    sentDate: 'Yesterday, 9:15 AM',
    status: 'sent',
    openRate: 78
  },
  {
    id: '3',
    subject: 'Annual Meeting Announcement',
    type: 'email',
    recipients: 145,
    sentDate: '2025-04-15, 3:00 PM',
    status: 'scheduled',
  },
  {
    id: '4',
    subject: 'Maintenance Request Confirmation',
    type: 'sms',
    recipients: 1,
    sentDate: '2025-04-14, 2:45 PM',
    status: 'sent'
  },
  {
    id: '5',
    subject: 'Emergency Water Shutdown',
    type: 'sms',
    recipients: 145,
    sentDate: '2025-04-12, 7:30 AM',
    status: 'failed'
  }
];

export const mockTemplates = [
  {
    id: 'custom-1',
    title: 'Board Meeting Announcement',
    description: 'Standard template for announcing board meetings to residents',
    created_at: '2025-03-15',
    type: 'email'
  },
  {
    id: 'custom-2',
    title: 'Maintenance Confirmation',
    description: 'Confirmation of maintenance request receipt',
    created_at: '2025-02-28',
    type: 'email'
  },
  {
    id: 'custom-3',
    title: 'Payment Receipt',
    description: 'Confirmation of payment received',
    created_at: '2025-02-20',
    type: 'email'
  },
  {
    id: 'custom-4',
    title: 'Late Payment Reminder',
    description: 'Reminder for overdue payments',
    created_at: '2025-02-15',
    type: 'sms'
  },
  {
    id: 'custom-5',
    title: 'Package Delivery Notice',
    description: 'Notification of package delivery',
    created_at: '2025-02-10',
    type: 'sms'
  }
];
