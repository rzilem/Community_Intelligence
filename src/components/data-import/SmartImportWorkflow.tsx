
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  BarChart3, 
  Users,
  Info,
  Sparkles
} from 'lucide-react';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from '@/components/ui/context-menu';
import { multiFormatProcessor } from '@/services/import-export/multi-format-processor';
import { enhancedDuplicateDetectionService } from '@/services/import-export/enhanced-duplicate-detection-service';
import { dataQualityService } from '@/services/import-export/data-quality-service';
import { toast } from 'sonner';
import { devLog } from '@/utils/dev-logger';

interface SmartImportWorkflowProps {
  onComplete?: (results: any) => void;
}

interface ProcessedFile {
  filename: string;
  size: number;
  type: string;
  status: 'processing' | 'completed' | 'error';
  data?: any[];
  error?: string;
  duplicates?: number;
  qualityScore?: number;
}

const SmartImportWorkflow: React.FC<SmartImportWorkflowProps> = ({ onComplete }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...uploadedFiles]);
    
    // Initialize processed files
    const newProcessedFiles = uploadedFiles.map(file => ({
      filename: file.name,
      size: file.size,
      type: file.type,
      status: 'processing' as const
    }));
    
    setProcessedFiles(prev => [...prev, ...newProcessedFiles]);
  }, []);

  const processFiles = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('Initializing...');

    try {
      // Step 1: Process each file (20% of progress)
      setCurrentStep('Processing files...');
      const processedDocuments = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentStep(`Processing ${file.name}...`);
        
        try {
          const result = await multiFormatProcessor.processFile(file, {
            enableOCR: true,
            enableStructureDetection: true,
            enableDataValidation: true
          });
          
          processedDocuments.push({
            filename: file.name,
            ...result
          });

          // Update individual file status
          setProcessedFiles(prev => prev.map(pf => 
            pf.filename === file.name 
              ? { ...pf, status: 'completed', data: result.data }
              : pf
          ));

        } catch (error) {
          devLog.error(`Failed to process ${file.name}:`, error);
          setProcessedFiles(prev => prev.map(pf => 
            pf.filename === file.name 
              ? { ...pf, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
              : pf
          ));
        }
        
        setProgress(20 + (i / files.length) * 30);
      }

      // Step 2: Duplicate Detection (30% more progress)
      setCurrentStep('Detecting duplicates...');
      const fileData = processedDocuments
        .filter(doc => doc.data && doc.data.length > 0)
        .map(doc => ({
          filename: doc.filename,
          data: doc.data
        }));

      let duplicateResults = null;
      if (fileData.length > 1) {
        duplicateResults = await enhancedDuplicateDetectionService.detectDuplicatesAdvanced(
          fileData,
          {
            strictMode: false,
            fuzzyMatching: true,
            confidenceThreshold: 0.7,
            semanticAnalysis: true
          }
        );
      }
      setProgress(70);

      // Step 3: Quality Assessment (20% more progress)
      setCurrentStep('Assessing data quality...');
      const qualityResults = await dataQualityService.assessDataQuality(
        processedDocuments.map(doc => doc.data || []).flat()
      );
      setProgress(90);

      // Step 4: Generate final results
      setCurrentStep('Finalizing results...');
      const finalResults = {
        processedDocuments,
        duplicateResults,
        qualityResults,
        summary: {
          totalFiles: files.length,
          successfulFiles: processedDocuments.filter(doc => doc.data).length,
          totalRecords: processedDocuments.reduce((sum, doc) => sum + (doc.data?.length || 0), 0),
          duplicatesFound: duplicateResults?.totalDuplicates || 0,
          qualityScore: qualityResults?.overallScore || 0
        }
      };

      setResults(finalResults);
      setProgress(100);
      setCurrentStep('Complete!');

      // Update file statuses with final metrics
      setProcessedFiles(prev => prev.map(pf => {
        const doc = processedDocuments.find(d => d.filename === pf.filename);
        if (doc && duplicateResults && qualityResults) {
          return {
            ...pf,
            duplicates: duplicateResults.enhancedMatches.filter(
              m => m.sourceFile === pf.filename || m.targetFile === pf.filename
            ).length,
            qualityScore: qualityResults.overallScore
          };
        }
        return pf;
      }));

      onComplete?.(finalResults);
      toast.success(`Successfully processed ${files.length} files`);

    } catch (error) {
      devLog.error('Smart import workflow failed:', error);
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentStep('Error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [files, onComplete]);

  const handleFileSelection = useCallback((filename: string, selected: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(filename);
      } else {
        newSet.delete(filename);
      }
      return newSet;
    });
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    const selectedFilesList = Array.from(selectedFiles);
    
    switch (action) {
      case 'reprocess':
        toast.info(`Reprocessing ${selectedFilesList.length} files...`);
        break;
      case 'remove':
        setFiles(prev => prev.filter(f => !selectedFiles.has(f.name)));
        setProcessedFiles(prev => prev.filter(pf => !selectedFiles.has(pf.filename)));
        setSelectedFiles(new Set());
        toast.success(`Removed ${selectedFilesList.length} files`);
        break;
      case 'export':
        toast.info(`Exporting ${selectedFilesList.length} files...`);
        break;
    }
  }, [selectedFiles]);

  const getStatusIcon = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'processing': return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'processing': return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Smart Import Workflow
          </CardTitle>
          <CardDescription>
            Advanced file processing with duplicate detection and quality assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Drop files here or click to upload
            </p>
            <input
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.pdf,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isProcessing}
            >
              Select Files
            </Button>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Files List */}
          {processedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Files ({processedFiles.length})</CardTitle>
                  {selectedFiles.size > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBulkAction('reprocess')}
                      >
                        Reprocess ({selectedFiles.size})
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBulkAction('remove')}
                      >
                        Remove ({selectedFiles.size})
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {processedFiles.map((file, index) => (
                    <ContextMenu key={index}>
                      <ContextMenuTrigger>
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedFiles.has(file.filename)}
                              onChange={(e) => handleFileSelection(file.filename, e.target.checked)}
                              className="rounded"
                            />
                            {getStatusIcon(file.status)}
                            <div>
                              <p className="font-medium">{file.filename}</p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB • {file.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {file.duplicates !== undefined && (
                              <Badge variant="outline">
                                {file.duplicates} duplicates
                              </Badge>
                            )}
                            {file.qualityScore !== undefined && (
                              <Badge variant="outline">
                                {file.qualityScore}% quality
                              </Badge>
                            )}
                            <span className={`text-sm font-medium ${getStatusColor(file.status)}`}>
                              {file.status}
                            </span>
                          </div>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => console.log('View details', file.filename)}>
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => console.log('Reprocess', file.filename)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Reprocess
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem 
                          onClick={() => handleBulkAction('remove')}
                          className="text-red-600"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Remove
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={processFiles}
              disabled={files.length === 0 || isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : 'Start Smart Import'}
            </Button>
            {files.length > 0 && (
              <Button 
                variant="outline"
                onClick={() => {
                  setFiles([]);
                  setProcessedFiles([]);
                  setResults(null);
                  setSelectedFiles(new Set());
                }}
                disabled={isProcessing}
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Results Section */}
          {results && (
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList>
                <TabsTrigger value="summary">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="duplicates">
                  <Users className="h-4 w-4 mr-2" />
                  Duplicates
                </TabsTrigger>
                <TabsTrigger value="quality">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Quality
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Import completed successfully! Processed {results.summary.totalFiles} files 
                    with {results.summary.totalRecords} total records.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(results.summary).map(([key, value]) => (
                    <Card key={key}>
                      <CardContent className="p-4">
                        <p className="text-2xl font-bold">{String(value)}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="duplicates" className="space-y-4">
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Found {results.duplicateResults?.totalDuplicates || 0} potential duplicate records.
                    Review and resolve before importing.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Overall data quality score: {results.qualityResults?.overallScore || 0}%
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartImportWorkflow;
