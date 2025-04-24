
import React from 'react';
import { FileText } from 'lucide-react';
import { PDFViewer } from './PDFViewer';

interface PreviewContentProps {
  pdfUrl?: string;
  htmlContent?: string;
}

export const PreviewContent: React.FC<PreviewContentProps> = ({
  pdfUrl,
  htmlContent
}) => {
  if (pdfUrl) {
    return (
      <div className="w-[600px] h-[400px] bg-white">
        <PDFViewer url={pdfUrl} />
      </div>
    );
  }

  if (htmlContent) {
    return (
      <div className="w-[600px] h-[400px] overflow-auto p-4 bg-white">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    );
  }

  return (
    <div className="w-[600px] h-[400px] flex items-center justify-center text-muted-foreground bg-white">
      <FileText className="h-12 w-12 text-muted-foreground/50" />
      <span className="ml-2">No preview available</span>
    </div>
  );
};
