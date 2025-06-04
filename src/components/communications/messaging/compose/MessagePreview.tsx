
import React from 'react';

interface MessagePreviewProps {
  subject: string;
  content: string;
  messageType: 'email' | 'sms';
}

const MessagePreview: React.FC<MessagePreviewProps> = ({
  subject,
  content,
  messageType
}) => {
  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block font-medium">Subject</label>
          {messageType === 'sms' && (
            <span className="text-sm text-muted-foreground">SMS messages don't use subjects</span>
          )}
        </div>
        <div className="p-3 border rounded-md">
          {messageType === 'email' ? (
            subject || <span className="text-muted-foreground">No subject</span>
          ) : (
            <span className="text-muted-foreground">N/A for SMS</span>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block font-medium">Message Content (Preview)</label>
        </div>
        <div className="p-3 border rounded-md min-h-[300px] whitespace-pre-wrap">
          {content || <span className="text-muted-foreground">No content</span>}
        </div>
      </div>
    </>
  );
};

export default MessagePreview;
