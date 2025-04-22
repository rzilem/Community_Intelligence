
export type MessageType = 'email' | 'sms';
export type MessageStatus = 'delivered' | 'pending' | 'failed' | 'draft' | 'scheduled';

export interface MessageHistoryItem {
  id: string;
  subject: string;
  type: MessageType;
  recipients: number;
  sentDate: string;
  status: MessageStatus | string;
  openRate?: number;
}
