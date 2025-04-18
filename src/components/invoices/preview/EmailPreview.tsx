
import React from 'react';
import { Card } from "@/components/ui/card";

interface EmailPreviewProps {
  emailContent?: string;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ emailContent }) => {
  if (!emailContent) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-muted-foreground">
        No email content available
      </div>
    );
  }

  return (
    <Card className="p-4 h-full overflow-auto bg-white dark:bg-gray-800">
      <div 
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: emailContent }} 
      />
    </Card>
  );
};
