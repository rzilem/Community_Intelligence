
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again."
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {description}
      </p>

      {resetError && (
        <Button onClick={resetError} className="mb-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}

      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 text-left max-w-full">
          <summary className="cursor-pointer text-sm text-gray-500">
            Error Details
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-3 rounded border overflow-auto max-h-32 max-w-full">
            {error.toString()}
          </pre>
        </details>
      )}
    </div>
  );
};
