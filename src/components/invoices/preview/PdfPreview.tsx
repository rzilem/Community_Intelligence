
import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'sonner';
import { FileText, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfPreviewProps {
  url: string;
  onError?: () => void;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ url, onError }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [debugMode, setDebugMode] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [normalizedUrl, setNormalizedUrl] = useState<string>('');

  // URL normalization function
  const normalizeUrlPath = (url: string): string => {
    if (!url) return '';
    
    try {
      // Check for double slashes and log
      if (url.includes('//') && !url.includes('://')) {
        console.warn('⚠️ PdfPreview: Double slash detected in URL that needs fixing:', url);
      }
      
      // For URLs with protocol, use URL parsing
      if (url.startsWith('http')) {
        const parsed = new URL(url);
        // Normalize pathname by replacing multiple slashes with a single one
        parsed.pathname = parsed.pathname.replace(/\/+/g, '/');
        const normalized = parsed.toString();
        console.log('PdfPreview: Normalized URL with protocol:', normalized);
        return normalized;
      }
      // For relative paths, just replace multiple slashes
      const normalized = url.replace(/\/+/g, '/');
      console.log('PdfPreview: Normalized relative path:', normalized);
      return normalized;
    } catch (e) {
      console.error('PdfPreview: Error normalizing URL:', e);
      return url; // Return original if parsing fails
    }
  };

  useEffect(() => {
    if (!url) {
      console.error("No URL provided to PdfPreview component");
      setError(true);
      setErrorDetails("No URL was provided for the PDF");
      setLoading(false);
      if (onError) onError();
      return;
    }

    // Normalize the URL first
    const normalizedUrl = normalizeUrlPath(url);
    setNormalizedUrl(normalizedUrl);
    
    // Check for potential URL formatting issues
    if (url.includes('//') && !url.includes('://')) {
      console.warn("⚠️ URL contains suspicious double slashes that might cause issues:", url);
      console.log("Normalized to:", normalizedUrl);
    }

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(false);
        console.log("Loading PDF from normalized URL:", normalizedUrl);
        
        // Clear any previous PDF document
        if (pdfDoc) {
          await pdfDoc.destroy();
          setPdfDoc(null);
        }
        
        const loadingTask = pdfjsLib.getDocument({
          url: normalizedUrl,
          withCredentials: false,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdfjs-dist/3.11.174/cmaps/',
          cMapPacked: true,
        });
        
        // Add event listeners for loading progress
        loadingTask.onProgress = (progressData) => {
          console.log(`PDF loading progress: ${progressData.loaded} of ${progressData.total || 'unknown'} bytes`);
        };
        
        const pdf = await loadingTask.promise;
        console.log("PDF loaded successfully, pages:", pdf.numPages);
        setPdfDoc(pdf);
        
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;

        if (canvas) {
          const context = canvas.getContext('2d');
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };

            await page.render(renderContext).promise;
            console.log("PDF rendered to canvas successfully");
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        setError(true);
        setErrorDetails(error.message || "Unknown error");
        setLoading(false);
        toast.error('Error loading PDF preview: ' + error.message);
        if (onError) onError();
      }
    };

    if (normalizedUrl) {
      loadPdf();
    }
    
    // Cleanup function
    return () => {
      if (pdfDoc) {
        pdfDoc.destroy().catch(err => console.error("Error destroying PDF document:", err));
      }
    };
  }, [url, scale, onError]);

  const handleOpenExternal = () => {
    if (normalizedUrl) {
      window.open(normalizedUrl, '_blank');
    }
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-2"></div>
          <div className="text-sm text-muted-foreground">Loading PDF...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <div className="text-red-500 mb-2 text-center">Failed to load PDF preview</div>
        <div className="text-sm text-muted-foreground mb-4 text-center">
          Check if the file exists in the storage bucket
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button 
            onClick={handleOpenExternal} 
            variant="outline"
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-4 w-4" /> View Direct URL
          </Button>
          <Button 
            onClick={toggleDebugMode} 
            variant="outline" 
            size="sm"
            className="text-xs"
          >
            {debugMode ? "Hide" : "Show"} Debug Info
          </Button>
        </div>
        
        {debugMode && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs max-w-md max-h-48 overflow-auto">
            <p className="font-bold">Error Message:</p>
            <p className="break-all mb-2 text-red-600">{errorDetails}</p>
            <p className="font-bold">Original URL:</p>
            <p className="break-all mb-2">{url}</p>
            <p className="font-bold">Normalized URL:</p>
            <p className="break-all mb-2">{normalizedUrl}</p>
            {url.includes('//') && !url.includes('://') && (
              <p className="text-orange-500 font-bold">Warning: URL contains suspicious double slashes!</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto flex items-center justify-center bg-gray-100">
      <canvas 
        ref={canvasRef}
        className="shadow-lg"
      />
    </div>
  );
};
