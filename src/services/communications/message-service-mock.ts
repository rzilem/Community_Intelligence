// Mock implementation for message service

export interface MessageData {
  subject: string;
  content: string;
  association_id: string;
  recipient_groups: string[];
  type: 'email' | 'sms';
  scheduled_date?: string;
}

export interface MessageHistory {
  id: string;
  subject: string;
  content: string;
  type: 'email' | 'sms';
  recipients: number;
  sent_date: string;
  status: 'sent' | 'scheduled' | 'failed';
  association_id: string;
  tracking_number?: string;
}

export const messageService = {
  sendMessage: async (messageData: MessageData) => {
    console.log('MOCK: Sending message:', messageData);
    const trackingNumber = `MSG-${Date.now()}`;
    return { success: true, trackingNumber };
  },

  getMessageHistory: async (associationId?: string): Promise<MessageHistory[]> => {
    console.log('MOCK: Getting message history for:', associationId);
    return [
      {
        id: '1',
        subject: 'Test Message',
        content: 'This is a test message',
        type: 'email',
        recipients: 5,
        sent_date: new Date().toISOString(),
        status: 'sent',
        association_id: associationId || '1',
        tracking_number: 'MSG-123456'
      }
    ];
  },

  resendMessage: async (messageId: string) => {
    console.log('MOCK: Resending message:', messageId);
    return { success: true };
  }
};