
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Upload,
  FileCheck,
  Search,
  CheckCircle,
  AlertTriangle,
  Zap,
  Download,
  Settings,
  PlayCircle,
  PauseCircle,
  SkipForward
} from 'lucide-react';
import DuplicateDetectionDashboard from './DuplicateDetectionDashboard';
import DataQualityDashboard from './DataQualityDashboard';
import { enhancedDuplicateDetectionService } from '@/services/import-export/enhanced-duplicate-detection-service';
import { dataQualityService } from '@/services/import-export/data-quality-service';
import type { EnhancedDuplicateDetectionResult } from '@/services/import-export/enhanced-duplicate-detection-service';
import type { DataQualityReport } from '@/services/import-export/data-quality-service';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  progress: number;
  results?: any;
  canSkip: boolean;
  isOptional: boolean;
}

interface SmartImportWorkflowProps {
  files: Array<{ filename: string; data: any[] }>;
  onComplete: (results: any) => void;
  onCancel: () => void;
}

const SmartImportWorkflow: React.FC<SmartImportWorkflowProps> = ({
  files,
  onComplete,
  onCancel
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duplicateResults, setDuplicateResults] = useState<EnhancedDuplicateDetectionResult | null>(null);
  const [qualityResults, setQualityResults] = useState<DataQualityReport | null>(null);
  const [finalResults, setFinalResults] = useState<any>(null);

  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'file-analysis',
      name: 'File Analysis',
      description: 'Analyzing uploaded files and detecting formats',
      icon: <FileCheck className="h-5 w-5" />,
      status: 'pending',
      progress: 0,
      canSkip: false,
      isOptional: false
    },
    {
      id: 'duplicate-detection',
      name: 'Duplicate Detection',
      description: 'Finding duplicate records across files',
      icon: <Search className="h-5 w-5" />,
      status: 'pending',
      progress: 0,
      canSkip: true,
      isOptional: true
    },
    {
      id: 'quality-assessment',
      name: 'Quality Assessment',
      description: 'Evaluating data quality and identifying issues',
      icon: <CheckCircle className="h-5 w-5" />,
      status: 'pending',
      progress: 0,
      canSkip: true,
      isOptional: true
    },
    {
      id: 'auto-fix',
      name: 'Auto-Fix Issues',
      description: 'Automatically fixing detected issues',
      icon: <Zap className="h-5 w-5" />,
      status: 'pending',
      progress: 0,
      canSkip: true,
      isOptional: true
    },
    {
      id: 'final-review',
      name: 'Final Review',
      description: 'Review all changes before import',
      icon: <AlertTriangle className="h-5 w-5" />,
      status: 'pending',
      progress: 0,
      canSkip: false,
      isOptional: false
    },
    {
      id: 'import',
      name: 'Import Data',
      description: 'Importing cleaned data into the system',
      icon: <Upload className="h-5 w-5" />,
      status: 'pending',
      progress: 0,
      canSkip: false,
      isOptional: false
    }
  ]);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (isRunning && !isPaused && currentStep?.status === 'pending') {
      executeCurrentStep();
    }
  }, [currentStepIndex, isRunning, isPaused]);

  const executeCurrentStep = async () => {
    const step = steps[currentStepIndex];
    
    setSteps(prev => prev.map((s, i) => 
      i === currentStepIndex ? { ...s, status: 'running', progress: 0 } : s
    ));

    try {
      switch (step.id) {
        case 'file-analysis':
          await executeFileAnalysis();
          break;
        case 'duplicate-detection':
          await executeDuplicateDetection();
          break;
        case 'quality-assessment':
          await executeQualityAssessment();
          break;
        case 'auto-fix':
          await executeAutoFix();
          break;
        case 'final-review':
          await executeFinalReview();
          break;
        case 'import':
          await executeImport();
          break;
      }
      
      setSteps(prev => prev.map((s, i) => 
        i === currentStepIndex ? { ...s, status: 'completed', progress: 100 } : s
      ));
      
      // Move to next step
      if (currentStepIndex < steps.length - 1) {
        setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1);
        }, 1000);
      } else {
        // Workflow complete
        setIsRunning(false);
        onComplete(finalResults);
      }
      
    } catch (error) {
      console.error(`Error in step ${step.id}:`, error);
      setSteps(prev => prev.map((s, i) => 
        i === currentStepIndex ? { ...s, status: 'error', progress: 0 } : s
      ));
      setIsRunning(false);
    }
  };

  const executeFileAnalysis = async () => {
    // Simulate file analysis with progress
    for (let i = 0; i <= 100; i += 10) {
      setSteps(prev => prev.map((s, idx) => 
        idx === currentStepIndex ? { ...s, progress: i } : s
      ));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Analyze files
    const analysis = {
      totalFiles: files.length,
      totalRecords: files.reduce((sum, file) => sum + file.data.length, 0),
      fileTypes: files.map(f => f.filename.split('.').pop()).filter(Boolean),
      largestFile: files.reduce((max, file) => file.data.length > max.data.length ? file : max, files[0])
    };
    
    setSteps(prev => prev.map((s, idx) => 
      idx === currentStepIndex ? { ...s, results: analysis } : s
    ));
  };

  const executeDuplicateDetection = async () => {
    const results = await enhancedDuplicateDetectionService.detectDuplicatesAdvanced(files);
    setDuplicateResults(results);
    
    setSteps(prev => prev.map((s, idx) => 
      idx === currentStepIndex ? { ...s, results } : s
    ));
  };

  const executeQualityAssessment = async () => {
    const allData = files.flatMap(file => file.data);
    const results = await dataQualityService.assessDataQuality(allData);
    setQualityResults(results);
    
    setSteps(prev => prev.map((s, idx) => 
      idx === currentStepIndex ? { ...s, results } : s
    ));
  };

  const executeAutoFix = async () => {
    if (!qualityResults) return;
    
    const allData = files.flatMap(file => file.data);
    const { fixedData, fixedIssues } = await dataQualityService.autoFixIssues(allData, qualityResults.issues);
    
    const results = { fixedData, fixedIssues: fixedIssues.length };
    setSteps(prev => prev.map((s, idx) => 
      idx === currentStepIndex ? { ...s, results } : s
    ));
  };

  const executeFinalReview = async () => {
    // Prepare final summary
    const summary = {
      duplicatesFound: duplicateResults?.totalDuplicates || 0,
      qualityScore: qualityResults?.overallScore || 100,
      issuesFixed: steps.find(s => s.id === 'auto-fix')?.results?.fixedIssues || 0,
      readyForImport: true
    };
    
    setFinalResults(summary);
    setSteps(prev => prev.map((s, idx) => 
      idx === currentStepIndex ? { ...s, results: summary } : s
    ));
  };

  const executeImport = async () => {
    // Simulate import process
    for (let i = 0; i <= 100; i += 5) {
      setSteps(prev => prev.map((s, idx) => 
        idx === currentStepIndex ? { ...s, progress: i } : s
      ));
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const results = {
      recordsImported: files.reduce((sum, file) => sum + file.data.length, 0),
      successRate: 98.5
    };
    
    setSteps(prev => prev.map((s, idx) => 
      idx === currentStepIndex ? { ...s, results } : s
    ));
  };

  const startWorkflow = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseWorkflow = () => {
    setIsPaused(true);
  };

  const resumeWorkflow = () => {
    setIsPaused(false);
  };

  const skipCurrentStep = () => {
    if (currentStep.canSkip) {
      setSteps(prev => prev.map((s, i) => 
        i === currentStepIndex ? { ...s, status: 'skipped', progress: 0 } : s
      ));
      
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      }
    }
  };

  const getStepStatusIcon = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'running':
        return <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'skipped':
        return <SkipForward className="h-5 w-5 text-gray-400" />;
      default:
        return step.icon;
    }
  };

  const getStepStatusColor = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed': return 'border-green-500 bg-green-50';
      case 'running': return 'border-blue-500 bg-blue-50';
      case 'error': return 'border-red-500 bg-red-50';
      case 'skipped': return 'border-gray-300 bg-gray-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Smart Import Workflow</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Automated data processing with quality checks and duplicate detection
              </p>
            </div>
            <div className="flex gap-2">
              {!isRunning ? (
                <Button onClick={startWorkflow} className="gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Start Workflow
                </Button>
              ) : (
                <>
                  {isPaused ? (
                    <Button onClick={resumeWorkflow} variant="outline" className="gap-2">
                      <PlayCircle className="h-4 w-4" />
                      Resume
                    </Button>
                  ) : (
                    <Button onClick={pauseWorkflow} variant="outline" className="gap-2">
                      <PauseCircle className="h-4 w-4" />
                      Pause
                    </Button>
                  )}
                  {currentStep?.canSkip && (
                    <Button onClick={skipCurrentStep} variant="outline" className="gap-2">
                      <SkipForward className="h-4 w-4" />
                      Skip Step
                    </Button>
                  )}
                </>
              )}
              <Button onClick={onCancel} variant="ghost">
                Cancel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps List */}
        <div className="lg:col-span-1 space-y-3">
          {steps.map((step, index) => (
            <Card 
              key={step.id} 
              className={`border-2 transition-all ${getStepStatusColor(step)} ${
                index === currentStepIndex ? 'ring-2 ring-blue-200' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStepStatusIcon(step)}
                    <span className="font-medium">{step.name}</span>
                  </div>
                  <div className="flex gap-1">
                    {step.isOptional && (
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    )}
                    {step.canSkip && (
                      <Badge variant="outline" className="text-xs">Skippable</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                
                {step.status === 'running' && (
                  <Progress value={step.progress} className="h-2" />
                )}
                
                {step.results && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {step.id === 'file-analysis' && (
                      <div>
                        {step.results.totalFiles} files, {step.results.totalRecords} records
                      </div>
                    )}
                    {step.id === 'duplicate-detection' && (
                      <div>
                        {step.results.totalDuplicates} duplicates found
                      </div>
                    )}
                    {step.id === 'quality-assessment' && (
                      <div>
                        Quality Score: {step.results.overallScore}%
                      </div>
                    )}
                    {step.id === 'auto-fix' && (
                      <div>
                        {step.results.fixedIssues} issues fixed
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Step Details */}
        <div className="lg:col-span-2">
          {currentStep?.id === 'duplicate-detection' && duplicateResults && (
            <DuplicateDetectionDashboard
              results={duplicateResults}
              onResolveMatch={(matchId, action) => console.log('Resolve match:', matchId, action)}
              onResolveCluster={(clusterId, action) => console.log('Resolve cluster:', clusterId, action)}
            />
          )}
          
          {currentStep?.id === 'quality-assessment' && qualityResults && (
            <DataQualityDashboard
              report={qualityResults}
              onAutoFix={() => console.log('Auto-fix triggered')}
              onResolveIssue={(issueId) => console.log('Resolve issue:', issueId)}
            />
          )}
          
          {currentStep?.id === 'final-review' && finalResults && (
            <Card>
              <CardHeader>
                <CardTitle>Final Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Data processing complete! Review the summary below before proceeding with import.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold">{finalResults.duplicatesFound}</div>
                      <div className="text-sm text-muted-foreground">Duplicates Found</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold">{finalResults.qualityScore}%</div>
                      <div className="text-sm text-muted-foreground">Quality Score</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold">{finalResults.issuesFixed}</div>
                      <div className="text-sm text-muted-foreground">Issues Fixed</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {finalResults.readyForImport ? 'Ready' : 'Not Ready'}
                      </div>
                      <div className="text-sm text-muted-foreground">Import Status</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {(!currentStep || currentStep.id === 'file-analysis') && (
            <Card>
              <CardHeader>
                <CardTitle>Workflow Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    This intelligent workflow will process your data through multiple quality and 
                    duplicate detection steps to ensure the highest import success rate.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold">{files.length}</div>
                      <div className="text-sm text-muted-foreground">Files to Process</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {files.reduce((sum, file) => sum + file.data.length, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Records</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold">{steps.length}</div>
                      <div className="text-sm text-muted-foreground">Processing Steps</div>
                    </div>
                  </div>
                  
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      You can pause, skip optional steps, or customize the workflow at any time. 
                      Critical steps cannot be skipped to ensure data integrity.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartImportWorkflow;
