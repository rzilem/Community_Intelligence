import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Image,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Upload,
  Eye,
  Download,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

// Import the services and types
import { multiFormatProcessor, ProcessedDocument } from '@/services/import-export/multi-format-processor';
import { ProcessingOptions } from '@/services/import-export/types';

interface EnhancedDocumentProcessorProps {
  onProcessingComplete?: (results: ProcessedDocument[]) => void;
  associationId?: string;
}

const EnhancedDocumentProcessor: React.FC<EnhancedDocumentProcessorProps> = ({
  onProcessingComplete,
  associationId
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    enableOCR: true,
    enableDuplicateDetection: false,
    enableQualityAssessment: true,
    enableAutoFix: false,
    fallbackToOCR: true,
    validateData: true,
    extractStructured: true,
    classifyDocument: true,
    includeMetadata: true,
    qualityThreshold: 0.7
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setProcessedDocuments([]);
    setProcessingProgress(0);
  }, []);

  const handleProcessDocuments = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to process');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const result = await multiFormatProcessor.processWithEnhancedAnalysis(
        selectedFiles,
        processingOptions
      );

      setProcessedDocuments(result.processedDocuments);
      setProcessingProgress(100);

      if (result.success) {
        toast.success(`Successfully processed ${result.processedDocuments.length} documents`);
        onProcessingComplete?.(result.processedDocuments);
      } else {
        toast.error('Some documents failed to process');
      }

      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error));
      }

      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => toast.warning(warning));
      }

    } catch (error) {
      console.error('Document processing failed:', error);
      toast.error(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles, processingOptions, onProcessingComplete]);

  const getFileIcon = (filename: string) => {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'tiff':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;
    
    const percentage = Math.round(confidence * 100);
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    
    if (percentage >= 80) variant = "default";
    else if (percentage >= 60) variant = "secondary";
    else variant = "destructive";
    
    return (
      <Badge variant={variant}>
        {percentage}% confidence
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Enhanced Document Processor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Selection */}
          <div>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="w-full p-3 border rounded-lg"
            />
            {selectedFiles.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Selected {selectedFiles.length} file(s)
              </div>
            )}
          </div>

          {/* Processing Options */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={processingOptions.enableOCR}
                onChange={(e) => setProcessingOptions(prev => ({
                  ...prev,
                  enableOCR: e.target.checked
                }))}
              />
              <span className="text-sm">Enable OCR</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={processingOptions.enableQualityAssessment}
                onChange={(e) => setProcessingOptions(prev => ({
                  ...prev,
                  enableQualityAssessment: e.target.checked
                }))}
              />
              <span className="text-sm">Quality Assessment</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={processingOptions.classifyDocument}
                onChange={(e) => setProcessingOptions(prev => ({
                  ...prev,
                  classifyDocument: e.target.checked
                }))}
              />
              <span className="text-sm">Auto-Classify</span>
            </label>
          </div>

          {/* Process Button */}
          <Button
            onClick={handleProcessDocuments}
            disabled={isProcessing || selectedFiles.length === 0}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : 'Process Documents'}
          </Button>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={processingProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Processing documents...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {processedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processedDocuments.map((doc, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.filename)}
                      <div>
                        <h4 className="font-medium">{doc.filename}</h4>
                        <p className="text-sm text-muted-foreground">
                          {doc.format} • {doc.data.length} records
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getConfidenceBadge(doc.metadata.confidence)}
                      {doc.classification && (
                        <Badge variant="outline">
                          {doc.classification.type}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {doc.metadata.qualityScore && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm">
                        <span>Quality Score</span>
                        <span>{doc.metadata.qualityScore}%</span>
                      </div>
                      <Progress value={doc.metadata.qualityScore} className="mt-1" />
                    </div>
                  )}

                  {doc.content && (
                    <div className="mt-3">
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium">
                          Preview Content
                        </summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-h-32 overflow-y-auto">
                          {doc.content.substring(0, 500)}
                          {doc.content.length > 500 && '...'}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDocumentProcessor;
