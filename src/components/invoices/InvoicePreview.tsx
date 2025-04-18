
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, FileText } from 'lucide-react';
import OriginalEmailTab from '@/components/homeowners/detail/tabs/OriginalEmailTab';

interface InvoicePreviewProps {
  htmlContent?: string;
  pdfUrl?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ htmlContent, pdfUrl }) => {
  return (
    <Card className="h-full">
      <div className="bg-gray-50 px-4 py-3 border-b font-medium flex items-center">
        <FileText className="h-4 w-4 mr-2" />
        Invoice Preview
      </div>
      <div className="p-0 h-[calc(100%-48px)]">
        {pdfUrl ? (
          <div className="w-full h-full">
            <iframe 
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              title="Invoice PDF"
              className="w-full h-full border-0"
            />
          </div>
        ) : htmlContent ? (
          <OriginalEmailTab 
            htmlContent={htmlContent} 
            fullscreenEmail={false}
            setFullscreenEmail={() => {}}
          />
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
