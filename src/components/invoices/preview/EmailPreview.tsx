
import React from 'react';
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { sanitizeHtml } from './utils/htmlUtils';

interface EmailPreviewProps {
  emailContent?: string;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ emailContent }) => {
  if (!emailContent || emailContent.trim() === '') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-muted-foreground">
        <Mail className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">No email content available</p>
        <p className="text-sm mt-2">This invoice may not have been received via email.</p>
      </div>
    );
  }

  return (
    <Card className="p-6 h-full overflow-auto bg-white dark:bg-gray-800 shadow-sm">
      <div 
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(emailContent) }} 
      />
    </Card>
  );
};
