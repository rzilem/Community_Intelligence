
import React from 'react';
import MessageTypeSelector from '../MessageTypeSelector';

interface MessageHeaderProps {
  messageType: 'email' | 'sms';
  onTypeChange: (type: 'email' | 'sms') => void;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({ 
  messageType, 
  onTypeChange 
}) => {
  return (
    <MessageTypeSelector 
      messageType={messageType} 
      onChange={onTypeChange} 
    />
  );
};

export default MessageHeader;
