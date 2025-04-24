
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { WorkflowStep } from '@/types/workflow-types';

interface WorkflowProgressProps {
  steps: WorkflowStep[];
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ steps }) => {
  const completedSteps = steps?.filter(s => s.isComplete).length || 0;
  const totalSteps = steps?.length || 0;
  const progressPercentage = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Progress</span>
        <span className="text-sm text-muted-foreground">
          {completedSteps} / {totalSteps} steps
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default WorkflowProgress;
