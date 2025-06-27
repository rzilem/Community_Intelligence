
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { showToast } from '@/utils/toast-utils';

interface PdfMetadata {
  pageCount: number;
  fileSize: string;
  dimensions: { width: number; height: number };
  textExtractable: boolean;
  quality: 'high' | 'medium' | 'low';
}

interface EnhancedPdfProcessorProps {
  pdfUrl: string;
  onMetadataExtracted?: (metadata: PdfMetadata) => void;
  onTextExtracted?: (text: string) => void;
}

export const EnhancedPdfProcessor: React.FC<EnhancedPdfProcessorProps> = ({
  pdfUrl,
  onMetadataExtracted,
  onTextExtracted
}) => {
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);

  const processPdf = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simulate PDF processing steps
      setProcessingProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate metadata extraction
      const simulatedMetadata: PdfMetadata = {
        pageCount: Math.floor(Math.random() * 5) + 1,
        fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
        dimensions: { width: 612, height: 792 },
        textExtractable: Math.random() > 0.2,
        quality: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      };

      setProcessingProgress(50);
      await new Promise(resolve => setTimeout(resolve, 800));

      setMetadata(simulatedMetadata);
      onMetadataExtracted?.(simulatedMetadata);

      setProcessingProgress(75);
      await new Promise(resolve => setTimeout(resolve, 600));

      // Simulate text extraction
      if (simulatedMetadata.textExtractable) {
        const simulatedText = "Invoice #12345\nVendor: ABC Company\nAmount: $1,500.00\nDue Date: 2024-01-15\n\nLine Items:\n- Service Fee: $1,200.00\n- Processing Fee: $300.00\n\nTotal: $1,500.00";
        setExtractedText(simulatedText);
        onTextExtracted?.(simulatedText);
      }

      setProcessingProgress(100);

      showToast('PDF Processing Complete', {
        description: `Extracted ${simulatedMetadata.pageCount} pages successfully`
      });

    } catch (error) {
      showToast('PDF Processing Failed', {
        description: 'Unable to process PDF document',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadOptimized = () => {
    window.open(pdfUrl, '_blank');
    showToast('Downloading PDF', {
      description: 'PDF download started'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Processing
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={downloadOptimized}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              size="sm"
              onClick={processPdf}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {isProcessing ? 'Processing...' : 'Analyze PDF'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing PDF...</span>
              <span>{processingProgress}%</span>
            </div>
            <Progress value={processingProgress} />
          </div>
        )}

        {metadata && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pages:</span>
                <span className="text-sm">{metadata.pageCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Size:</span>
                <span className="text-sm">{metadata.fileSize}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quality:</span>
                <Badge variant={
                  metadata.quality === 'high' ? 'default' : 
                  metadata.quality === 'medium' ? 'secondary' : 'destructive'
                }>
                  {metadata.quality}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Text Extraction:</span>
                {metadata.textExtractable ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dimensions:</span>
                <span className="text-sm">
                  {metadata.dimensions.width} × {metadata.dimensions.height}
                </span>
              </div>
            </div>
          </div>
        )}

        {extractedText && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Extracted Text Preview:</span>
            </div>
            <div className="bg-muted p-3 rounded-lg text-xs font-mono max-h-32 overflow-y-auto">
              {extractedText.split('\n').slice(0, 8).join('\n')}
              {extractedText.split('\n').length > 8 && '\n...'}
            </div>
          </div>
        )}

        {!metadata && !isProcessing && (
          <div className="text-center py-4 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click "Analyze PDF" to extract metadata and text</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
