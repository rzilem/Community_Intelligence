
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export interface ApiErrorProps {
  error: Error | null;
  onRetry?: () => void;
  title?: string;
  className?: string;
  compact?: boolean;
  showDetails?: boolean;
}

const ApiError: React.FC<ApiErrorProps> = ({
  error,
  onRetry,
  title = 'Error',
  className = '',
  compact = false,
  showDetails = true
}) => {
  if (!error) return null;

  // Extract more specific error message if available
  const errorDetails = error.message || 'An unexpected error occurred';
  const errorCode = (error as any).code || '';
  const errorHint = (error as any).hint || '';
  const pgError = (error as any).details || '';

  return (
    <Alert variant="destructive" className={`mb-4 ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-semibold">{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="text-sm space-y-1">
          <p>{errorDetails}</p>
          {showDetails && !compact && errorCode && (
            <p className="text-xs opacity-80">Code: {errorCode}</p>
          )}
          {showDetails && !compact && errorHint && (
            <p className="text-xs opacity-80">Hint: {errorHint}</p>
          )}
          {showDetails && !compact && pgError && (
            <p className="text-xs opacity-80">Details: {pgError}</p>
          )}
        </div>
        
        {onRetry && (
          <Button 
            variant="destructive" 
            size="sm" 
            className="mt-2 bg-red-700 hover:bg-red-800"
            onClick={onRetry}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ApiError;
