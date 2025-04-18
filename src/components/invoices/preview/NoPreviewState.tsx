
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NoPreviewState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
      <AlertTriangle className="h-12 w-12 mb-4 text-amber-500" />
      <p className="text-center font-medium mb-2">Invalid Invoice Content</p>
      <p className="text-center text-sm mb-4">
        The content doesn't appear to be a valid invoice. It may be a metadata file or misconfigured email content.
      </p>
      <p className="text-center text-xs text-muted-foreground max-w-md">
        Try uploading a proper invoice document or check if the email contains valid invoice information. 
        You can still process this manually by entering invoice details in the form.
      </p>
    </div>
  );
};
