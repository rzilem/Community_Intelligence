
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, Pause, Play, X, Clock, HardDrive } from 'lucide-react';
import { ProcessingProgress } from '@/services/import-export/document-storage-processor';
import { formatBytes } from '@/lib/utils';

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
  const getStatusColor = () => {
    switch (progress.stage) {
      case 'complete': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'paused': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusIcon = () => {
    switch (progress.stage) {
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          Document Import Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{progress.message}</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress.progress)}%
            </span>
          </div>
          <Progress value={progress.progress} className="w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between">
              <span>Files:</span>
              <span>{progress.filesProcessed} / {progress.totalFiles}</span>
            </div>
            <div className="flex justify-between">
              <span>Units:</span>
              <span>{progress.unitsProcessed} / {progress.totalUnits}</span>
            </div>
          </div>
          <div>
            {progress.estimatedTimeRemaining && (
              <div className="flex justify-between items-center">
                <Clock className="h-3 w-3" />
                <span>{progress.estimatedTimeRemaining}</span>
              </div>
            )}
            {progress.memoryUsage && (
              <div className="flex justify-between items-center">
                <HardDrive className="h-3 w-3" />
                <span>{Math.round(progress.memoryUsage)}% memory</span>
              </div>
            )}
          </div>
        </div>

        {progress.currentFile && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-sm font-medium">Currently processing:</div>
            <div className="text-sm text-muted-foreground">
              {progress.currentFile}
              {progress.currentFileSize && (
                <span className="ml-2">({formatBytes(progress.currentFileSize)})</span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {isProcessing && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          
          {canResume && onResume && !isProcessing && (
            <Button onClick={onResume} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Resume Import
            </Button>
          )}
        </div>

        {progress.stage === 'error' && canResume && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800">
              <strong>Import Paused:</strong> You can resume this import later to continue from where it left off.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentProgressDisplay;
