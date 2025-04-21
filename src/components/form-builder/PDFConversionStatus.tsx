
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Clock, AlertCircle } from 'lucide-react';

interface PDFConversionStatusProps {
  status: string;
  filename: string;
  createdAt: string;
  error?: string;
}

export const PDFConversionStatus: React.FC<PDFConversionStatusProps> = ({
  status,
  filename,
  createdAt,
  error
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {getStatusIcon()}
          {filename}
        </CardTitle>
        <CardDescription className="text-xs">
          Started {new Date(createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      {error && (
        <CardContent className="pt-2">
          <p className="text-xs text-red-500">{error}</p>
        </CardContent>
      )}
    </Card>
  );
}
