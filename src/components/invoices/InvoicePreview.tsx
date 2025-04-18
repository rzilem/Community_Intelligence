
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, FileText, Maximize2 } from 'lucide-react';
import OriginalEmailTab from '@/components/homeowners/detail/tabs/OriginalEmailTab';
import { Button } from '@/components/ui/button';

interface InvoicePreviewProps {
  htmlContent?: string;
  pdfUrl?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ htmlContent, pdfUrl }) => {
  const [fullscreenPreview, setFullscreenPreview] = React.useState(false);

  // Debug logs to see what data we're receiving
  React.useEffect(() => {
    console.log("InvoicePreview props:", { htmlContent: !!htmlContent, pdfUrl: pdfUrl || 'none' });
  }, [htmlContent, pdfUrl]);

  return (
    <Card className="h-full">
      <div className="bg-gray-50 px-4 py-3 border-b font-medium flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Invoice Preview
        </div>
        {(htmlContent || pdfUrl) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-8 w-8"
            onClick={() => setFullscreenPreview(!fullscreenPreview)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="p-0 h-[calc(100%-48px)] overflow-auto">
        {pdfUrl ? (
          <div className="w-full h-full">
            <iframe 
              src={pdfUrl}
              title="Invoice PDF"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>
        ) : htmlContent ? (
          <div className="h-full">
            <OriginalEmailTab 
              htmlContent={htmlContent} 
              fullscreenEmail={fullscreenPreview}
              setFullscreenEmail={setFullscreenPreview}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
            <AlertCircle className="h-12 w-12 mb-4 text-muted-foreground/50" />
            <p className="text-center">No preview available for this invoice.</p>
            <p className="text-center text-sm mt-2">Try uploading a PDF or check if the email HTML content is available.</p>
          </div>
        )}
      </div>
    </Card>
  );
};
