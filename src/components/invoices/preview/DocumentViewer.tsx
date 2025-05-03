
import React, { useEffect } from 'react';
import { PdfViewer } from './viewers/PdfViewer';
import { WordDocViewer } from './viewers/WordDocViewer';
import { HtmlContentViewer } from './viewers/HtmlContentViewer';
import { UnknownFileViewer } from './viewers/UnknownFileViewer';
import { isPdf, getFileExtension } from './utils/fileTypeUtils';

interface DocumentViewerProps {
  pdfUrl?: string;
  htmlContent?: string;
  isPdf: boolean;
  isWordDocument: boolean;
  onIframeError: () => void;
  onIframeLoad: () => void;
  onExternalOpen: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  pdfUrl,
  htmlContent,
  isPdf: isPdfProp,
  isWordDocument,
  onIframeError,
  onIframeLoad,
  onExternalOpen,
}) => {
  // Log component props on mount and when they change
  useEffect(() => {
    console.group('DocumentViewer Props');
    console.log('pdfUrl:', pdfUrl || 'none');
    console.log('normalized pdfUrl:', pdfUrl ? new URL(pdfUrl, window.location.origin).href : 'none');
    console.log('htmlContent:', htmlContent ? `${htmlContent.length} chars` : 'none');
    console.log('isPdf flag:', isPdfProp);
    console.log('isWordDocument flag:', isWordDocument);
    console.log('file extension:', getFileExtension(pdfUrl || ''));
    console.groupEnd();
  }, [pdfUrl, htmlContent, isPdfProp, isWordDocument]);

  // Create a consistent URL format for the PDF if it's a relative URL
  const getNormalizedUrl = (url?: string): string => {
    if (!url) return '';
    
    try {
      // If it's already an absolute URL, return it
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      // Handle relative URLs
      return new URL(url, window.location.origin).href;
    } catch (e) {
      console.error('Error normalizing URL:', e);
      return url;
    }
  };

  const normalizedPdfUrl = getNormalizedUrl(pdfUrl);
  const isPdfFile = pdfUrl ? isPdf(normalizedPdfUrl) : false;

  // Prioritize PDF viewing when available
  if (normalizedPdfUrl && (isPdfProp || isPdfFile)) {
    console.log('Displaying PDF content from URL:', normalizedPdfUrl);
    return (
      <PdfViewer
        pdfUrl={normalizedPdfUrl}
        onError={onIframeError}
        onLoad={onIframeLoad}
        onExternalOpen={onExternalOpen}
      />
    );
  }

  // Handle Word documents
  if (normalizedPdfUrl && isWordDocument) {
    console.log('Displaying Word document placeholder');
    return <WordDocViewer onExternalOpen={onExternalOpen} />;
  }

  // Handle other document types with URL but not PDF or Word
  if (normalizedPdfUrl && !isPdfProp && !isWordDocument) {
    console.log('Displaying unknown document type placeholder');
    return <UnknownFileViewer onExternalOpen={onExternalOpen} />;
  }

  // If we have HTML content, render it
  if (htmlContent) {
    console.log('Displaying HTML content');
    return (
      <HtmlContentViewer
        htmlContent={htmlContent}
        onError={onIframeError}
        onLoad={onIframeLoad}
      />
    );
  }

  // No content available
  console.log('No content to display');
  return null;
};
