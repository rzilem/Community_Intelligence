
import React from 'react';
import MessageSubjectField from '../MessageSubjectField';
import MessageContentField from '../MessageContentField';

interface MessageContentProps {
  subject: string;
  content: string;
  onSubjectChange: (subject: string) => void;
  onContentChange: (content: string) => void;
  onUseTemplate: () => void;
}

const MessageContent: React.FC<MessageContentProps> = ({
  subject,
  content,
  onSubjectChange,
  onContentChange,
  onUseTemplate
}) => {
  return (
    <>
      <MessageSubjectField 
        subject={subject} 
        onChange={onSubjectChange} 
        onUseTemplate={onUseTemplate} 
      />
      
      <MessageContentField 
        content={content} 
        onChange={onContentChange} 
      />
    </>
  );
};

export default MessageContent;
