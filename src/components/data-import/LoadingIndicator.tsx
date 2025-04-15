
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-md">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
      <p className="text-sm font-medium text-center">{message}</p>
      <p className="text-xs text-muted-foreground mt-1 text-center">
        This may take a few moments depending on the file size
      </p>
    </div>
  );
};

export default LoadingIndicator;
