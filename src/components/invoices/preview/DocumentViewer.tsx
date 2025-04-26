import React, { useState, useEffect, useRef } from 'react';
import { FileQuestion, RefreshCcw, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [iframeError, setIframeError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(Date.now()); // Force refresh key
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [attempt, setAttempt] = useState(1);
  const [viewerType, setViewerType] = useState<'direct' | 'pdfjs' | 'object' | 'embed'>('direct');

  const createProxyUrl = (url: string) => {
    if (!url) return '';

    let relativePath = '';
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split('/public/invoices/');
      relativePath = pathParts.length > 1 ? pathParts[1] : parsedUrl.pathname.split('/').pop() || '';
    } catch (e) {
      console.error('Failed to parse URL:', url, e);
      relativePath = url.split('/').pop() || '';
    }

    console.log(`Creating proxy URL for: ${url}, relative path: ${relativePath}`);

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);
    const uniqueKey = `${timestamp}-${randomId}-${attempt}`;

    return `https://cahergndkwfqltxyikyr.supabase.co/functions/v1/pdf-proxy?pdf=${encodeURIComponent(relativePath)}&t=${uniqueKey}`;
  };

  const proxyUrl = isPdf ? createProxyUrl(pdfUrl) : pdfUrl;

  const pdfJsUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(proxyUrl)}`;

  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(proxyUrl)}&embedded=true`;

  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('Failed to load document in iframe:', e);
    setIframeError(true);
    setLoading(false);
    if (onIframeError) onIframeError();

    if (viewerType === 'direct') {
      console.log('Direct viewing failed, switching to PDF.js');
      setViewerType('pdfjs');
      setLoading(true);
      setKey(Date.now());
    } else if (viewerType === 'pdfjs') {
      console.log('PDF.js viewing failed, switching to object tag');
      setViewerType('object');
      setLoading(true);
      setKey(Date.now());
    } else if (viewerType === 'object') {
      console.log('Object tag viewing failed, switching to embed tag');
      setViewerType('embed');
      setLoading(true);
      setKey(Date.now());
    }
  };

  const handleIframeLoad = () => {
    console.log('Document loaded successfully in iframe');
    setLoading(false);
    if (onIframeLoad) onIframeLoad();
  };

  useEffect(() => {
    setKey(Date.now());
    setLoading(true);
    setIframeError(false);

    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, trying alternate viewer');
        if (viewerType === 'direct') {
          setViewerType('pdfjs');
          setKey(Date.now());
        } else if (viewerType === 'pdfjs') {
          setViewerType('object');
          setKey(Date.now());
        } else if (viewerType === 'object') {
          setViewerType('embed');
          setKey(Date.now());
        } else if (viewerType === 'embed') {
          setIframeError(true);
          setLoading(false);
        }
      }
    }, 7000);

    return () => clearTimeout(loadingTimeout);
  }, [pdfUrl, proxyUrl, attempt, viewerType]);

  useEffect(() => {
    if (isPdf && pdfUrl) {
      const checkPdf = async () => {
        try {
          const response = await fetch(proxyUrl, {
            method: 'HEAD',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          console.log(`PDF HEAD check status: ${response.status}, Content-Type: ${response.headers.get('Content-Type')}`);
          if (response.ok) {
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/pdf')) {
              console.log('PDF confirmed accessible');
            } else {
              console.warn(`Unexpected Content-Type for PDF: ${contentType}`);
            }
          } else {
            console.error(`PDF not accessible: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error('Error checking PDF accessibility:', error);
        }
      };
      checkPdf();
    }
  }, [isPdf, pdfUrl, proxyUrl]);

  const handleRetry = () => {
    setAttempt(prev => prev + 1);
    setIframeError(false);
    setLoading(true);
    setViewerType('direct');
    setKey(Date.now());
  };

  const handleDownload = () => {
    if (isPdf && pdfUrl) {
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
    return <div className="flex flex-col items-center justify-center h-full">
        <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-center mb-4">
          Word documents cannot be previewed directly in the browser.
        </p>
        {onExternalOpen && <Button onClick={onExternalOpen} className="text-primary hover:underline flex items-center">
            Download document
          </Button>}
      </div>;
  }

  if (iframeError) {
    return <div className="flex flex-col items-center justify-center h-full">
        <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-center mb-4">
          Unable to preview this document. The file may be corrupted or not supported.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleRetry} className="text-primary hover:underline flex items-center mr-4" variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" /> Retry loading
          </Button>
          <Button onClick={handleDownload} className="text-primary hover:underline flex items-center mr-4" variant="outline">
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
          {onExternalOpen && <Button onClick={onExternalOpen} className="text-primary hover:underline flex items-center" variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" /> Open in new tab
            </Button>}
        </div>
      </div>;
  }

  if (isPdf) {
    if (loading) {
      return <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        </div>;
    }

    if (viewerType === 'direct') {
      return <div className="relative w-full h-full">
          <iframe ref={iframeRef} key={`direct-${key}`} className="w-full h-full border-0" src={proxyUrl} onError={handleIframeError} onLoad={handleIframeLoad} allowFullScreen title="PDF Preview" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-presentation" />
        </div>;
    }

    if (viewerType === 'pdfjs') {
      return <div className="relative w-full h-full">
          <iframe ref={iframeRef} key={`pdfjs-${key}`} className="w-full h-full border-0" src={pdfJsUrl} onError={handleIframeError} onLoad={handleIframeLoad} allowFullScreen title="PDF.js Document Preview" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-presentation" />
        </div>;
    }

    if (viewerType === 'object') {
      return <div className="relative w-full h-full">
          <object key={`object-${key}`} className="w-full h-full" data={proxyUrl} type="application/pdf" title="PDF Document Preview">
            <div className="flex flex-col items-center justify-center h-full p-4">
              <p className="mb-4 text-center">Unable to display PDF directly</p>
              {onExternalOpen && <Button onClick={onExternalOpen} variant="outline" className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" /> Open in new tab
                </Button>}
            </div>
          </object>
        </div>;
    }

    return <div className="relative w-full h-full">
        <embed key={`embed-${key}`} className="w-full h-full" src={googleDocsUrl} type="application/pdf" title="PDF Document Preview" />
      </div>;
  }

  return <iframe key={key} className="w-full h-full border-0" src={proxyUrl} onError={handleIframeError} onLoad={handleIframeLoad} allow="fullscreen" title="Document Preview" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-presentation" />;
};
