
import React from 'react';
import { Card } from '@/components/ui/card';
import OriginalEmailTab from '@/components/homeowners/detail/tabs/OriginalEmailTab';

interface InvoicePreviewProps {
  htmlContent?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ htmlContent }) => {
  return (
    <Card className="h-full">
      <div className="bg-gray-50 px-4 py-3 border-b font-medium">
        Invoice Preview
      </div>
      <div className="p-0 h-[calc(100%-48px)]">
        <OriginalEmailTab 
          htmlContent={htmlContent} 
          fullscreenEmail={false}
          setFullscreenEmail={() => {}}
        />
      </div>
    </Card>
  );
};
