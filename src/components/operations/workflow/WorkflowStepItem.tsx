
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { WorkflowStep } from '@/types/workflow-types';
import { StepStatusButton } from './step/StepStatusButton';
import { StepContent } from './step/StepContent';

interface WorkflowStepItemProps {
  step: WorkflowStep;
  index: number;
  onComplete: (stepId: string) => void;
}

const WorkflowStepItem: React.FC<WorkflowStepItemProps> = ({ 
  step, 
  index,
  onComplete 
}) => {
  return (
    <Card className={cn(
      "border-l-4",
      step.isComplete ? "border-l-green-500" : "border-l-gray-300"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <StepStatusButton 
            isComplete={step.isComplete}
            isDisabled={step.isComplete}
            onClick={() => onComplete(step.id)}
          />
          <StepContent 
            name={step.name}
            description={step.description}
            index={index}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowStepItem;
