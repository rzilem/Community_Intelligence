
import React, { useEffect } from 'react';
import { PdfViewer } from './viewers/PdfViewer';
import { WordDocViewer } from './viewers/WordDocViewer';
import { HtmlContentViewer } from './viewers/HtmlContentViewer';
import { UnknownFileViewer } from './viewers/UnknownFileViewer';

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
  isPdf,
  isWordDocument,
  onIframeError,
  onIframeLoad,
  onExternalOpen,
}) => {
  // Log component props on mount and when they change
  useEffect(() => {
    console.group('DocumentViewer Props');
    console.log('pdfUrl:', pdfUrl || 'none');
    console.log('htmlContent:', htmlContent ? `${htmlContent.length} chars` : 'none');
    console.log('isPdf:', isPdf);
    console.log('isWordDocument:', isWordDocument);
    console.groupEnd();
  }, [pdfUrl, htmlContent, isPdf, isWordDocument]);

  // Prioritize PDF viewing when available
  if (pdfUrl && isPdf) {
    console.log('Displaying PDF content from URL:', pdfUrl);
    return (
      <PdfViewer
        pdfUrl={pdfUrl}
        onError={onIframeError}
        onLoad={onIframeLoad}
        onExternalOpen={onExternalOpen}
      />
    );
  }

  // Handle Word documents
  if (pdfUrl && isWordDocument) {
    console.log('Displaying Word document placeholder');
    return <WordDocViewer onExternalOpen={onExternalOpen} />;
  }

  // Handle other document types with URL but not PDF or Word
  if (pdfUrl && !isPdf && !isWordDocument) {
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
