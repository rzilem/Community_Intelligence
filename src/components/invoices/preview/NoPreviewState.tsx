
import React from 'react';
import { AlertCircle } from 'lucide-react';

export const NoPreviewState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
      <AlertCircle className="h-12 w-12 mb-4 text-muted-foreground/50" />
      <p className="text-center">No preview available for this invoice.</p>
      <p className="text-center text-sm mt-2">Try uploading a PDF or check if email content is available.</p>
    </div>
  );
};
