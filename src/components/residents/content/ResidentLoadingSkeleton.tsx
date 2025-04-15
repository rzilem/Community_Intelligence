
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface ResidentLoadingSkeletonProps {
  count?: number;
}

export const ResidentLoadingSkeleton: React.FC<ResidentLoadingSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            
            <div className="space-y-2 mt-4">
              <Skeleton className="h-4 w-full max-w-xs" />
              <Skeleton className="h-4 w-full max-w-xs" />
              <Skeleton className="h-4 w-full max-w-xs" />
              <Skeleton className="h-4 w-full max-w-xs" />
            </div>
          </CardContent>
          <CardFooter className="px-4 py-2 border-t flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </CardFooter>
        </Card>
      ))}
    </>
  );
};
