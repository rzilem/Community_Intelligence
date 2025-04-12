
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SystemSettingsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 mt-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
};

export default SystemSettingsSkeleton;
