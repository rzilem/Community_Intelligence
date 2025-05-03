
import React from 'react';
import { AlertTriangle, ExternalLink, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NoPreviewStateProps {
  pdfUrl?: string;
  onExternalOpen?: () => void;
  onManualUpload?: () => void;
  message?: string;
  pdfMentioned?: boolean;
}

export const NoPreviewState: React.FC<NoPreviewStateProps> = ({ 
  pdfUrl,
  onExternalOpen,
  onManualUpload,
  message,
  pdfMentioned
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
      <AlertTriangle className="h-12 w-12 mb-4 text-amber-500" />
      <p className="text-center font-medium mb-2">
        {message || "PDF Not Found in Email"}
      </p>
      <p className="text-center text-sm mb-4">
        {pdfMentioned 
          ? "The system detected a mention of an attached PDF but couldn't find or process the actual attachment."
          : "No preview content is available for this invoice."}
      </p>
      {pdfUrl && (
        <Button 
          variant="outline" 
          onClick={onExternalOpen}
          className="mb-4 flex items-center"
        >
          Try Opening PDF Directly <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      )}
      {onManualUpload && (
        <Button 
          variant="outline" 
          onClick={onManualUpload}
          className="mb-4 flex items-center"
        >
          Upload PDF Manually <Upload className="h-4 w-4 ml-2" />
        </Button>
      )}
      <p className="text-center text-xs text-muted-foreground max-w-md">
        {pdfMentioned 
          ? "The email body text was found but any PDF attachment mentioned in the email was not properly processed."
          : "You can still process this invoice manually by entering details in the form."}
        You can still process this manually by entering invoice details in the form.
      </p>
    </div>
  );
};
