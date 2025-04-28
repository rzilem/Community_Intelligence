
import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'sonner';

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
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    if (!url) {
      console.error("No URL provided to PdfPreview component");
      setError(true);
      setLoading(false);
      if (onError) onError();
      return;
    }

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(false);
        console.log("Loading PDF from URL:", url);
        
        // Clear any previous PDF document
        if (pdfDoc) {
          await pdfDoc.destroy();
          setPdfDoc(null);
        }
        
        const loadingTask = pdfjsLib.getDocument(url);
        
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
        setLoading(false);
        toast.error('Error loading PDF preview');
        if (onError) onError();
      }
    };

    if (url) {
      loadPdf();
    }
    
    // Cleanup function
    return () => {
      if (pdfDoc) {
        pdfDoc.destroy().catch(err => console.error("Error destroying PDF document:", err));
      }
    };
  }, [url, scale, onError]);

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
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Failed to load PDF preview</div>
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
