
import React from 'react';
import { MessagePreviewProps } from '@/types/message-form-types';

const MessagePreview: React.FC<MessagePreviewProps> = ({
  subject,
  content,
  type,
  category
}) => {
  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block font-medium">Subject</label>
          {type === 'email' ? (
            <span className="text-sm text-muted-foreground">Email Message</span>
          ) : (
            <span className="text-sm text-muted-foreground">SMS Message</span>
          )}
        </div>
        <div className="p-3 border rounded-md">
          {subject || <span className="text-muted-foreground">No subject</span>}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block font-medium">Message Content (Preview)</label>
          <span className="text-sm text-muted-foreground">Category: {category}</span>
        </div>
        <div className="p-3 border rounded-md min-h-[300px] whitespace-pre-wrap">
          {content || <span className="text-muted-foreground">No content</span>}
        </div>
      </div>
    </>
  );
};

export default MessagePreview;
