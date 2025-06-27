
import React from 'react';
import { PdfLoader } from './PdfLoader';

interface PdfViewerProps {
  pdfUrl: string;
  isLoading: boolean;
  onLoadSuccess: () => void;
  onLoadError: () => void;
  onExternalOpen: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  isLoading,
  onLoadSuccess,
  onLoadError,
  onExternalOpen
}) => (
  <div className="w-full h-full relative">
    {isLoading && <PdfLoader onExternalOpen={onExternalOpen} />}
    
    <iframe
      src={pdfUrl}
      width="100%"
      height="100%"
      onLoad={onLoadSuccess}
      onError={onLoadError}
      className="border-0"
      title="PDF Document"
    />
  </div>
);
