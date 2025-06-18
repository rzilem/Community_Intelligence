
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Brain, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { documentIntelligenceService, type DocumentIntelligenceResult } from '@/services/import-export/document-intelligence-service';
import { devLog } from '@/utils/dev-logger';

interface DocumentIntelligenceUploaderProps {
  onDocumentsProcessed: (results: DocumentIntelligenceResult[]) => void;
  associationId: string;
  maxFiles?: number;
}

const DocumentIntelligenceUploader: React.FC<DocumentIntelligenceUploaderProps> = ({
  onDocumentsProcessed,
  associationId,
  maxFiles = 10
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [results, setResults] = useState<DocumentIntelligenceResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Filter for supported file types
    const supportedFiles = files.filter(file => {
      const extension = file.name.toLowerCase().split('.').pop();
      return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'].includes(extension || '');
    });

    if (supportedFiles.length !== files.length) {
      toast.warning(`Some files were skipped. Only images and PDFs are supported for document intelligence.`);
    }

    if (supportedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed. Please select fewer files.`);
      return;
    }

    setSelectedFiles(supportedFiles);
    setResults([]);
    setShowResults(false);
    devLog.info('Selected files for document intelligence:', supportedFiles.map(f => f.name));
  };

  const processDocuments = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one document to process');
      return;
    }

    if (!associationId) {
      toast.error('Please select an association first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    try {
      const processedResults: DocumentIntelligenceResult[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setCurrentFile(file.name);
        setProgress((i / selectedFiles.length) * 100);
        
        devLog.info(`Processing document ${i + 1}/${selectedFiles.length}:`, file.name);
        
        const result = await documentIntelligenceService.processDocument(file);
        processedResults.push(result);
        
        toast.success(`Processed ${file.name}`, {
          description: `Document type: ${result.documentType}, Confidence: ${Math.round(result.confidence * 100)}%`
        });
      }
      
      setProgress(100);
      setResults(processedResults);
      setShowResults(true);
      
      // Call the callback with results
      onDocumentsProcessed(processedResults);
      
      toast.success(`Successfully processed ${processedResults.length} documents`);
      
    } catch (error) {
      devLog.error('Document processing failed:', error);
      toast.error('Failed to process documents', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsProcessing(false);
      setCurrentFile('');
    }
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'invoice': 'bg-blue-100 text-blue-800',
      'property_list': 'bg-green-100 text-green-800',
      'owner_list': 'bg-purple-100 text-purple-800',
      'financial_statement': 'bg-orange-100 text-orange-800',
      'assessment': 'bg-red-100 text-red-800',
      'unknown': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.unknown;
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (confidence >= 0.6) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Document Intelligence
          </CardTitle>
          <CardDescription>
            Upload scanned documents, PDFs, or images. AI will extract and structure the data automatically.
            Supports: Invoices, Property Lists, Owner Lists, Financial Statements, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Drop documents here or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supports PDF, PNG, JPG, GIF, BMP, TIFF (max {maxFiles} files)
              </p>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.tiff"
              onChange={handleFileSelect}
              className="hidden"
              id="document-upload"
            />
            <label htmlFor="document-upload">
              <Button variant="outline" className="mt-4 cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Select Documents
              </Button>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
              <div className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing Documents...</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentFile && (
                <p className="text-xs text-gray-600">Currently processing: {currentFile}</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={processDocuments}
              disabled={selectedFiles.length === 0 || isProcessing}
              className="flex-1"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Process with AI'}
            </Button>
            
            {results.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowResults(!showResults)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showResults ? 'Hide' : 'View'} Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showResults && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
            <CardDescription>
              AI has analyzed your documents and extracted structured data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{result.filename}</h4>
                    <div className="flex items-center gap-2">
                      {getConfidenceIcon(result.confidence)}
                      <span className="text-sm text-gray-600">
                        {Math.round(result.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getDocumentTypeColor(result.documentType)}>
                      {result.documentType.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  {Object.keys(result.structuredData).length > 0 && (
                    <div className="bg-gray-50 rounded p-3">
                      <h5 className="text-sm font-medium mb-2">Extracted Data:</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(result.structuredData).slice(0, 6).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-600">{key}:</span>
                            <span className="ml-1 font-medium">{String(value).substring(0, 30)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.suggestions.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {result.suggestions.slice(0, 2).map((suggestion, idx) => (
                            <p key={idx} className="text-sm">{suggestion}</p>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {result.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {result.errors[0]}
                      </AlertDescription>
                    </Alert>
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

export default DocumentIntelligenceUploader;
