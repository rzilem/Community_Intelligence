
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';

interface EnhancedInvoicePreviewProps {
  pdfUrl?: string;
  htmlContent?: string;
  emailContent?: string;
}

const EnhancedInvoicePreview: React.FC<EnhancedInvoicePreviewProps> = React.memo(({
  pdfUrl,
  htmlContent,
  emailContent
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <InvoicePreview
          pdfUrl={pdfUrl}
          htmlContent={htmlContent}
          emailContent={emailContent}
        />
      </CardContent>
    </Card>
  );
});

EnhancedInvoicePreview.displayName = 'EnhancedInvoicePreview';

export default EnhancedInvoicePreview;
