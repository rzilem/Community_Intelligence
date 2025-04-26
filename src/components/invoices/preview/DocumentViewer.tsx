
import React from 'react';
import { useDocumentViewer } from './hooks/useDocumentViewer';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { WordDocumentState } from './components/WordDocumentState';

interface DocumentViewerProps {
  pdfUrl: string;
  htmlContent?: string;
  isPdf: boolean;
  isWordDocument?: boolean;
  onIframeError?: () => void;
  onIframeLoad?: () => void;
  onExternalOpen?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  pdfUrl,
  htmlContent,
  isPdf,
  isWordDocument = false,
  onIframeError,
  onIframeLoad,
  onExternalOpen
}) => {
  const {
    iframeError,
    loading,
    key,
    viewerType,
    proxyUrl,
    pdfJsUrl,
    googleDocsUrl,
    handleIframeError,
    handleIframeLoad,
    handleRetry
  } = useDocumentViewer({
    pdfUrl,
    isPdf,
    onIframeError,
    onIframeLoad
  });

  const handleDownload = () => {
    if (isPdf && proxyUrl) {
      const link = document.createElement('a');
      link.href = proxyUrl;
      link.target = '_blank';
      link.download = pdfUrl.split('/').pop() || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isWordDocument) {
    return <WordDocumentState onExternalOpen={onExternalOpen} />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (iframeError || !proxyUrl) {
    return (
      <ErrorState
        onRetry={handleRetry}
        onDownload={handleDownload}
        onExternalOpen={onExternalOpen}
        showDownload={isPdf && !!proxyUrl}
      />
    );
  }

  if (isPdf) {
    const viewerProps = {
      className: "w-full h-full border-0",
      onError: handleIframeError,
      onLoad: handleIframeLoad,
      sandbox: "allow-scripts allow-same-origin allow-popups allow-forms"
    };

    if (viewerType === 'direct') {
      return (
        <div className="relative w-full h-full">
          <iframe
            {...viewerProps}
            key={`direct-${key}`}
            src={proxyUrl}
            title="PDF Preview"
          />
        </div>
      );
    }

    if (viewerType === 'pdfjs') {
      return (
        <div className="relative w-full h-full">
          <iframe
            {...viewerProps}
            key={`pdfjs-${key}`}
            src={pdfJsUrl}
            title="PDF.js Preview"
          />
        </div>
      );
    }

    if (viewerType === 'object') {
      return (
        <div className="relative w-full h-full">
          <object
            key={`object-${key}`}
            className="w-full h-full"
            data={proxyUrl}
            type="application/pdf"
            title="PDF Preview"
          />
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        <embed
          key={`embed-${key}`}
          className="w-full h-full"
          src={googleDocsUrl}
          type="application/pdf"
          title="PDF Preview"
        />
      </div>
    );
  }

  if (htmlContent) {
    return (
      <iframe
        key={`html-${key}`}
        className="w-full h-full border-0"
        src={proxyUrl}
        onError={handleIframeError}
        onLoad={handleIframeLoad}
        title="Document Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    );
  }

  return <div>Cannot preview this content type.</div>;
};

