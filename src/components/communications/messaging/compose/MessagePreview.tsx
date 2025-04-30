
import React from 'react';

interface MessagePreviewProps {
  subject: string;
  content: string;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({
  subject,
  content
}) => {
  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block font-medium">Subject</label>
        </div>
        <div className="p-3 border rounded-md">
          {subject || <span className="text-muted-foreground">No subject</span>}
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
