import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Sparkles,
  Database,
  FileSpreadsheet,
  Archive,
  Eye,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { aiImportExecutor, type ImportExecutionResult } from '@/services/ai-import/ai-import-executor';
import { ImportErrorBoundary } from './ImportErrorBoundary';
import ImportPreviewModal from './ImportPreviewModal';

interface OneClickAIImportProps {
  associationId: string;
  onImportComplete?: (results: any) => void;
}

interface AIAnalysisResult {
  dataType: string;
  confidence: number;
  targetTables: string[];
  fieldMappings: Record<string, string>;
  tableAssignments?: Record<string, string[]>;
  dataQuality: {
    issues: string[];
    warnings: string[];
    suggestions: string[];
  };
  transformations: Array<{
    field: string;
    action: string;
    description: string;
  }>;
  requiredFields: string[];
  missingFields: string[];
  suggestedDefaults: Record<string, any>;
  relationships: Array<{
    type: string;
    description: string;
  }>;
  summary: string;
}

const OneClickAIImport: React.FC<OneClickAIImportProps> = ({ 
  associationId, 
  onImportComplete 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [userDescription, setUserDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AIAnalysisResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<ImportExecutionResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setAnalysisResults(null);
    toast.success(`${acceptedFiles.length} file(s) uploaded successfully`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 250 * 1024 * 1024, // 250MB
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/zip': ['.zip'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    }
  });

  const parseFileContent = async (file: File): Promise<any> => {
    if (file.name.endsWith('.csv')) {
      const text = await file.text();
      return text;
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(worksheet);
    } else if (file.name.endsWith('.zip')) {
      const buffer = await file.arrayBuffer();
      const zip = new JSZip();
      const zipFile = await zip.loadAsync(buffer);
      const fileContents: Record<string, any> = {};
      
      for (const filename of Object.keys(zipFile.files)) {
        if (!zipFile.files[filename].dir) {
          const content = await zipFile.files[filename].async('text');
          fileContents[filename] = content;
        }
      }
      
      return fileContents;
    } else {
      return await file.text();
    }
  };

  const analyzeWithAI = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setCurrentStep('Parsing files...');

    try {
      // Parse all files
      const fileContents: Array<{ name: string; content: any; type: string }> = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress((i / files.length) * 50);
        setCurrentStep(`Parsing ${file.name}...`);
        
        const content = await parseFileContent(file);
        fileContents.push({
          name: file.name,
          content,
          type: file.type
        });
      }

      setProgress(60);
      setCurrentStep('Analyzing with AI...');

      // Send to AI for analysis
      const { data, error } = await supabase.functions.invoke('ai-import-processor', {
        body: {
          fileContent: fileContents.length === 1 ? fileContents[0].content : fileContents,
          fileName: fileContents.length === 1 ? fileContents[0].name : `${files.length} files`,
          fileType: fileContents.length === 1 ? fileContents[0].type : 'mixed',
          associationId,
          userDescription
        }
      });

      if (error) throw error;

      setProgress(100);
      setCurrentStep('Analysis complete!');
      setAnalysisResults(data.analysisResult);
      
      toast.success('AI analysis completed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showImportPreview = async () => {
    if (!analysisResults) {
      toast.error('Please complete AI analysis first');
      return;
    }

    // Validate analysis results have required fields
    if (!analysisResults.targetTables || !analysisResults.fieldMappings) {
      toast.error('Analysis results are incomplete. Please retry analysis.');
      return;
    }

    try {
      setCurrentStep('Preparing preview...');
      
      // Parse file content for preview
      const fileContents: any[] = [];
      
      for (const file of files) {
        const content = await parseFileContent(file);
        
        if (Array.isArray(content)) {
          fileContents.push(...content);
        } else if (typeof content === 'string') {
          // Convert CSV string to array
          const lines = content.split('\n').filter(line => line.trim());
          if (lines.length === 0) continue;
          
          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1).map(line => {
            const values = line.split(',');
            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim() || '';
            });
            return row;
          });
          fileContents.push(...data);
        }
      }

      if (fileContents.length === 0) {
        toast.error('No data found to preview');
        return;
      }

      setPreviewData(fileContents);
      
      // Run validation to get errors and warnings
      const validationResult = await aiImportExecutor.executeImport(
        analysisResults,
        fileContents,
        associationId
      );

      setValidationErrors(validationResult.validationErrors || []);
      setValidationWarnings(validationResult.warnings || []);
      setShowPreviewModal(true);
      
    } catch (error) {
      console.error('Preview error:', error);
      toast.error(`Failed to prepare preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const confirmImport = async (userDefaults: Record<string, any>) => {
    if (!analysisResults) return;

    setShowPreviewModal(false);
    setIsImporting(true);
    setProgress(0);
    setCurrentStep('Starting import...');

    try {
      setProgress(30);
      setCurrentStep('Executing AI-guided import...');

      // Execute the actual import using AI analysis
      const importResult = await aiImportExecutor.executeImport(
        analysisResults,
        previewData,
        associationId
      );

      setProgress(90);
      setCurrentStep('Finalizing import...');
      setImportResults(importResult);

      if (importResult.success) {
        setProgress(100);
        setCurrentStep('Import complete!');
        
        toast.success(`Successfully imported ${importResult.importedRecords} records!`);
        
        if (importResult.warnings.length > 0) {
          toast.warning(`Import completed with ${importResult.warnings.length} warnings`);
        }
        
        onImportComplete?.(importResult);
      } else {
        toast.error(`Import failed: ${importResult.errors.join(', ')}`);
      }
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Set error result
      setImportResults({
        success: false,
        importedRecords: 0,
        failedRecords: previewData.length,
        totalRecords: previewData.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        validationErrors: [],
        requiredFieldsErrors: [],
        details: []
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleRetry = () => {
    setAnalysisResults(null);
    setImportResults(null);
    setValidationErrors([]);
    setValidationWarnings([]);
    setPreviewData([]);
    setProgress(0);
    setCurrentStep('');
  };

  const handleReset = () => {
    setFiles([]);
    setUserDescription('');
    setAnalysisResults(null);
    setImportResults(null);
    setValidationErrors([]);
    setValidationWarnings([]);
    setPreviewData([]);
    setProgress(0);
    setCurrentStep('');
    setShowPreviewModal(false);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.csv')) return <FileText className="h-5 w-5" />;
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return <FileSpreadsheet className="h-5 w-5" />;
    if (fileName.endsWith('.zip')) return <Archive className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <ImportErrorBoundary 
      fallbackTitle="Import System Error"
      fallbackMessage="The import system encountered an error. Please try again or contact support if the problem persists."
      onRetry={handleRetry}
      onReset={handleReset}
    >
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              One-Click AI Import
            </CardTitle>
            <CardDescription>
              Upload any file type and let AI automatically analyze, map, and import your data. 
              Supports CSV, Excel, ZIP files up to 250MB each.
            </CardDescription>
          </CardHeader>
        </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Drop files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV, Excel, ZIP, PDF, TXT • Up to 250MB per file
                </p>
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Uploaded Files ({files.length})</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {getFileIcon(file.name)}
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Describe your data (optional)
            </label>
            <Textarea
              placeholder="e.g., 'Property list with current owners' or 'Financial data from last quarter'"
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button 
              onClick={analyzeWithAI} 
              disabled={files.length === 0 || isAnalyzing}
              className="gap-2"
            >
              <Brain className="h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {(isAnalyzing || isImporting) && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Results */}
      {analysisResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Confidence & Summary */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getConfidenceColor(analysisResults.confidence)}`} />
                <span className="font-medium">{analysisResults.confidence}% Confidence</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {analysisResults.dataType}
              </Badge>
            </div>

            <p className="text-muted-foreground">{analysisResults.summary}</p>

            <Separator />

            {/* Data Quality */}
            <div>
              <h4 className="font-medium mb-3">Data Quality Assessment</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysisResults.dataQuality.issues.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Issues ({analysisResults.dataQuality.issues.length})</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {analysisResults.dataQuality.issues.map((issue, i) => (
                        <li key={i} className="text-muted-foreground">• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResults.dataQuality.warnings.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Warnings ({analysisResults.dataQuality.warnings.length})</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {analysisResults.dataQuality.warnings.map((warning, i) => (
                        <li key={i} className="text-muted-foreground">• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResults.dataQuality.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Suggestions ({analysisResults.dataQuality.suggestions.length})</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {analysisResults.dataQuality.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-muted-foreground">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Field Mappings */}
            <div>
              <h4 className="font-medium mb-3">Automatic Field Mappings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(analysisResults.fieldMappings).map(([sourceField, targetField]) => (
                  <div key={sourceField} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-sm font-medium">{sourceField}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-sm text-muted-foreground">{targetField}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Tables */}
            <div>
              <h4 className="font-medium mb-3">Target Database Tables</h4>
              <div className="flex gap-2 flex-wrap">
                {analysisResults.targetTables.map((table) => (
                  <Badge key={table} variant="secondary" className="gap-1">
                    <Database className="h-3 w-3" />
                    {table}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setAnalysisResults(null)}>
                Analyze Again
              </Button>
              <Button 
                onClick={showImportPreview} 
                disabled={isImporting || analysisResults.confidence < 50}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {isImporting ? 'Importing...' : 'Preview & Import'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importResults.importedRecords}
                </div>
                <div className="text-sm text-muted-foreground">Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {importResults.failedRecords}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {importResults.totalRecords}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {importResults.warnings.length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-red-600">Errors</h4>
                <ul className="text-sm space-y-1">
                  {importResults.errors.map((error, i) => (
                    <li key={i} className="text-red-600">• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {importResults.warnings.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-yellow-600">Warnings</h4>
                <ul className="text-sm space-y-1">
                  {importResults.warnings.map((warning, i) => (
                    <li key={i} className="text-yellow-600">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Start New Import
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Preview Modal */}
      <ImportPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={confirmImport}
        analysisResult={analysisResults}
        previewData={previewData}
        requiredFieldsErrors={validationErrors}
        warnings={validationWarnings}
      />
    </div>
    </ImportErrorBoundary>
  );
};

export default OneClickAIImport;