
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, FileText, Image, Table, Brain, CheckCircle, 
  AlertTriangle, Info, Zap, Settings 
} from 'lucide-react';
import { toast } from 'sonner';

// Import services
import { advancedOCRService, AdvancedOCRResult } from '@/services/import-export/advanced-ocr-service';
import { multiFormatProcessor, ProcessedDocument } from '@/services/import-export/multi-format-processor';
import { intelligentContentAnalyzer, ContentAnalysisResult } from '@/services/import-export/intelligent-content-analyzer';

interface ProcessingResult {
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  ocr?: AdvancedOCRResult;
  processed?: ProcessedDocument;
  analysis?: ContentAnalysisResult;
  errors?: string[];
}

interface ProcessingOptions {
  enableOCR: boolean;
  ocrLanguages: string[];
  enableTableExtraction: boolean;
  enableFormDetection: boolean;
  enableLayoutAnalysis: boolean;
  enableIntelligentAnalysis: boolean;
  qualityThreshold: number;
}

const EnhancedDocumentProcessor: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState<ProcessingOptions>({
    enableOCR: true,
    ocrLanguages: ['eng'],
    enableTableExtraction: true,
    enableFormDetection: true,
    enableLayoutAnalysis: true,
    enableIntelligentAnalysis: true,
    qualityThreshold: 80
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...uploadedFiles]);
    
    // Initialize results for new files
    const newResults: ProcessingResult[] = uploadedFiles.map(file => ({
      filename: file.name,
      status: 'processing',
      progress: 0
    }));
    
    setResults(prev => [...prev, ...newResults]);
  }, []);

  const processFiles = useCallback(async () => {
    if (files.length === 0) {
      toast.error('Please upload files first');
      return;
    }

    setIsProcessing(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const resultIndex = results.findIndex(r => r.filename === file.name);
        
        if (resultIndex === -1) continue;

        // Update progress
        setResults(prev => prev.map((result, idx) => 
          idx === resultIndex 
            ? { ...result, status: 'processing', progress: 10 }
            : result
        ));

        try {
          // Step 1: Multi-format processing
          const processed = await multiFormatProcessor.processFile(file, {
            enableOCR: options.enableOCR,
            ocrLanguages: options.ocrLanguages,
            fallbackToOCR: true,
            qualityThreshold: options.qualityThreshold
          });

          setResults(prev => prev.map((result, idx) => 
            idx === resultIndex 
              ? { ...result, processed, progress: 40 }
              : result
          ));

          // Step 2: OCR processing (if enabled and needed)
          let ocrResult: AdvancedOCRResult | undefined;
          if (options.enableOCR && ['pdf', 'image', 'word'].includes(processed.format)) {
            ocrResult = await advancedOCRService.processDocument(file, {
              enableTableExtraction: options.enableTableExtraction,
              enableFormDetection: options.enableFormDetection,
              enableLayoutAnalysis: options.enableLayoutAnalysis,
              languages: options.ocrLanguages
            });

            setResults(prev => prev.map((result, idx) => 
              idx === resultIndex 
                ? { ...result, ocr: ocrResult, progress: 70 }
                : result
            ));
          }

          // Step 3: Intelligent analysis
          let analysis: ContentAnalysisResult | undefined;
          if (options.enableIntelligentAnalysis && processed.content) {
            const analysisResult = await intelligentContentAnalyzer.analyzeContent(
              processed.content,
              file.name,
              {
                includeStructural: true,
                includeDocumentIntelligence: true,
                enableAIAnalysis: true
              }
            );
            analysis = analysisResult.analysis;

            setResults(prev => prev.map((result, idx) => 
              idx === resultIndex 
                ? { ...result, analysis, progress: 90 }
                : result
            ));
          }

          // Complete
          setResults(prev => prev.map((result, idx) => 
            idx === resultIndex 
              ? { ...result, status: 'completed', progress: 100 }
              : result
          ));

          toast.success(`Processed ${file.name} successfully`);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Processing failed';
          
          setResults(prev => prev.map((result, idx) => 
            idx === resultIndex 
              ? { 
                  ...result, 
                  status: 'failed', 
                  progress: 0,
                  errors: [errorMessage]
                }
              : result
          ));

          toast.error(`Failed to process ${file.name}: ${errorMessage}`);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  }, [files, results, options]);

  const renderProcessingOptions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Processing Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enableOCR"
            checked={options.enableOCR}
            onChange={(e) => setOptions(prev => ({ ...prev, enableOCR: e.target.checked }))}
          />
          <label htmlFor="enableOCR">Enable OCR Processing</label>
        </div>
        
        {options.enableOCR && (
          <>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableTableExtraction"
                checked={options.enableTableExtraction}
                onChange={(e) => setOptions(prev => ({ ...prev, enableTableExtraction: e.target.checked }))}
              />
              <label htmlFor="enableTableExtraction">Extract Tables</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableFormDetection"
                checked={options.enableFormDetection}
                onChange={(e) => setOptions(prev => ({ ...prev, enableFormDetection: e.target.checked }))}
              />
              <label htmlFor="enableFormDetection">Detect Forms</label>
            </div>
          </>
        )}
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enableIntelligentAnalysis"
            checked={options.enableIntelligentAnalysis}
            onChange={(e) => setOptions(prev => ({ ...prev, enableIntelligentAnalysis: e.target.checked }))}
          />
          <label htmlFor="enableIntelligentAnalysis">AI Content Analysis</label>
        </div>
      </CardContent>
    </Card>
  );

  const renderFileUpload = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.csv,.txt,.xlsx,.xls,.doc,.docx"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-400">
              Supports PDF, Images, CSV, Excel, Word documents
            </span>
          </label>
        </div>
        
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Uploaded Files:</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{file.name}</span>
                <Badge variant="outline">{(file.size / 1024).toFixed(1)} KB</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderResults = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Processing Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No results yet. Upload and process files to see results.</p>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.filename}</span>
                  <Badge 
                    variant={
                      result.status === 'completed' ? 'default' : 
                      result.status === 'failed' ? 'destructive' : 'secondary'
                    }
                  >
                    {result.status}
                  </Badge>
                </div>
                
                <Progress value={result.progress} className="w-full" />
                
                {result.errors && result.errors.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {result.errors.map((error, i) => (
                        <div key={i}>{String(error)}</div>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
                
                {result.processed && (
                  <div className="text-sm space-y-1">
                    <div><strong>Format:</strong> {result.processed.format}</div>
                    <div><strong>Extraction:</strong> {result.processed.metadata.extractionMethod}</div>
                    {result.processed.metadata.confidence && (
                      <div><strong>Confidence:</strong> {result.processed.metadata.confidence.toFixed(1)}%</div>
                    )}
                  </div>
                )}
                
                {result.analysis && (
                  <div className="text-sm space-y-1">
                    <div><strong>Data Type:</strong> {result.analysis.dataType}</div>
                    <div><strong>Quality Score:</strong> {result.analysis.qualityScore.toFixed(1)}/100</div>
                    <div><strong>Confidence:</strong> {(result.analysis.confidence * 100).toFixed(1)}%</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Enhanced Document Processor</h2>
        <Button 
          onClick={processFiles} 
          disabled={isProcessing || files.length === 0}
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          {isProcessing ? 'Processing...' : 'Process Files'}
        </Button>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList>
          <TabsTrigger value="upload">Upload & Configure</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          {renderFileUpload()}
        </TabsContent>
        
        <TabsContent value="results" className="space-y-6">
          {renderResults()}
        </TabsContent>
        
        <TabsContent value="options" className="space-y-6">
          {renderProcessingOptions()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDocumentProcessor;
