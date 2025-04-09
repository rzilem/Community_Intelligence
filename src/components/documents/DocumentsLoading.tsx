
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const DocumentsLoading: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-medium">Loading documents...</h3>
        <p className="text-muted-foreground">Please wait while we fetch your documents</p>
      </CardContent>
    </Card>
  );
};

export default DocumentsLoading;
