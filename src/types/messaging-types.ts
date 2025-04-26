
import { MessageCategory } from './communication-types';

export interface MessageSendParams {
  subject: string;
  content: string;
  association_id: string;
  recipient_groups: string[];
  type: 'email' | 'sms';
  scheduled_date?: string;
  category?: MessageCategory;
}

export interface MessageSendResponse {
  success: boolean;
  message?: string;
  error?: any;
}
