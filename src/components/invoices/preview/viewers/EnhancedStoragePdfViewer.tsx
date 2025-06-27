
import React, { useState, useEffect } from 'react';
import { ExternalLink, AlertTriangle, RefreshCw, Download, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { generatePdfUrls, generateStorageDebugInfo, type StorageUrlResult, type StorageDebugInfo } from '@/utils/supabase-storage-utils';

interface EnhancedStoragePdfViewerProps {
  pdfUrl: string;
  onExternalOpen: () => void;
  onFallbackToHtml?: () => void;
}

export const EnhancedStoragePdfViewer: React.FC<EnhancedStoragePdfViewerProps> = ({
  pdfUrl,
  onExternalOpen,
  onFallbackToHtml
}) => {
  const [displayError, setDisplayError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [urlStrategies, setUrlStrategies] = useState<StorageUrlResult[]>([]);
  const [currentStrategyIndex, setCurrentStrategyIndex] = useState(0);
  const [debugInfo, setDebugInfo] = useState<StorageDebugInfo | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const currentUrl = urlStrategies[currentStrategyIndex]?.url || pdfUrl;

  // Initialize URL strategies and debug info
  useEffect(() => {
    const initializeStrategies = async () => {
      console.log('EnhancedStoragePdfViewer: Initializing PDF strategies for:', pdfUrl);
      
      try {
        const strategies = await generatePdfUrls(pdfUrl);
        setUrlStrategies(strategies);
        
        const debug = await generateStorageDebugInfo(pdfUrl);
        setDebugInfo(debug);
        
        console.log('PDF strategies generated:', strategies);
        console.log('Debug info:', debug);
      } catch (error) {
        console.error('Failed to initialize PDF strategies:', error);
        setDisplayError(true);
      }
    };

    initializeStrategies();
  }, [pdfUrl]);

  const handleIframeError = () => {
    console.error('PDF iframe failed to load with strategy:', currentStrategyIndex);
    
    // Try next strategy if available
    if (currentStrategyIndex < urlStrategies.length - 1) {
      console.log('Trying next PDF strategy...');
      setCurrentStrategyIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      console.log('All PDF strategies exhausted');
      setDisplayError(true);
      setIsLoading(false);
    }
  };

  const handleIframeLoad = () => {
    console.log('PDF iframe loaded successfully with strategy:', currentStrategyIndex);
    setIsLoading(false);
    setDisplayError(false);
  };

  const handleRetry = () => {
    console.log('Retrying PDF load');
    setDisplayError(false);
    setIsLoading(true);
    setCurrentStrategyIndex(0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentUrl;
    link.download = 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTryBlobUrl = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(currentUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Replace current strategy with blob URL
      const newStrategies = [...urlStrategies];
      newStrategies[currentStrategyIndex] = {
        ...newStrategies[currentStrategyIndex],
        url: blobUrl
      };
      setUrlStrategies(newStrategies);
      setDisplayError(false);
    } catch (error) {
      console.error('Failed to create blob URL:', error);
      setDisplayError(true);
      setIsLoading(false);
    }
  };

  if (displayError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">PDF Display Failed</h3>
        <p className="text-center mb-4 text-muted-foreground max-w-md">
          Unable to display the PDF using {urlStrategies.length} different strategies. 
          This may be due to browser security restrictions or CORS policies.
        </p>
        
        <div className="flex gap-2 flex-wrap justify-center mb-4">
          <Button onClick={onExternalOpen} className="flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button variant="outline" onClick={handleDownload} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleTryBlobUrl} className="flex items-center">
            Try Blob URL
          </Button>
          {onFallbackToHtml && (
            <Button variant="outline" onClick={onFallbackToHtml} className="flex items-center">
              View Processed Content
            </Button>
          )}
          <Button variant="outline" onClick={handleRetry} className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>

        {/* Debug Information */}
        <Collapsible open={showDebug} onOpenChange={setShowDebug}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Show Debug Info
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="w-full max-w-2xl mt-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2 text-xs">
                  <div><strong>Current Strategy:</strong> {currentStrategyIndex + 1} of {urlStrategies.length}</div>
                  <div><strong>Current URL:</strong> {currentUrl}</div>
                  {debugInfo && (
                    <>
                      <div><strong>Bucket:</strong> {debugInfo.bucketName || 'Unknown'}</div>
                      <div><strong>File Path:</strong> {debugInfo.filePath || 'Unknown'}</div>
                      <div><strong>Accessible:</strong> {debugInfo.isAccessible ? 'Yes' : 'No'}</div>
                      {debugInfo.errors.length > 0 && (
                        <div><strong>Errors:</strong> {debugInfo.errors.join(', ')}</div>
                      )}
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              Loading PDF (Strategy {currentStrategyIndex + 1}/{urlStrategies.length})...
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onExternalOpen}
              className="mt-2 text-xs"
            >
              Or open in new tab
            </Button>
          </div>
        </div>
      )}
      
      <iframe
        src={currentUrl}
        width="100%"
        height="100%"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        className="border-0"
        title="PDF Document"
      />
    </div>
  );
};
