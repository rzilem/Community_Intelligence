
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DocumentsLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border rounded-md">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentsLoadingSkeleton;
