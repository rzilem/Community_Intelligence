
import React from 'react';
import { ExternalLink, Download, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PdfAccessScreenProps {
  pdfUrl: string;
  onExternalOpen: () => void;
  onFallbackToHtml?: () => void;
}

export const PdfAccessScreen: React.FC<PdfAccessScreenProps> = ({
  pdfUrl,
  onExternalOpen,
  onFallbackToHtml
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'invoice.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">PDF Document Ready</h3>
          <p className="text-gray-600">
            Choose how you'd like to view this PDF document. We recommend using the processed content view for the best experience.
          </p>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Why not embedded?</strong> Modern browsers block embedded PDFs for security. 
            External viewing provides the best experience.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button 
            onClick={onExternalOpen} 
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <ExternalLink className="h-5 w-5" />
            Open PDF in New Tab
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDownload} 
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="h-5 w-5" />
            Download PDF
          </Button>
          
          {onFallbackToHtml && (
            <Button 
              variant="outline" 
              onClick={onFallbackToHtml} 
              className="w-full flex items-center justify-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
            >
              <FileText className="h-5 w-5" />
              View Processed Content (Recommended)
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 <strong>Tip:</strong> The processed content view shows the same information in a more accessible format.</p>
          <p>🔒 PDF opens in a new tab for security and compatibility.</p>
        </div>
      </div>
    </div>
  );
};
