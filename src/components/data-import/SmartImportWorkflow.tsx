
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { multiFormatProcessor } from '@/services/import-export/multi-format-processor';
import { enhancedDuplicateDetectionService } from '@/services/import-export/enhanced-duplicate-detection-service';
import { dataQualityService } from '@/services/import-export/data-quality-service';
import { toast } from 'sonner';
import FileUploader from './FileUploader';
import { Switch } from '@/components/ui/switch';
import { zipParserService } from '@/services/import-export/zip-parser-service';
import type { ZipAnalysisResult } from '@/services/import-export/zip-parser-service';
import { ZipContentSummary } from './ZipContentSummary';
import CreateOnboardingProjectModal from '@/components/onboarding/CreateOnboardingProjectModal';
import { useNavigate } from 'react-router-dom';
interface SmartImportWorkflowProps {
  onImportComplete?: (data: any) => void;
}

const SmartImportWorkflow: React.FC<SmartImportWorkflowProps> = ({ onImportComplete }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [zipSummary, setZipSummary] = useState<ZipAnalysisResult | null>(null);
  const [attemptPdfTableExtraction, setAttemptPdfTableExtraction] = useState(false);
  const [showZipSummary, setShowZipSummary] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleFileSelected = async (selectedFile: File) => {
    setFiles([selectedFile]);
    setResults(null);
    setZipSummary(null);
    setShowZipSummary(false);
    if (selectedFile.name.toLowerCase().endsWith('.zip')) {
      try {
        const summary = await zipParserService.parseZipFile(selectedFile, { enablePdfOcr: attemptPdfTableExtraction });
        setZipSummary(summary);
        const pdfsWithoutRows = summary.files.filter(f => f.detectedType === 'pdf_document' && (f.data?.length || 0) === 0).length;
        const hint = pdfsWithoutRows > 0 ? ` • ${pdfsWithoutRows} PDF(s) without table-like text` : '';
        toast.success(`ZIP analyzed: ${summary.files.length} files, ${summary.totalRecords} rows${hint}`);
      } catch (err: any) {
        toast.error('Failed to analyze ZIP');
        console.error('ZIP analysis error:', err);
      }
    }
  };
  const processFiles = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setProgress(10);

    try {
      // Step 1: Process files
      setProgress(30);
      const processedData = await multiFormatProcessor.processWithEnhancedAnalysis(files, {
        enableOCR: attemptPdfTableExtraction,
        enableDuplicateDetection: true,
        enableQualityAssessment: true,
        enableAutoFix: true,
        fallbackToOCR: attemptPdfTableExtraction
      });

      // Step 2: Enhanced duplicate detection
      setProgress(60);
      if (processedData.processedDocuments.length > 1) {
        const fileData = processedData.processedDocuments.map(doc => ({
          filename: doc.filename,
          data: doc.data
        }));

        const duplicateResults = await enhancedDuplicateDetectionService.detectDuplicatesAdvanced(
          fileData,
          {
            strictMode: false,
            fuzzyMatching: true,
            confidenceThreshold: 0.7,
            semanticAnalysis: true
          }
        );

        processedData.duplicateResults = duplicateResults;
      }

      // Step 3: Quality assessment
      setProgress(80);
      if (processedData.processedDocuments.length > 0) {
        const allData = processedData.processedDocuments.flatMap(doc => doc.data);
        const qualityResults = await dataQualityService.assessDataQuality(allData);
        processedData.qualityResults = qualityResults;
      }

      setProgress(100);
      setResults(processedData);
      toast.success('Files processed successfully!');
      
      if (onImportComplete) {
        onImportComplete(processedData);
      }
    } catch (error: any) {
      toast.error(`Processing failed: ${error.message}`);
      console.error('Processing error:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Smart Import Workflow</CardTitle>
          <CardDescription>
            Upload files for intelligent processing with AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploader
            onFileSelected={handleFileSelected}
            selectedFile={files[0] || null}
          />

          {files.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {files.length} file(s) selected
              </p>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Attempt PDF table extraction (beta)</p>
                  <p className="text-xs text-muted-foreground">Tries to extract simple tables from PDFs when possible.</p>
                </div>
                <Switch checked={attemptPdfTableExtraction} onCheckedChange={setAttemptPdfTableExtraction} />
              </div>
              <Button 
                onClick={processFiles} 
                disabled={processing}
                className="w-full"
              >
                {processing ? 'Processing...' : 'Start Smart Import'}
              </Button>

              {zipSummary && (
                <div className="space-y-2">
                  {zipSummary.files.some(f => f.detectedType === 'pdf_document' && (f.data?.length || 0) === 0) && (
                    <p className="text-xs text-muted-foreground">
                      Some PDFs don’t contain selectable table-like text. Enable the toggle above to attempt extraction.
                    </p>
                  )}
                  <Button variant="secondary" onClick={() => setShowZipSummary(v => !v)}>
                    {showZipSummary ? 'Hide ZIP Content Summary' : 'View ZIP Content Summary'}
                  </Button>
                  {showZipSummary && (
                    <ZipContentSummary summary={zipSummary} />
                  )}
                </div>
              )}
            </div>
          )}

          {processing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Processing files... {progress}%
              </p>
            </div>
          )}

          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Files Processed</p>
                    <p className="text-2xl font-bold">{results.processingStats.successfulFiles}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Processing Time</p>
                    <p className="text-2xl font-bold">{Math.round(results.processingStats.totalProcessingTime / 1000)}s</p>
                  </div>
                </div>

                {results.duplicateResults && (
                  <div>
                    <p className="text-sm font-medium">Duplicates Found</p>
                    <p className="text-2xl font-bold">{results.duplicateResults.totalDuplicates}</p>
                  </div>
                )}

                {results.qualityResults && (
                  <div>
                    <p className="text-sm font-medium">Data Quality Score</p>
                    <p className="text-2xl font-bold">{results.qualityResults.overallScore}%</p>
                  </div>
                )}

                {results.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recommendations</p>
                    <ul className="list-disc list-inside space-y-1">
                      {results.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2">
                  <Button onClick={() => setIsCreateModalOpen(true)} className="w-full">
                    Create Onboarding Project
                  </Button>
                </div>

                <CreateOnboardingProjectModal
                  open={isCreateModalOpen}
                  onOpenChange={setIsCreateModalOpen}
                  defaultName={(files[0]?.name || 'Imported Project').replace(/\.[^/.]+$/, '')}
                  onCreated={(id) => navigate(`/lead-management/onboarding/${id}`)}
                />
              </CardContent>
            </Card>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default SmartImportWorkflow;
