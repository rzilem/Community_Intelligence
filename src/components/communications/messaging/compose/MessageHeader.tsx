
import React from 'react';
import MessageTypeSelector from '../MessageTypeSelector';
import { Button } from '@/components/ui/button';

interface MessageHeaderProps {
  messageType: 'email' | 'sms';
  onMessageTypeChange: (type: 'email' | 'sms') => void;
  previewMode: boolean;
  onTogglePreview: () => void;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({ 
  messageType, 
  onMessageTypeChange,
  previewMode,
  onTogglePreview
}) => {
  return (
    <div className="flex justify-between items-center">
      <MessageTypeSelector 
        messageType={messageType} 
        onChange={onMessageTypeChange} 
      />
      <Button 
        variant="outline" 
        onClick={onTogglePreview}
      >
        {previewMode ? 'Edit Message' : 'Preview with Sample Data'}
      </Button>
    </div>
  );
};

export default MessageHeader;
