
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingIndicatorProps {
  message: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin">
            <RefreshCw className="h-8 w-8 text-primary" />
          </div>
          <p>{message}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingIndicator;
