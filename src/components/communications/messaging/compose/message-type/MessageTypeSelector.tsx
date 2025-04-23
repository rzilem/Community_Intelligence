
import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { MessageTypeButton } from './MessageTypeButton';

interface MessageTypeSelectorProps {
  selectedType: 'email' | 'sms';
  onTypeChange: (type: 'email' | 'sms') => void;
}

export const MessageTypeSelector: React.FC<MessageTypeSelectorProps> = ({
  selectedType,
  onTypeChange
}) => {
  return (
    <div className="space-y-2">
      <label className="block font-medium">Message Type</label>
      <div className="flex gap-3">
        <MessageTypeButton
          type="email"
          isSelected={selectedType === 'email'}
          onSelect={() => onTypeChange('email')}
          icon={Mail}
          label="Email"
        />
        <MessageTypeButton
          type="sms"
          isSelected={selectedType === 'sms'}
          onSelect={() => onTypeChange('sms')}
          icon={MessageSquare}
          label="SMS"
        />
      </div>
    </div>
  );
};
