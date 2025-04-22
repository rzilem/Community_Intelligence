
export interface MessageHistoryItem {
  id: string;
  subject: string;
  content: string;
  type: 'email' | 'sms';
  status: 'sent' | 'scheduled' | 'failed' | 'draft';
  sentAt: string;
  scheduledFor?: string;
  recipientCount: number;
  deliveredCount?: number;
  openedCount?: number;
  clickedCount?: number;
  recipientGroups: string[];
}
