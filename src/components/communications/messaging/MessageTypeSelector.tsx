
import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageTypeSelectorProps {
  messageType: 'email' | 'sms';
  onChange: (type: 'email' | 'sms') => void;
}

const MessageTypeSelector: React.FC<MessageTypeSelectorProps> = ({ 
  messageType, 
  onChange 
}) => {
  return (
    <div className="space-y-2">
      <label className="block font-medium">Message Type</label>
      <div className="flex gap-3">
        <Button 
          type="button" 
          variant={messageType === 'email' ? 'default' : 'outline'}
          className={`flex-1 gap-2 ${messageType === 'email' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          onClick={() => onChange('email')}
        >
          <Mail className="h-5 w-5" />
          Email
        </Button>
        <Button 
          type="button" 
          variant={messageType === 'sms' ? 'default' : 'outline'}
          className="flex-1 gap-2"
          onClick={() => onChange('sms')}
        >
          <MessageSquare className="h-5 w-5" />
          SMS
        </Button>
      </div>
    </div>
  );
};

export default MessageTypeSelector;
