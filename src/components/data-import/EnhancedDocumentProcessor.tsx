
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Upload,
  BarChart3,
  FileImage,
  Table,
  FormInput
} from 'lucide-react';
import { intelligentContentAnalyzer, type IntelligentAnalysisResult } from '@/services/import-export/intelligent-content-analyzer';
import { useToast } from '@/hooks/use-toast';
import TooltipButton from '@/components/ui/tooltip-button';

interface EnhancedDocumentProcessorProps {
  onAnalysisComplete?: (result: IntelligentAnalysisResult) => void;
  onFileSelect?: (file: File) => void;
}

const EnhancedDocumentProcessor: React.FC<EnhancedDocumentProcessorProps> = ({
  onAnalysisComplete,
  onFileSelect
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<IntelligentAnalysisResult | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
      onFileSelect?.(file);
    }
  }, [onFileSelect]);

  const processDocument = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setProcessingStage('Initializing...');

    try {
      // Simulate progress updates
      const stages = [
        'Reading document format...',
        'Extracting content...',
        'Analyzing structure...',
        'Running AI analysis...',
        'Assessing quality...',
        'Generating recommendations...',
        'Finalizing analysis...'
      ];

      for (let i = 0; i < stages.length; i++) {
        setProcessingStage(stages[i]);
        setProgress(((i + 1) / stages.length) * 90);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Perform actual analysis
      const result = await intelligentContentAnalyzer.analyzeDocument(selectedFile);
      
      setProgress(100);
      setProcessingStage('Complete!');
      setAnalysisResult(result);
      onAnalysisComplete?.(result);

      toast({
        title: "Analysis Complete",
        description: `Document analyzed with ${result.confidence * 100}% confidence`,
      });

    } catch (error) {
      console.error('Document processing failed:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
      setProgress(0);
    }
  }, [selectedFile, onAnalysisComplete, toast]);

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Enhanced Document Intelligence
          </CardTitle>
          <CardDescription>
            Upload documents for AI-powered analysis with advanced OCR, table extraction, and quality assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Select Document
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.csv,.xlsx,.xls,.doc,.docx"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <Badge variant="outline">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>
              <TooltipButton
                onClick={processDocument}
                disabled={isProcessing}
                tooltip="Start intelligent document analysis"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin mr-2">⚡</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Analyze Document
                  </>
                )}
              </TooltipButton>
            </div>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{processingStage}</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analysis Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.dataType}
                    </div>
                    <div className="text-sm text-slate-500">Data Type</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getQualityColor(analysisResult.confidence * 100)}`}>
                      {(analysisResult.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-slate-500">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResult.structuralAnalysis.recordCount}
                    </div>
                    <div className="text-sm text-slate-500">Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisResult.structuralAnalysis.fieldCount}
                    </div>
                    <div className="text-sm text-slate-500">Fields</div>
                  </div>
                </div>

                {/* Document Features */}
                <div className="space-y-2">
                  <h4 className="font-medium">Document Features</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {analysisResult.metadata.documentFormat.toUpperCase()}
                    </Badge>
                    {analysisResult.metadata.hasStructuredData && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Table className="h-3 w-3" />
                        Structured Data
                      </Badge>
                    )}
                    {analysisResult.metadata.ocrQuality && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <FileImage className="h-3 w-3" />
                        OCR Quality: {analysisResult.metadata.ocrQuality}%
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Processing Strategy */}
                <div className="space-y-2">
                  <h4 className="font-medium">Recommended Processing</h4>
                  <Badge variant={analysisResult.processingStrategy.recommendedApproach === 'direct_import' ? 'default' : 'secondary'}>
                    {analysisResult.processingStrategy.recommendedApproach.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Quality Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quality Scores */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getQualityColor(analysisResult.qualityAssessment.overallScore)}`}>
                      {analysisResult.qualityAssessment.overallScore}%
                    </div>
                    <div className="text-sm text-slate-500">Overall</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getQualityColor(analysisResult.qualityAssessment.completeness)}`}>
                      {analysisResult.qualityAssessment.completeness}%
                    </div>
                    <div className="text-sm text-slate-500">Completeness</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getQualityColor(analysisResult.qualityAssessment.consistency)}`}>
                      {analysisResult.qualityAssessment.consistency}%
                    </div>
                    <div className="text-sm text-slate-500">Consistency</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getQualityColor(analysisResult.qualityAssessment.accuracy)}`}>
                      {analysisResult.qualityAssessment.accuracy}%
                    </div>
                    <div className="text-sm text-slate-500">Accuracy</div>
                  </div>
                </div>

                {/* Quality Issues */}
                {analysisResult.qualityAssessment.issues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Quality Issues</h4>
                    <div className="space-y-2">
                      {analysisResult.qualityAssessment.issues.map((issue, index) => (
                        <Alert key={index} variant={issue.severity === 'critical' ? 'destructive' : 'default'}>
                          {issue.severity === 'critical' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          <AlertDescription className="flex justify-between items-center">
                            <span>{issue.description}</span>
                            <Badge variant={getQualityBadgeVariant(issue.severity === 'critical' ? 0 : issue.severity === 'high' ? 40 : 80)}>
                              {issue.severity}
                            </Badge>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="h-5 w-5" />
                  Structural Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Field Types */}
                <div className="space-y-2">
                  <h4 className="font-medium">Field Types</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(analysisResult.structuralAnalysis.fieldTypes).map(([field, type]) => (
                      <div key={field} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-sm font-medium">{field}</span>
                        <Badge variant="outline">{type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Patterns */}
                {analysisResult.structuralAnalysis.dataPatterns.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Detected Patterns</h4>
                    <div className="space-y-2">
                      {analysisResult.structuralAnalysis.dataPatterns.map((pattern, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{pattern.pattern}</span>
                            <Badge variant="outline">{(pattern.confidence * 100).toFixed(0)}%</Badge>
                          </div>
                          <p className="text-sm text-slate-600">{pattern.description}</p>
                          {pattern.examples.length > 0 && (
                            <div className="text-xs text-slate-500 mt-1">
                              Examples: {pattern.examples.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Relationships */}
                {analysisResult.structuralAnalysis.relationshipPotential.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Potential Relationships</h4>
                    <div className="space-y-2">
                      {analysisResult.structuralAnalysis.relationshipPotential.map((rel, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                          <span className="text-sm">{rel.field1} → {rel.field2}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{rel.type}</Badge>
                            <Badge variant="outline">{rel.score}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recommendations List */}
                <div className="space-y-2">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>

                {/* Processing Steps */}
                {analysisResult.processingStrategy.preprocessingSteps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Preprocessing Steps</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {analysisResult.processingStrategy.preprocessingSteps.map((step, index) => (
                        <li key={index} className="text-sm text-slate-600">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Validation Rules */}
                {analysisResult.processingStrategy.validationRules.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Validation Rules</h4>
                    <div className="space-y-2">
                      {analysisResult.processingStrategy.validationRules.map((rule, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                          <div>
                            <span className="font-medium">{rule.field}</span>
                            <p className="text-sm text-slate-600">{rule.message}</p>
                          </div>
                          <Badge variant={rule.severity === 'error' ? 'destructive' : 'secondary'}>
                            {rule.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default EnhancedDocumentProcessor;
