
import React from 'react';
import WorkflowStepItem from './WorkflowStepItem';
import { WorkflowStep } from '@/types/workflow-types';

interface WorkflowStepsListProps {
  steps: WorkflowStep[];
  onCompleteStep: (stepId: string) => void;
}

const WorkflowStepsList: React.FC<WorkflowStepsListProps> = ({ steps, onCompleteStep }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <p className="text-muted-foreground">No steps have been added to this workflow</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <WorkflowStepItem
          key={step.id}
          step={step}
          index={index}
          onComplete={onCompleteStep}
        />
      ))}
    </div>
  );
};

export default WorkflowStepsList;
