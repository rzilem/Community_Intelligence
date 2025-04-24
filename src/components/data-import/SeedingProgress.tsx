
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

interface SeedingProgressProps {
  progress: number;
}

export const SeedingProgress: React.FC<SeedingProgressProps> = ({ progress }) => {
  if (progress === 0) return null;

  return (
    <div className="space-y-2 mt-4">
      <Label>Progress</Label>
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-center text-muted-foreground">{progress}% complete</p>
    </div>
  );
};
