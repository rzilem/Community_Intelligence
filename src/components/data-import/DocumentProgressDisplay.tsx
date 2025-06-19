
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Pause, Play, Square, AlertCircle } from 'lucide-react';
import { ProcessingProgress } from '@/services/import-export/document-storage-processor';

interface DocumentProgressDisplayProps {
  progress: ProcessingProgress;
  onCancel: () => void;
  onResume?: () => void;
  isProcessing: boolean;
  canResume: boolean;
}

const DocumentProgressDisplay: React.FC<DocumentProgressDisplayProps> = ({
  progress,
  onCancel,
  onResume,
  isProcessing,
  canResume
}) => {
  const getStageMessage = () => {
    switch (progress.stage) {
      case 'analyzing':
        return 'Analyzing ZIP file structure...';
      case 'extracting':
        return 'Extracting files and folders...';
      case 'creating':
        return 'Creating association and properties...';
      case 'uploading':
        return 'Processing and uploading documents...';
      case 'complete':
        return 'Import completed successfully!';
      case 'error':
        return 'Import failed';
      default:
        return progress.message;
    }
  };

  const getStageColor = () => {
    switch (progress.stage) {
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isProcessing && progress.stage !== 'complete' && progress.stage !== 'error' && (
            <Loader2 className="h-5 w-5 animate-spin" />
          )}
          {progress.stage === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
          Document Import Progress
        </CardTitle>
        <CardDescription>{getStageMessage()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(progress.progress)}%</span>
          </div>
          <Progress value={progress.progress} className="h-2" />
        </div>

        {/* Detailed Progress */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Files Processed:</span>
              <span className="font-medium">{progress.filesProcessed} / {progress.totalFiles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Units Processed:</span>
              <span className="font-medium">{progress.unitsProcessed} / {progress.totalUnits}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Stage:</span>
              <span className="font-medium capitalize">{progress.stage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${progress.stage === 'error' ? 'text-red-600' : 'text-blue-600'}`}>
                {progress.stage === 'error' ? 'Failed' : 'Processing'}
              </span>
            </div>
          </div>
        </div>

        {/* Current Message */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">{progress.message}</p>
        </div>

        {/* Stage Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${getStageColor()}`}
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isProcessing && progress.stage !== 'complete' && progress.stage !== 'error' && (
            <Button onClick={onCancel} variant="outline" size="sm">
              <Square className="h-4 w-4 mr-2" />
              Cancel Import
            </Button>
          )}
          
          {canResume && onResume && !isProcessing && (
            <Button onClick={onResume} variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Resume Import
            </Button>
          )}
        </div>

        {/* Help Text */}
        {progress.stage === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              The import process encountered an error. You can try to resume the import or start over with a different ZIP file.
            </p>
          </div>
        )}

        {canResume && progress.stage !== 'complete' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Import progress has been saved. You can resume from where you left off or start a new import.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentProgressDisplay;
